# PowerShell Security Testing Script for SI-ALAT
# Usage: .\test-security.ps1 -TargetUrl "http://localhost:3000"

param (
    [string]$TargetUrl = "http://localhost:3000"
)

# Enable TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🛡️  SIMULASI PENGUJIAN KEAMANAN SI-ALAT" -ForegroundColor Cyan
Write-Host "Target: $TargetUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# --- TEST 6: Akses dengan token JWT palsu ---
Write-Host ""
Write-Host "[TEST] TEST 6: Akses dengan token JWT palsu" -ForegroundColor Yellow

try {
    $headers = @{ "Authorization" = "Bearer token_jwt_palsu_123" }
    $res = Invoke-WebRequest -Uri "$TargetUrl/api/peralatan" -Headers $headers -Method Get -ErrorAction Stop
    $statusCode = $res.StatusCode
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if (-not $statusCode) { $statusCode = $_.Exception.Response.StatusCode }
}

if ($statusCode -eq 401 -or $statusCode -eq 403) {
    Write-Host "[PASS] Token palsu ditolak dengan status $statusCode - Validasi JWT berjalan" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Token palsu tidak ditolak! Status code: $statusCode" -ForegroundColor Red
}

# --- Login sebagai Mahasiswa untuk mendapatkan token user biasa ---
Write-Host ""
Write-Host "[INFO] Login sebagai Mahasiswa (andi@student.ac.id)..." -ForegroundColor Cyan
$tokenMhs = $null

try {
    $body = @{ email = "andi@student.ac.id"; password = "mhs123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$TargetUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    if ($loginRes.success) {
        $tokenMhs = $loginRes.data.token
        Write-Host "[SUCCESS] Berhasil mendapatkan token Mahasiswa." -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Gagal mendapatkan token Mahasiswa. Pastikan server/database aktif." -ForegroundColor Red
}

# --- TEST 7: Akses endpoint ADMIN dengan role USER (Mahasiswa) ---
Write-Host ""
Write-Host "[TEST] TEST 7: Akses endpoint ADMIN dengan role USER" -ForegroundColor Yellow

if ($tokenMhs) {
    Write-Host "[INFO] Mencoba akses /api/admin/users dengan token user biasa..." -ForegroundColor Cyan
    try {
        $headers = @{ "Authorization" = "Bearer $tokenMhs" }
        $adminRes = Invoke-WebRequest -Uri "$TargetUrl/api/admin/users" -Headers $headers -Method Get -ErrorAction Stop
        $statusCodeAdmin = $adminRes.StatusCode
    } catch {
        $statusCodeAdmin = $_.Exception.Response.StatusCode.Value__
        if (-not $statusCodeAdmin) { $statusCodeAdmin = $_.Exception.Response.StatusCode }
    }

    if ($statusCodeAdmin -eq 403) {
        Write-Host "[PASS] Akses admin ditolak dengan status 403 Forbidden - RBAC berjalan" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Endpoint admin berhasil diakses atau mengembalikan status $statusCodeAdmin" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] TEST 7 dilewati karena token Mahasiswa kosong." -ForegroundColor Red
}

# --- TEST 8: Rate Limiting ---
Write-Host ""
Write-Host "[TEST] TEST 8: Rate Limiting - Mengirim 20 request berulang cepat" -ForegroundColor Yellow
Write-Host "[INFO] Mengirim 20 request ke endpoint login dalam waktu singkat..." -ForegroundColor Cyan

$successReq = 0
$blockedReq = 0
$bodySalah = @{ email = "admin@sialat.ac.id"; password = "salah" } | ConvertTo-Json

for ($i = 1; $i -le 20; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "$TargetUrl/api/auth/login" -Method Post -Body $bodySalah -ContentType "application/json" -ErrorAction Stop
        $status = $r.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
        if (-not $status) { $status = $_.Exception.Response.StatusCode }
    }

    if ($status -eq 429) {
        $blockedReq++
    } else {
        $successReq++
    }
}

Write-Host "[INFO] Request berhasil (tidak diblok): $successReq" -ForegroundColor Cyan
Write-Host "[INFO] Request diblok: $blockedReq" -ForegroundColor Cyan

if ($blockedReq -gt 0) {
    Write-Host "[PASS] Rate limiting aktif - sebagian request diblokir dengan status 429" -ForegroundColor Green
} else {
    Write-Host "[INFO] Rate limiting belum aktif di backend - Perlu dikonfigurasi di APISIX" -ForegroundColor Yellow
}

# --- TEST 9: Simulasi Brute Force Login ---
Write-Host ""
Write-Host "[TEST] TEST 9: Simulasi Brute Force Login" -ForegroundColor Yellow
Write-Host "[INFO] Mencoba berbagai kombinasi password..." -ForegroundColor Cyan

$passwords = @("123456", "password", "admin", "letmein", "qwerty", "admin123")

foreach ($pwd in $passwords) {
    $bodyBrute = @{ email = "admin@sialat.ac.id"; password = $pwd } | ConvertTo-Json
    try {
        $r = Invoke-WebRequest -Uri "$TargetUrl/api/auth/login" -Method Post -Body $bodyBrute -ContentType "application/json" -ErrorAction Stop
        $status = $r.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
        if (-not $status) { $status = $_.Exception.Response.StatusCode }
    }

    if ($status -eq 200) {
        Write-Host "[INFO] Password '$pwd' - Response: $status (Berhasil)" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Password '$pwd' - Ditolak ($status)" -ForegroundColor Red
    }
}
Write-Host "[INFO] Brute force tidak diblok otomatis - Rekomendasi: aktifkan rate limiting di APISIX" -ForegroundColor Yellow

# --- TEST 10: Cek koneksi Apache HertzBeat Monitoring ---
Write-Host ""
Write-Host "[TEST] TEST 10: Cek koneksi Apache HertzBeat Monitoring" -ForegroundColor Yellow

try {
    $hertzRes = Invoke-WebRequest -Uri "http://localhost:1157" -Method Get -TimeoutSec 3 -ErrorAction Stop
    $hertzStatus = $hertzRes.StatusCode
} catch {
    $hertzStatus = $_.Exception.Response.StatusCode.Value__
    if (-not $hertzStatus) { $hertzStatus = $_.Exception.Response.StatusCode }
}

if ($hertzStatus -eq 200 -or $hertzStatus -eq 302) {
    Write-Host "[PASS] Akses berhasil dengan koneksi Apache HertzBeat aktif!" -ForegroundColor Green
} else {
    Write-Host "[INFO] Apache HertzBeat tidak terdeteksi aktif di localhost:1157 - Abaikan jika port berbeda." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🏁 PENGUJIAN SELESAI" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
