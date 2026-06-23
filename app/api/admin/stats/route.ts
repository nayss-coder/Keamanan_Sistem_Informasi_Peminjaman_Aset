import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'
import { DashboardStats, ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const [peralatan]  = await query<{total:number,tersedia:number,dipinjam:number}[]>(
    `SELECT COUNT(*) as total,
            SUM(status='tersedia') as tersedia,
            SUM(status='dipinjam') as dipinjam
     FROM peralatan`
  )
  const [peminjaman] = await query<{total:number,menunggu:number,aktif:number}[]>(
    `SELECT COUNT(*) as total,
            SUM(status='menunggu') as menunggu,
            SUM(status IN ('disetujui','dipinjam')) as aktif
     FROM peminjaman`
  )

  const stats: DashboardStats = {
    totalPeralatan:    peralatan.total,
    peralatanTersedia: peralatan.tersedia || 0,
    peralatanDipinjam: peralatan.dipinjam || 0,
    totalPeminjaman:   peminjaman.total,
    peminjamanMenunggu: peminjaman.menunggu || 0,
    peminjamanAktif:   peminjaman.aktif || 0,
  }

  return NextResponse.json<ApiResponse<DashboardStats>>({ success: true, data: stats })
}
