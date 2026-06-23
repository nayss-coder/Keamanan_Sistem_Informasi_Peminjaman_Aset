# SI-ALAT — Sistem Informasi Peminjaman Peralatan Laboratorium

> Proyek Akhir Mata Kuliah Keamanan Jaringan — S1 Sistem Informasi

---

## 🚀 Cara Menjalankan (Lokal — Tanpa Docker)

### Prasyarat
- Node.js 18+
- MySQL 8.0 (bisa pakai XAMPP atau install manual)

### Langkah

```bash
# 1. Clone dan masuk ke folder
git clone <repo-url>
cd si-alat

# 2. Install dependencies
npm install

# 3. Buat database MySQL
# Buka MySQL client dan jalankan:
# CREATE DATABASE si_alat;
# CREATE USER 'sialat'@'localhost' IDENTIFIED BY 'sialat123';
# GRANT ALL ON si_alat.* TO 'sialat'@'localhost';

# 4. Copy env (sudah ada, sesuaikan jika perlu)
# .env.local sudah tersedia

# 5. Jalankan migrasi & seed data
node lib/db-migrate.js

# 6. Jalankan dev server
npm run dev
```

Buka http://localhost:3000

---

## 🐳 Cara Menjalankan dengan Docker (MySQL + App)

```bash
docker compose up -d
# Tunggu hingga MySQL healthy (~30 detik)

# Jalankan migrasi di dalam container
docker exec si-alat-app node lib/db-migrate.js
```

---

## 👤 Akun Demo

| Role        | Email                    | Password     |
|-------------|--------------------------|--------------|
| Admin       | admin@sialat.ac.id       | admin123     |
| Dosen PJ    | budi@sialat.ac.id        | dosen123     |
| Laboran     | rini@sialat.ac.id        | laboran123   |
| Asisten Lab | dian@sialat.ac.id        | asisten123   |
| Mahasiswa   | andi@student.ac.id       | mhs123       |

---

## 📁 Struktur Proyek

```
si-alat/
├── app/
│   ├── api/                    ← Backend API Routes
│   │   ├── auth/               login, logout, me
│   │   ├── peralatan/          CRUD peralatan
│   │   ├── peminjaman/         CRUD + approve/reject/return
│   │   └── admin/              users list, stats
│   ├── (auth)/login/           Halaman login
│   └── (dashboard)/            Halaman dashboard (protected)
│       ├── dashboard/          Beranda + statistik
│       ├── peralatan/          Katalog peralatan
│       ├── peminjaman/         Manajemen peminjaman
│       └── admin/              Manajemen user (admin only)
├── components/
│   └── layout/Sidebar.tsx      Navigasi sidebar
├── lib/
│   ├── db.ts                   Database connection
│   ├── auth.ts                 JWT utilities
│   ├── utils.ts                Helpers & formatters
│   └── db-migrate.js           Migration + seeding
├── types/index.ts              TypeScript types
├── docker/                     ← Diisi oleh tim security
│   ├── apisix/                 Apache APISIX config (Kila)
│   ├── fortress/               Apache Fortress config (Nahda)
│   ├── skywalking/             Apache SkyWalking config (Agidia)
│   └── mysql/
├── docker-compose.yml
└── .env.local
```

---

## 🔐 Endpoint API

| Method | Endpoint                   | Role             | Keterangan                     |
|--------|----------------------------|------------------|--------------------------------|
| POST   | /api/auth/login             | Public           | Login, return JWT              |
| POST   | /api/auth/logout            | Authenticated    | Hapus cookie token             |
| GET    | /api/auth/me                | Authenticated    | Data user saat ini             |
| GET    | /api/peralatan              | Authenticated    | List peralatan                 |
| POST   | /api/peralatan              | laboran, admin   | Tambah peralatan               |
| PUT    | /api/peralatan/[id]         | laboran, admin   | Update peralatan               |
| DELETE | /api/peralatan/[id]         | admin            | Hapus peralatan                |
| GET    | /api/peminjaman             | Authenticated    | List peminjaman (filtered)     |
| POST   | /api/peminjaman             | Authenticated    | Ajukan peminjaman              |
| PATCH  | /api/peminjaman/[id]        | dosen_pj, admin  | approve / reject / return      |
| GET    | /api/admin/users            | admin            | List semua user                |
| GET    | /api/admin/stats            | Authenticated    | Statistik dashboard            |

---

## 🧪 Skenario Pengujian Keamanan (BEFORE vs AFTER)

| # | Pengujian | BEFORE | AFTER (dengan Apache) |
|---|-----------|--------|----------------------|
| 1 | Akses API tanpa token | 200 OK | 401 (APISIX) |
| 2 | Mahasiswa akses /api/admin/users | 403 (app) | 403 (Fortress) |
| 3 | Login salah 10x berturut | Tidak dibatasi | 429 (APISIX rate limit) |
| 4 | Akses via HTTP | Plain text | Redirect HTTPS |
| 5 | Token expired | Masih jalan | 401 Token Expired |
| 6 | Trace aktivitas | Tidak ada | Terlihat di SkyWalking |
