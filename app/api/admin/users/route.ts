import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'
import { User, ApiResponse } from '@/types'

// ⚠️ BEFORE (tanpa keamanan): endpoint ini tidak ada proteksi
// AFTER: diproteksi oleh Apache APISIX + Fortress (role: admin only)
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  if (user.role !== 'admin') {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: hanya admin' }, { status: 403 })
  }

  const users = await query<User[]>('SELECT id,name,email,nim_nip,role,created_at FROM users ORDER BY created_at DESC')
  return NextResponse.json<ApiResponse<User[]>>({ success: true, data: users })
}
