import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, CAN_APPROVE } from '@/lib/auth'
import { query } from '@/lib/db'
import { Peminjaman, ApiResponse } from '@/types'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const rows = await query<Peminjaman[]>(`
    SELECT p.*, u.name as user_name, al.nama as peralatan_nama, al.kode as peralatan_kode
    FROM peminjaman p
    JOIN users u ON p.user_id = u.id
    JOIN peralatan al ON p.peralatan_id = al.id
    WHERE p.id = ?
  `, [params.id])

  if (!rows[0]) return NextResponse.json<ApiResponse>({ success: false, error: 'Tidak ditemukan' }, { status: 404 })

  // Mahasiswa hanya bisa lihat milik sendiri
  if (user.role === 'mahasiswa' && rows[0].user_id !== user.userId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json<ApiResponse<Peminjaman>>({ success: true, data: rows[0] })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, catatan } = body // action: 'approve' | 'reject' | 'return'

  if (action === 'approve' || action === 'reject') {
    if (!CAN_APPROVE.includes(user.role)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: hanya dosen/admin' }, { status: 403 })
    }
    const status = action === 'approve' ? 'disetujui' : 'ditolak'
    await query(
      'UPDATE peminjaman SET status=?, catatan=?, approved_by=? WHERE id=?',
      [status, catatan || null, user.userId, params.id]
    )
    if (action === 'approve') {
      const rows = await query<Peminjaman[]>('SELECT peralatan_id, jumlah FROM peminjaman WHERE id=?', [params.id])
      if (rows[0]) {
        await query('UPDATE peralatan SET tersedia = tersedia - ?, status = IF(tersedia-?>0,"tersedia","dipinjam") WHERE id=?',
          [rows[0].jumlah, rows[0].jumlah, rows[0].peralatan_id])
      }
    }
    return NextResponse.json<ApiResponse>({ success: true, message: `Peminjaman ${status}` })
  }

  if (action === 'return') {
    const rows = await query<Peminjaman[]>('SELECT * FROM peminjaman WHERE id=?', [params.id])
    if (!rows[0]) return NextResponse.json<ApiResponse>({ success: false, error: 'Tidak ditemukan' }, { status: 404 })
    await query(
      'UPDATE peminjaman SET status="dikembalikan", tanggal_kembali_aktual=CURDATE() WHERE id=?',
      [params.id]
    )
    await query(
      'UPDATE peralatan SET tersedia = tersedia + ?, status = "tersedia" WHERE id=?',
      [rows[0].jumlah, rows[0].peralatan_id]
    )
    return NextResponse.json<ApiResponse>({ success: true, message: 'Peralatan berhasil dikembalikan' })
  }

  return NextResponse.json<ApiResponse>({ success: false, error: 'Action tidak valid' }, { status: 400 })
}
