import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'
import { Peminjaman, ApiResponse } from '@/types'
import { generateKodePeminjaman } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  let sql = `
    SELECT p.*, u.name as user_name, u.email as user_email,
           al.nama as peralatan_nama, al.kode as peralatan_kode,
           a.name as approver_name
    FROM peminjaman p
    JOIN users u ON p.user_id = u.id
    JOIN peralatan al ON p.peralatan_id = al.id
    LEFT JOIN users a ON p.approved_by = a.id
  `
  const vals: unknown[] = []

  // Mahasiswa dan asisten lab hanya lihat milik sendiri
  if (['mahasiswa', 'asisten_lab'].includes(user.role)) {
    sql += ' WHERE p.user_id = ?'
    vals.push(user.userId)
  }

  sql += ' ORDER BY p.created_at DESC'

  const rows = await query<Peminjaman[]>(sql, vals)
  return NextResponse.json<ApiResponse<Peminjaman[]>>({ success: true, data: rows })
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { peralatan_id, jumlah, tanggal_pinjam, tanggal_kembali, keperluan } = body

  if (!peralatan_id || !tanggal_pinjam || !tanggal_kembali || !keperluan) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Field wajib tidak lengkap' }, { status: 400 })
  }

  // Cek ketersediaan
  const p = await query<{ tersedia: number }[]>('SELECT tersedia FROM peralatan WHERE id=?', [peralatan_id])
  if (!p[0] || p[0].tersedia < (jumlah || 1)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Stok peralatan tidak mencukupi' }, { status: 409 })
  }

  const kode = generateKodePeminjaman()
  await query(
    'INSERT INTO peminjaman (kode_peminjaman,user_id,peralatan_id,jumlah,tanggal_pinjam,tanggal_kembali,keperluan) VALUES (?,?,?,?,?,?,?)',
    [kode, user.userId, peralatan_id, jumlah || 1, tanggal_pinjam, tanggal_kembali, keperluan]
  )

  return NextResponse.json<ApiResponse>({ success: true, message: 'Permohonan peminjaman berhasil diajukan', data: { kode } }, { status: 201 })
}
