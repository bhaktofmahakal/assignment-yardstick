import { NextRequest } from 'next/server'
import { verifyToken, TokenPayload } from './auth'

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export function authenticateRequest(request: NextRequest): TokenPayload | null {
  const token = getAuthToken(request)
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(request: NextRequest): TokenPayload {
  const user = authenticateRequest(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export function requireRole(request: NextRequest, allowedRoles: string[]): TokenPayload {
  const user = requireAuth(request)
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}