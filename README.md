# SI-ALAT — Sistem Informasi Peminjaman Peralatan Laboratorium

> Proyek Akhir Mata Kuliah Keamanan Jaringan — S1 Sistem Informasi
> Implementasi Keamanan Upper-Layer (OSI Layer 5, 6, 7) menggunakan Apache Security Stack (APISIX Gateway, Fortress RBAC, SkyWalking APM).

---

## 👥 Anggota Kelompok & Pembagian Peran

| Nama Anggota | NIM          | Peran Utama (Role)                  | Tanggung Jawab Teknis                                                                                              |
| :----------- | :----------- | :---------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **Shakila**  | _2410512033_ | **Full-Stack Developer**            | Mengembangkan backend Next.js API, skema database, integrasi JWT, dan antarmuka (frontend) Dashboard.              |
| **Erlis**    | _2410512007_ | **Security Tester (Postman & CLI)** | Pengujian rute API Gateway APISIX (JWT Bypass, Rate Limiting, Brute Force) menggunakan Postman dan skrip otomatis. |
| **Nayla**    | _2410512017_ | **Monitoring & APM Engineer**       | Integrasi Apache SkyWalking (OAP & UI) untuk pemantauan performa server, topology jaringan, dan analisis metrik.   |
| **Agidia**   | _2410512019_ | **Monitoring & APM Engineer**       | Integrasi Apache SkyWalking (OAP & UI) untuk pemantauan performa server, topology jaringan, dan analisis metrik.   |
| **Nahda**    | _2410512018_ | **Documentation & Report**          | Penyusunan laporan akhir proyek, panduan deployment, serta pencatatan dokumentasi arsitektur keamanan Fortress.    |

---

## 📁 Struktur Proyek Terkini

```
si-alat/
├── app/
│   ├── api/                    ← Backend API Routes
│   │   ├── auth/               login, logout, me
│   │   ├── peralatan/          CRUD peralatan
│   │   ├── peminjaman/         CRUD + approve/reject/return
│   │   └── admin/              users list, stats
│   ├── (auth)/login/           Halaman login Next.js
│   ├── (dashboard)/            Halaman dashboard (protected)
│   │   ├── dashboard/          Beranda + statistik
│   │   ├── peralatan/          Katalog peralatan
│   │   ├── peminjaman/         Manajemen peminjaman
│   │   └── admin/              Manajemen user (admin only)
│   └── api-docs/               ← Halaman Swagger UI (api-docs/page.tsx)
├── components/
│   └── layout/Sidebar.tsx      Navigasi sidebar UI
├── lib/
│   ├── db.ts                   Koneksi database (Prepared Statements)
│   ├── auth.ts                 Utilitas token JWT
│   ├── utils.ts                Helpers & formatters
│   └── db-migrate.js           Skrip migrasi & seeder database
├── types/index.ts              TypeScript types
├── apisix_config/              ← Konfigurasi Gateway APISIX
│   └── config.yaml             Konfigurasi koneksi etcd & admin key
├── public/
│   ├── swagger.json            ← OpenAPI Specification untuk Swagger UI
│   └── images/
│       └── logo.png            Logo transparan SI-ALAT
├── docker-compose.yml          ← Orchestrator seluruh stack layanan (App + Security Stack)
├── Dockerfile                  ← Merakit image Next.js Standalone dengan SkyWalking Agent
├── .dockerignore               ← Mencegah berkas env lokal ikut tercopy ke kontainer
├── .env.local                  ← Berkas konfigurasi env untuk server lokal (host)
├── setup-apisix.ps1            ← Skrip setup otomatis rute & plugin di APISIX
├── test-security.ps1           ← Skrip pengujian otomatis (Windows PowerShell)
└── test-security.sh            ← Skrip pengujian otomatis (Bash/Git Bash/WSL)
```

---

## 🚀 Cara Menjalankan (Lokal — Tanpa Docker)

### Prasyarat

- Node.js 18+
- MySQL 8.0 (XAMPP / Laragon)

