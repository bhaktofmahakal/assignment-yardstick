import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db-config'
import { requireRole } from '@/lib/middleware'

interface RouteParams {
  params: { slug: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = requireRole(request, ['ADMIN'])

    const tenant = await prisma.tenant.findUnique({
      where: { slug: params.slug }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    if (tenant.id !== user.tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (tenant.plan === 'PRO') {
      return NextResponse.json({ error: 'Tenant already on Pro plan' }, { status: 400 })
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { plan: 'PRO' }
    })

    return NextResponse.json({
      message: 'Tenant upgraded to Pro successfully',
      tenant: updatedTenant
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    console.error('Upgrade tenant error:', error)
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