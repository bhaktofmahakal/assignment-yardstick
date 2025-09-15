import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Test database connection first
    try {
      const user = await authenticateUser(email, password)
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const token = signToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
      })

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenant: user.tenant
        }
      })
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      
      // If it's a connection error, return specific message
      if (dbError.message?.includes('Can\'t reach database') || 
          dbError.code === 'P1001' || 
          dbError.name === 'PrismaClientInitializationError') {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        )
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}