### Langkah

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Jalankan migrasi database lokal:**
   _(Pastikan database `si_alat` sudah dibuat di MySQL XAMPP/Laragon)_
   ```bash
   node lib/db-migrate.js
   ```
3. **Jalankan dev server:**
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000] di browser Anda.

---

## 🐳 Cara Menjalankan dengan Docker (Full Stack + Security Stack)

Pastikan aplikasi **Docker Desktop** sudah menyala dan berstatus _Engine Running_ sebelum menjalankan langkah ini.

1. **Jalankan seluruh layanan menggunakan Docker Compose:**

   ```powershell
   docker compose up -d --build
   ```

   _Layanan yang berjalan:_
   - **Next.js App** (Port `3000`)
   - **MySQL Database** (Port `3306`)
   - **APISIX Gateway** (Port `9080` & Admin Port `9180`)
   - **etcd Config Store** (Port `2379`)
   - **SkyWalking OAP** (Port `11800` & `12800`)
   - **SkyWalking UI** (Port `8080`)
   - **Fortress LDAP** (Port `389`)

2. **Jalankan migrasi database di dalam Docker (dari terminal komputer host):**

   ```powershell
   $env:DB_PORT="3306"; node lib/db-migrate.js
   ```

3. **Jalankan skrip inisialisasi rute & plugin APISIX:**
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\setup-apisix.ps1
   ```

---

## 👤 Akun Demo & Kredensial

Akun-akun berikut dibuat otomatis saat menjalankan langkah migrasi di atas:

| Role            | Email                | Password     | Keterangan                                  |
| :-------------- | :------------------- | :----------- | :------------------------------------------ |
| **Admin**       | `admin@sialat.ac.id` | `admin123`   | Akses penuh seluruh sistem & manajemen user |
| **Dosen PJ**    | `budi@sialat.ac.id`  | `dosen123`   | Menyetujui/menolak pengajuan peminjaman     |
| **Laboran**     | `rini@sialat.ac.id`  | `laboran123` | Mengelola katalog data peralatan lab        |
| **Asisten Lab** | `dian@sialat.ac.id`  | `asisten123` | Hak akses katalog peralatan                 |
| **Mahasiswa**   | `andi@student.ac.id` | `mhs123`     | Mengajukan peminjaman & melihat status      |

---

## 🧪 Skenario Pengujian Keamanan & Pemantauan

### 1. Jalankan Pengujian Keamanan Otomatis

Anda dapat memverifikasi seluruh skenario keamanan (JWT Validation, RBAC Bypass, Rate Limiting, Brute Force Protection) dengan menjalankan skrip testing:

- **Di Windows PowerShell:**
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\test-security.ps1 -TargetUrl "http://localhost:3000"
  ```
- **Di Bash (Git Bash/Linux):**
  ```bash
  bash test-security.sh http://localhost:3000
  ```

### 2. Skenario Pengujian "Before vs After" (Demonstrasi UAS)

| Skenario Pengujian           | BEFORE (Port 3000 - Langsung)                                                                  | AFTER (Port 9080 - APISIX Gateway)                                                                                                                                                   |
| :--------------------------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bypass Token JWT**         | Mengembalikan status `401` dari Next.js (proteksi dasar).                                      | Diblokir di gerbang terluar oleh APISIX dengan status **`401 Unauthorized`** & pesan `"Missing JWT token"`.                                                                          |
| **Akses Valid (Dengan JWT)** | Mengembalikan data dengan status **`200 OK`**.                                                 | Berhasil lolos verifikasi JWT oleh APISIX, request diteruskan ke Next.js dan mengembalikan status **`200 OK`**.                                                                      |
| **Eskalasi Peran (RBAC)**    | Mahasiswa mencoba mengakses `/api/admin/users` ditolak `403` oleh Next.js.                     | Hak akses peran dikontrol oleh Fortress, request ilegal ditolak dengan status **`403 Forbidden`**. Sukses diakses oleh Admin dengan status **`200 OK`**.                             |
| **Rate Limiting (Flooding)** | Mengirim 20 request login berturut-turut cepat. Semua diproses dan mengembalikan status `401`. | Request ke 1-5 diproses (mengembalikan `401` jika password salah, atau **`200 OK`** jika benar). Request ke 6-10 langsung diblokir APISIX dengan status **`429 Too Many Requests`**. |

