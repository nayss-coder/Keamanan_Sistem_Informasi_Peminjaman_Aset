import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { User, ApiResponse, AuthUser } from '@/types'

// Simple in-memory rate limiter for local testing on port 3001
const loginAttempts = new Map<string, { count: number; resetTime: number }>()

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const now = Date.now()
    const WINDOW_MS = 60 * 1000 // 1 menit

    const record = loginAttempts.get(ip)
    if (record) {
      if (now > record.resetTime) {
        loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS })
      } else {
        record.count++
        if (record.count > 5) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'too many request try again in 2 minutes' },
            { status: 429 }
          )
        }
      }
    } else {
      loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    }

    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    const users = await query<User[]>('SELECT * FROM users WHERE email = ?', [email])
    const user = users[0] as (User & { password: string }) | undefined

    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Email atau password salah' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Email atau password salah' }, { status: 401 })
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name, key: 'si-alat-key' })

    const response = NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, nim_nip: user.nim_nip, created_at: user.created_at, token },
      message: 'Login berhasil'
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[AUTH/LOGIN]', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
