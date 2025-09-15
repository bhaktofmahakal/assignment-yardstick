import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db-config'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    
    const notes = await prisma.note.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    return NextResponse.json(notes)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        notes: true
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    if (tenant.plan === 'FREE' && tenant.notes.length >= 3) {
      return NextResponse.json(
        { error: 'Free plan limited to 3 notes. Upgrade to Pro for unlimited notes.' },
        { status: 403 }
      )
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: user.userId,
        tenantId: user.tenantId
      },
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Create note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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