### 3. Pemantauan APM (Apache SkyWalking)

- Akses dashboard grafis pemantauan di: **`http://localhost:8080`**
- Hasilkan trafik dengan mengakses aplikasi. Anda akan melihat topology jaringan dan tracing performa query database dari layanan **`si-alat-backend`**.

---

## 📹 Alur Demonstrasi & Rekaman Video UAS

Berikut adalah urutan langkah demi langkah yang harus dilakukan dan direkam saat melakukan simulasi/video demo sistem:

### A. Langkah Persiapan Server (PowerShell)
```powershell
# 1. Masuk ke direktori utama proyek Anda
cd C:\Users\denny\OneDrive\Desktop\si-alat

# 2. Nyalakan seluruh container Docker (APISIX, SkyWalking, LDAP, etcd)
docker compose up -d

# 3. Jalankan database MySQL kontainer lokal (jika mati)
docker start si-alat-mysql

# 4. Jalankan aplikasi Next.js secara lokal di komputer host
npm run dev
# (Tunggu sampai muncul status: ✓ Ready at localhost:3000)
```

### B. Materi yang Wajib Direkam / Didemokan
1. **Verifikasi Layanan (`docker ps`)**:
   Tunjukkan seluruh container yang berjalan di terminal menggunakan perintah:
   ```powershell
   docker ps
   ```
   *(Pastikan kontainer `proyek-apisix-apisix`, `si-alat-mysql`, `si-alat-app`, `skywalking-oap`, dan `fortress-ldap` berstatus UP/Healthy)*.
   
   *Verifikasi khusus Fortress:*
   ```powershell
   docker ps | findstr fortress
   ```

2. **Akses Web UI via Gateway**:
   Buka browser dan buka **`http://localhost:9080`** (Akses Next.js melalui APISIX). Tunjukkan kembalian respon standar keamanan `{"error_msg":"404 Route Not Found"}`.

3. **Pengujian Keamanan API di Postman**:
   * **Demo 401 (JWT Bypass)**: Tembak `GET http://localhost:9080/api/peralatan` tanpa header token. Tunjukkan respon `401 Unauthorized`.
   * **Demo 403 (RBAC Bypass)**: Tembak `GET http://localhost:9080/api/admin/users` menggunakan token Mahasiswa. Tunjukkan respon `403 Forbidden`.
   * **Demo 429 (Rate Limiting)**: Kirim request login berturut-turut cepat. Tunjukkan respon `429 Too Many Requests`.

4. **Uji Konfigurasi & Plugin APISIX**:
   * **Dashboard**: Tunjukkan visual konfigurasi rute di APISIX Dashboard di browser.
   * **Cek Rute via API**:
     ```powershell
     Invoke-RestMethod -Uri "http://localhost:9180/apisix/admin/routes/login" -Headers @{"X-API-KEY"="AuLapHCJgMSJuVwaLOvxzdDyLzenMBkY"}
     ```

5. **Pemantauan & Trigger Alarm SkyWalking**:
   * Buka dashboard SkyWalking di **`http://localhost:8080`**.
   * **Trigger Alarm (Simulasi Anomali)**: Jalankan perintah loop 200 request GET berikut ke root APISIX di terminal untuk memicu alarm anomali 404 (error rate > 50%):
     ```powershell
     for ($i=1; $i -le 200; $i++) {
         try { 
             Invoke-RestMethod -Uri "http://localhost:9080/" -Method GET -ErrorAction SilentlyContinue | Out-Null
         } catch {}
         Write-Host "Request $i selesai"
     }
     ```
   * Tunggu **2-3 menit**, lalu tunjukkan grafik *Error Rate* yang melonjak (Spike) dan menu **Alarm** di SkyWalking UI yang menyala merah memperingatkan anomali trafik.

