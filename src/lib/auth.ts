import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db-config'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface TokenPayload {
  userId: string
  tenantId: string
  email: string
  role: 'ADMIN' | 'MEMBER'
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { tenant: true }
  })

  if (!user || !(await verifyPassword(password, user.password))) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenant: user.tenant
  }
}