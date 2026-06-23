// ─── User & Auth ─────────────────────────────────────────────────────────────
export type Role = 'mahasiswa' | 'asisten_lab' | 'laboran' | 'dosen_pj' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  nim_nip?: string
  role: Role
  created_at: string
}

export interface AuthUser extends User {
  token: string
}

export interface JWTPayload {
  userId: number
  email: string
  role: Role
  name: string
  iat?: number
  exp?: number
}

// ─── Peralatan ────────────────────────────────────────────────────────────────
export type StatusPeralatan = 'tersedia' | 'dipinjam' | 'rusak' | 'maintenance'

export interface Peralatan {
  id: number
  kode: string
  nama: string
  kategori: string
  lokasi: string
  status: StatusPeralatan
  deskripsi?: string
  jumlah: number
  tersedia: number
  created_at: string
}

// ─── Peminjaman ───────────────────────────────────────────────────────────────
export type StatusPeminjaman = 'menunggu' | 'disetujui' | 'ditolak' | 'dipinjam' | 'dikembalikan'

export interface Peminjaman {
  id: number
  kode_peminjaman: string
  user_id: number
  user_name?: string
  user_email?: string
  peralatan_id: number
  peralatan_nama?: string
  peralatan_kode?: string
  jumlah: number
  tanggal_pinjam: string
  tanggal_kembali: string
  tanggal_kembali_aktual?: string
  keperluan: string
  status: StatusPeminjaman
  catatan?: string
  approved_by?: number
  approver_name?: string
  created_at: string
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalPeralatan: number
  peralatanTersedia: number
  peralatanDipinjam: number
  totalPeminjaman: number
  peminjamanMenunggu: number
  peminjamanAktif: number
}
