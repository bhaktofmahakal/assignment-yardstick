import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized connection for serverless/edge functions
const databaseUrl = process.env.DATABASE_URL

// Supabase connection with pooling
const connectionUrl = process.env.NODE_ENV === 'production' && databaseUrl
  ? databaseUrl.includes('?') 
    ? `${databaseUrl}&pgbouncer=true&connection_limit=1&pool_timeout=20&connect_timeout=10`
    : `${databaseUrl}?pgbouncer=true&connection_limit=1&pool_timeout=20&connect_timeout=10`
  : databaseUrl

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle cleanup
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
  })
}