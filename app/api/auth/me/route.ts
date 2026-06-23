import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'
import { User, ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req)
  if (!payload) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const users = await query<User[]>('SELECT id,name,email,nim_nip,role,created_at FROM users WHERE id=?', [payload.userId])
  if (!users[0]) return NextResponse.json<ApiResponse>({ success: false, error: 'User tidak ditemukan' }, { status: 404 })

  return NextResponse.json<ApiResponse<User>>({ success: true, data: users[0] })
}
