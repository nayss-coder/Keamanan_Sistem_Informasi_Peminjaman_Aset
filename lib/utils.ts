import { type ClassValue, clsx } from 'clsx'
import { StatusPeminjaman, StatusPeralatan, Role } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateKodePeminjaman(): string {
  const now = Date.now().toString().slice(-6)
  return `PJM-${now}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const STATUS_PEMINJAMAN_LABEL: Record<StatusPeminjaman, string> = {
  menunggu:     'Menunggu',
  disetujui:    'Disetujui',
  ditolak:      'Ditolak',
  dipinjam:     'Dipinjam',
  dikembalikan: 'Dikembalikan',
}

export const STATUS_PERALATAN_LABEL: Record<StatusPeralatan, string> = {
  tersedia:    'Tersedia',
  dipinjam:    'Dipinjam',
  rusak:       'Rusak',
  maintenance: 'Maintenance',
}

export const ROLE_LABEL: Record<Role, string> = {
  mahasiswa:    'Mahasiswa',
  asisten_lab:  'Asisten Lab',
  laboran:      'Laboran',
  dosen_pj:     'Dosen PJ',
  admin:        'Administrator',
}

export const STATUS_PEMINJAMAN_COLOR: Record<StatusPeminjaman, string> = {
  menunggu:     'bg-amber-100 text-amber-800',
  disetujui:    'bg-blue-100 text-blue-800',
  ditolak:      'bg-red-100 text-red-800',
  dipinjam:     'bg-orange-100 text-orange-800',
  dikembalikan: 'bg-green-100 text-green-800',
}

export const STATUS_PERALATAN_COLOR: Record<StatusPeralatan, string> = {
  tersedia:    'bg-green-100 text-green-800',
  dipinjam:    'bg-orange-100 text-orange-800',
  rusak:       'bg-red-100 text-red-800',
  maintenance: 'bg-gray-100 text-gray-700',
}
