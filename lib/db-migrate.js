// Run: node lib/db-migrate.js
const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'sialat',
    password: process.env.DB_PASSWORD || 'sialat123',
    database: process.env.DB_NAME || 'si_alat',
    multipleStatements: true,
  })

  console.log('🔄 Running migrations...')

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(100) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      nim_nip     VARCHAR(20),
      role        ENUM('mahasiswa','asisten_lab','laboran','dosen_pj','admin') NOT NULL DEFAULT 'mahasiswa',
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS peralatan (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      kode        VARCHAR(20) NOT NULL UNIQUE,
      nama        VARCHAR(100) NOT NULL,
      kategori    VARCHAR(50) NOT NULL,
      lokasi      VARCHAR(100) NOT NULL,
      status      ENUM('tersedia','dipinjam','rusak','maintenance') NOT NULL DEFAULT 'tersedia',
      deskripsi   TEXT,
      jumlah      INT NOT NULL DEFAULT 1,
      tersedia    INT NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS peminjaman (
      id                    INT AUTO_INCREMENT PRIMARY KEY,
      kode_peminjaman       VARCHAR(20) NOT NULL UNIQUE,
      user_id               INT NOT NULL,
      peralatan_id          INT NOT NULL,
      jumlah                INT NOT NULL DEFAULT 1,
      tanggal_pinjam        DATE NOT NULL,
      tanggal_kembali       DATE NOT NULL,
      tanggal_kembali_aktual DATE,
      keperluan             TEXT NOT NULL,
      status                ENUM('menunggu','disetujui','ditolak','dipinjam','dikembalikan') DEFAULT 'menunggu',
      catatan               TEXT,
      approved_by           INT,
      created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (peralatan_id) REFERENCES peralatan(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `)

  console.log('✅ Tables created')

  // ── Seed users ──────────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hashSync(pw, 10)
  const users = [
    ['Admin Sistem',       'admin@sialat.ac.id',    hash('admin123'),    'ADM001',    'admin'],
    ['Budi Santoso',       'budi@sialat.ac.id',     hash('dosen123'),    'NIP001',    'dosen_pj'],
    ['Rini Laboran',       'rini@sialat.ac.id',     hash('laboran123'),  'LAB001',    'laboran'],
    ['Dian Asisten',       'dian@sialat.ac.id',     hash('asisten123'),  'AST001',    'asisten_lab'],
    ['Andi Mahasiswa',     'andi@student.ac.id',    hash('mhs123'),      '2021001',   'mahasiswa'],
    ['Sari Mahasiswa',     'sari@student.ac.id',    hash('mhs123'),      '2021002',   'mahasiswa'],
    ['Joko Mahasiswa',     'joko@student.ac.id',    hash('mhs123'),      '2022001',   'mahasiswa'],
  ]
  for (const [name, email, password, nim_nip, role] of users) {
    await conn.execute(
      'INSERT IGNORE INTO users (name, email, password, nim_nip, role) VALUES (?,?,?,?,?)',
      [name, email, password, nim_nip, role]
    )
  }
  console.log('✅ Users seeded')

  // ── Seed peralatan ───────────────────────────────────────────────────────────
  const peralatan = [
    ['ALT-001', 'Laptop Lenovo ThinkPad',    'Komputer',    'Lab 101', 'tersedia',  'Laptop 14" Core i5 RAM 8GB', 5, 5],
    ['ALT-002', 'Proyektor Epson EB-X51',    'Proyektor',   'Lab 101', 'tersedia',  'Proyektor 3600 lumens XGA',  3, 3],
    ['ALT-003', 'Arduino Uno R3',             'Elektronika', 'Lab 102', 'tersedia',  'Microcontroller board',      10, 8],
    ['ALT-004', 'Raspberry Pi 4 Model B',     'Elektronika', 'Lab 102', 'dipinjam',  'Single-board computer 4GB',  6, 4],
    ['ALT-005', 'Kamera DSLR Canon EOS',      'Kamera',      'Lab 103', 'tersedia',  'DSLR 24MP dengan kit lens',  2, 2],
    ['ALT-006', 'Switch Cisco Catalyst',      'Jaringan',    'Lab Net',  'tersedia',  '24-port managed switch',     4, 4],
    ['ALT-007', 'Oscilloscope Digital',       'Elektronika', 'Lab 102', 'maintenance','4-channel 100MHz',           2, 0],
    ['ALT-008', 'Tripod Kamera',              'Aksesoris',   'Lab 103', 'tersedia',  'Tripod aluminium 170cm',     5, 5],
    ['ALT-009', 'Kabel HDMI 3m',              'Aksesoris',   'Gudang',  'tersedia',  'HDMI 2.0 High Speed',        15, 12],
    ['ALT-010', 'Router Mikrotik RB750',      'Jaringan',    'Lab Net', 'tersedia',  '5-port gigabit router',       3, 3],
  ]
  for (const [kode, nama, kategori, lokasi, status, deskripsi, jumlah, tersedia] of peralatan) {
    await conn.execute(
      'INSERT IGNORE INTO peralatan (kode,nama,kategori,lokasi,status,deskripsi,jumlah,tersedia) VALUES (?,?,?,?,?,?,?,?)',
      [kode, nama, kategori, lokasi, status, deskripsi, jumlah, tersedia]
    )
  }
  console.log('✅ Peralatan seeded')

  // ── Seed peminjaman ──────────────────────────────────────────────────────────
  const pinjam = [
    ['PJM-0001', 5, 1, 2, '2024-07-01', '2024-07-03', 'Praktikum Jarkom', 'disetujui', 2],
    ['PJM-0002', 6, 3, 3, '2024-07-05', '2024-07-06', 'Tugas Akhir IoT',  'menunggu',  null],
    ['PJM-0003', 7, 2, 1, '2024-07-08', '2024-07-10', 'Seminar Prodi',    'ditolak',   2],
    ['PJM-0004', 5, 4, 2, '2024-07-10', '2024-07-12', 'Penelitian RPi',   'dipinjam',  2],
  ]
  for (const [kode, uid, pid, jml, tgl_pinjam, tgl_kembali, keperluan, status, approved_by] of pinjam) {
    await conn.execute(
      `INSERT IGNORE INTO peminjaman
        (kode_peminjaman,user_id,peralatan_id,jumlah,tanggal_pinjam,tanggal_kembali,keperluan,status,approved_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [kode, uid, pid, jml, tgl_pinjam, tgl_kembali, keperluan, status, approved_by]
    )
  }
  console.log('✅ Peminjaman seeded')

  await conn.end()
  console.log('\n🎉 Migration complete!\n')
  console.log('Test accounts:')
  console.log('  admin@sialat.ac.id    / admin123  (admin)')
  console.log('  budi@sialat.ac.id     / dosen123  (dosen_pj)')
  console.log('  rini@sialat.ac.id     / laboran123 (laboran)')
  console.log('  andi@student.ac.id    / mhs123    (mahasiswa)')
}

migrate().catch(err => { console.error(err); process.exit(1) })
