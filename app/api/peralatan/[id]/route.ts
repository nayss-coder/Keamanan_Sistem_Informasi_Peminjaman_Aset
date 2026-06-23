import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, CAN_MANAGE_PERALATAN } from '@/lib/auth'
import { query } from '@/lib/db'
import { Peralatan, ApiResponse } from '@/types'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const rows = await query<Peralatan[]>('SELECT * FROM peralatan WHERE id = ?', [params.id])
  if (!rows[0]) return NextResponse.json<ApiResponse>({ success: false, error: 'Tidak ditemukan' }, { status: 404 })

  return NextResponse.json<ApiResponse<Peralatan>>({ success: true, data: rows[0] })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!CAN_MANAGE_PERALATAN.includes(user.role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { nama, kategori, lokasi, status, deskripsi, jumlah, tersedia } = body

  await query(
    'UPDATE peralatan SET nama=?, kategori=?, lokasi=?, status=?, deskripsi=?, jumlah=?, tersedia=? WHERE id=?',
    [nama, kategori, lokasi, status, deskripsi, jumlah, tersedia, params.id]
  )
  return NextResponse.json<ApiResponse>({ success: true, message: 'Peralatan diperbarui' })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: hanya admin' }, { status: 403 })
  }

  await query('DELETE FROM peralatan WHERE id = ?', [params.id])
  return NextResponse.json<ApiResponse>({ success: true, message: 'Peralatan dihapus' })
}
