import { test, expect } from '@playwright/test'

const testAccounts = [
  { email: 'admin@acme.test', password: 'password', role: 'ADMIN', tenant: 'Acme' },
  { email: 'user@acme.test', password: 'password', role: 'MEMBER', tenant: 'Acme' },
  { email: 'admin@globex.test', password: 'password', role: 'ADMIN', tenant: 'Globex' },
  { email: 'user@globex.test', password: 'password', role: 'MEMBER', tenant: 'Globex' },
]

test.describe('Authentication', () => {
  test('health endpoint works', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ status: 'ok' })
  })

  for (const account of testAccounts) {
    test(`login works for ${account.email}`, async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: { email: account.email, password: account.password }
      })
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.token).toBeTruthy()
      expect(data.user.email).toBe(account.email)
      expect(data.user.role).toBe(account.role)
      expect(data.user.tenant.name).toContain(account.tenant)
    })
  }

  test('login fails with invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'invalid@test.com', password: 'wrong' }
    })
    expect(response.status()).toBe(401)
  })
})