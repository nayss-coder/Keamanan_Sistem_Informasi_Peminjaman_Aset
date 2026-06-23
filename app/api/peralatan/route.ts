import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, CAN_MANAGE_PERALATAN } from '@/lib/auth'
import { query } from '@/lib/db'
import { Peralatan, ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('q') || ''
  const kategori = searchParams.get('kategori') || ''
  const status = searchParams.get('status') || ''

  let sql = 'SELECT * FROM peralatan WHERE 1=1'
  const vals: string[] = []
  if (search)   { sql += ' AND (nama LIKE ? OR kode LIKE ?)'; vals.push(`%${search}%`, `%${search}%`) }
  if (kategori) { sql += ' AND kategori = ?'; vals.push(kategori) }
  if (status)   { sql += ' AND status = ?'; vals.push(status) }
  sql += ' ORDER BY nama ASC'

  const rows = await query<Peralatan[]>(sql, vals)
  return NextResponse.json<ApiResponse<Peralatan[]>>({ success: true, data: rows })
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!CAN_MANAGE_PERALATAN.includes(user.role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: hanya laboran/admin' }, { status: 403 })
  }

  const body = await req.json()
  const { kode, nama, kategori, lokasi, deskripsi, jumlah } = body
  if (!kode || !nama || !kategori || !lokasi) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Field wajib tidak lengkap' }, { status: 400 })
  }

  await query(
    'INSERT INTO peralatan (kode,nama,kategori,lokasi,deskripsi,jumlah,tersedia) VALUES (?,?,?,?,?,?,?)',
    [kode, nama, kategori, lokasi, deskripsi || null, jumlah || 1, jumlah || 1]
  )
  return NextResponse.json<ApiResponse>({ success: true, message: 'Peralatan berhasil ditambahkan' }, { status: 201 })
}
