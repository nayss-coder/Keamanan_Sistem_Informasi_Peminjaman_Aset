#!/bin/bash

# Konfigurasi URL Target (Ubah port ke 9080 jika lewat APISIX)
TARGET_URL=${1:-"http://localhost:3000"}

# Kode Warna Terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================
🛡️  SIMULASI PENGUJIAN KEAMANAN SI-ALAT
Target: $TARGET_URL
=============================================${NC}"

# --- TEST 6: Akses dengan token JWT palsu ---
echo -e "\n${YELLOW}[TEST] TEST 6: Akses dengan token JWT palsu${NC}"
response_code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer token_jwt_palsu_123" "$TARGET_URL/api/peralatan")

if [ "$response_code" == "401" ] || [ "$response_code" == "403" ]; then
    echo -e "${GREEN}[PASS] Token palsu ditolak dengan status $response_code - Validasi JWT berjalan${NC}"
else
    echo -e "${RED}[FAIL] Token palsu tidak ditolak! Status code: $response_code${NC}"
fi

# --- Login sebagai Mahasiswa untuk mendapatkan token user biasa ---
echo -e "\n${BLUE}[INFO] Login sebagai Mahasiswa (andi@student.ac.id)...${NC}"
login_mhs=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"andi@student.ac.id","password":"mhs123"}' \
  "$TARGET_URL/api/auth/login")

token_mhs=$(echo "$login_mhs" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$token_mhs" ]; then
    echo -e "${RED}[ERROR] Gagal mendapatkan token Mahasiswa. Pastikan server/database aktif.${NC}"
else
    echo -e "${GREEN}[SUCCESS] Berhasil mendapatkan token Mahasiswa.${NC}"
fi

# --- TEST 7: Akses endpoint ADMIN dengan role USER (Mahasiswa) ---
echo -e "\n${YELLOW}[TEST] TEST 7: Akses endpoint ADMIN dengan role USER${NC}"
if [ -n "$token_mhs" ]; then
    echo -e "${BLUE}[INFO] Mencoba akses /api/admin/users dengan token user biasa...${NC}"
    response_code_admin=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token_mhs" "$TARGET_URL/api/admin/users")
    
    if [ "$response_code_admin" == "403" ]; then
        echo -e "${GREEN}[PASS] Akses admin ditolak dengan status 403 Forbidden - RBAC berjalan${NC}"
    else
        echo -e "${RED}[FAIL] Endpoint admin berhasil diakses atau mengembalikan status $response_code_admin${NC}"
    fi
else
    echo -e "${RED}[SKIP] TEST 7 dilewati karena token Mahasiswa kosong.${NC}"
fi

# --- TEST 8: Rate Limiting ---
echo -e "\n${YELLOW}[TEST] TEST 8: Rate Limiting - Mengirim 20 request berulang cepat${NC}"
echo -e "${BLUE}[INFO] Mengirim 20 request ke endpoint login dalam waktu singkat...${NC}"
success_req=0
blocked_req=0

for i in {1..20}
do
   # Request cepat
   status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" \
     -d '{"email":"admin@sialat.ac.id","password":"salah"}' \
     "$TARGET_URL/api/auth/login")
   
   if [ "$status" == "429" ]; then
       ((blocked_req++))
   else
       ((success_req++))
   fi
done

echo -e "${BLUE}[INFO] Request berhasil (tidak diblok): $success_req${NC}"
echo -e "${BLUE}[INFO] Request diblok: $blocked_req${NC}"

if [ "$blocked_req" -gt 0 ]; then
    echo -e "${GREEN}[PASS] Rate limiting aktif - sebagian request diblokir dengan status 429${NC}"
else
    echo -e "${YELLOW}[INFO] Rate limiting belum aktif di backend - Perlu dikonfigurasi di APISIX${NC}"
fi

# --- TEST 9: Simulasi Brute Force Login ---
echo -e "\n${YELLOW}[TEST] TEST 9: Simulasi Brute Force Login${NC}"
echo -e "${BLUE}[INFO] Mencoba berbagai kombinasi password...${NC}"
passwords=("123456" "password" "admin" "letmein" "qwerty" "admin123")

for pwd in "${passwords[@]}"
do
   status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" \
     -d "{\"email\":\"admin@sialat.ac.id\",\"password\":\"$pwd\"}" \
     "$TARGET_URL/api/auth/login")
   
   if [ "$status" == "200" ]; then
       echo -e "${GREEN}[INFO] Password '$pwd' - Response: $status (Berhasil)${NC}"
   else
       echo -e "${RED}[INFO] Password '$pwd' - Ditolak ($status)${NC}"
   fi
done

echo -e "${YELLOW}[INFO] Brute force tidak diblok otomatis - Rekomendasi: aktifkan rate limiting di APISIX${NC}"

# --- TEST 10: Cek koneksi Apache HertzBeat Monitoring ---
echo -e "\n${YELLOW}[TEST] TEST 10: Cek koneksi Apache HertzBeat Monitoring${NC}"
# Port default HertzBeat biasanya 1157, ganti jika berbeda
hertzbeat_status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://localhost:1157")

if [ "$hertzbeat_status" == "200" ] || [ "$hertzbeat_status" == "302" ]; then
    echo -e "${GREEN}[PASS] Akses berhasil dengan koneksi Apache HertzBeat aktif!${NC}"
else
    echo -e "${YELLOW}[INFO] Apache HertzBeat tidak terdeteksi aktif di localhost:1157 - Abaikan jika port berbeda.${NC}"
fi

echo -e "${BLUE}=============================================
🏁 PENGUJIAN SELESAI
=============================================${NC}"
