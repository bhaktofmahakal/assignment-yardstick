import { PrismaClient, Role, Plan } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const acmeTenant = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme',
      plan: Plan.FREE,
    },
  })

  const globexTenant = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: {
      name: 'Globex Corporation',
      slug: 'globex',
      plan: Plan.FREE,
    },
  })

  const hashedPassword = await bcrypt.hash('password', 12)

  await prisma.user.upsert({
    where: { 
      email_tenantId: { 
        email: 'admin@acme.test',
        tenantId: acmeTenant.id 
      }
    },
    update: {},
    create: {
      email: 'admin@acme.test',
      password: hashedPassword,
      role: Role.ADMIN,
      tenantId: acmeTenant.id,
    },
  })

  await prisma.user.upsert({
    where: { 
      email_tenantId: { 
        email: 'user@acme.test',
        tenantId: acmeTenant.id 
      }
    },
    update: {},
    create: {
      email: 'user@acme.test',
      password: hashedPassword,
      role: Role.MEMBER,
      tenantId: acmeTenant.id,
    },
  })

  await prisma.user.upsert({
    where: { 
      email_tenantId: { 
        email: 'admin@globex.test',
        tenantId: globexTenant.id 
      }
    },
    update: {},
    create: {
      email: 'admin@globex.test',
      password: hashedPassword,
      role: Role.ADMIN,
      tenantId: globexTenant.id,
    },
  })

  await prisma.user.upsert({
    where: { 
      email_tenantId: { 
        email: 'user@globex.test',
        tenantId: globexTenant.id 
      }
    },
    update: {},
    create: {
      email: 'user@globex.test',
      password: hashedPassword,
      role: Role.MEMBER,
      tenantId: globexTenant.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })