import jwt from 'jsonwebtoken'
import { JWTPayload, Role } from '@/types'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'si-alat-secret-key-dev'
const EXPIRES = process.env.JWT_EXPIRES_IN || '15m'

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  const cookie = req.cookies.get('token')
  return cookie?.value || null
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

export function requireRole(user: JWTPayload | null, roles: Role[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

// Role hierarchy — siapa bisa approve peminjaman
export const CAN_APPROVE: Role[] = ['dosen_pj', 'admin']
export const CAN_MANAGE_PERALATAN: Role[] = ['laboran', 'admin']
export const CAN_MANAGE_USERS: Role[] = ['admin']
export const ALL_ROLES: Role[] = ['mahasiswa', 'asisten_lab', 'laboran', 'dosen_pj', 'admin']
