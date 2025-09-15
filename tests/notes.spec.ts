import { test, expect } from '@playwright/test'

async function getAuthToken(request: any, email: string) {
  const response = await request.post('/api/auth/login', {
    data: { email, password: 'password' }
  })
  const data = await response.json()
  return data.token
}

test.describe('Notes CRUD & Tenant Isolation', () => {
  test('notes CRUD operations work', async ({ request }) => {
    const token = await getAuthToken(request, 'user@acme.test')
    
    // Create note
    const createResponse = await request.post('/api/notes', {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Test Note', content: 'Test content' }
    })
    expect(createResponse.status()).toBe(201)
    const note = await createResponse.json()
    expect(note.title).toBe('Test Note')
    
    // Get notes
    const getResponse = await request.get('/api/notes', {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(getResponse.status()).toBe(200)
    const notes = await getResponse.json()
    expect(notes.length).toBeGreaterThan(0)
    
    // Update note
    const updateResponse = await request.put(`/api/notes/${note.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Updated Note', content: 'Updated content' }
    })
    expect(updateResponse.status()).toBe(200)
    
    // Delete note
    const deleteResponse = await request.delete(`/api/notes/${note.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(deleteResponse.status()).toBe(200)
  })

  test('tenant isolation works', async ({ request }) => {
    const acmeToken = await getAuthToken(request, 'user@acme.test')
    const globexToken = await getAuthToken(request, 'user@globex.test')
    
    // Create note as Acme user
    const acmeNote = await request.post('/api/notes', {
      headers: { Authorization: `Bearer ${acmeToken}` },
      data: { title: 'Acme Note', content: 'Acme content' }
    })
    const acmeNoteData = await acmeNote.json()
    
    // Try to access Acme note as Globex user
    const globexAccess = await request.get(`/api/notes/${acmeNoteData.id}`, {
      headers: { Authorization: `Bearer ${globexToken}` }
    })
    expect(globexAccess.status()).toBe(404)
    
    // Cleanup
    await request.delete(`/api/notes/${acmeNoteData.id}`, {
      headers: { Authorization: `Bearer ${acmeToken}` }
    })
  })

  test('free plan note limit enforced', async ({ request }) => {
    const token = await getAuthToken(request, 'user@acme.test')
    
    // Create 3 notes (free plan limit)
    for (let i = 1; i <= 3; i++) {
      const response = await request.post('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: `Note ${i}`, content: `Content ${i}` }
      })
      expect(response.status()).toBe(201)
    }
    
    // 4th note should be rejected
    const limitResponse = await request.post('/api/notes', {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Limit Note', content: 'Should fail' }
    })
    expect(limitResponse.status()).toBe(403)
    const error = await limitResponse.json()
    expect(error.error).toContain('Free plan limited')
  })

  test('admin can upgrade tenant', async ({ request }) => {
    const adminToken = await getAuthToken(request, 'admin@acme.test')
    
    const upgradeResponse = await request.post('/api/tenants/acme/upgrade', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(upgradeResponse.status()).toBe(200)
  })

  test('member cannot upgrade tenant', async ({ request }) => {
    const memberToken = await getAuthToken(request, 'user@globex.test')
    
    const upgradeResponse = await request.post('/api/tenants/globex/upgrade', {
      headers: { Authorization: `Bearer ${memberToken}` }
    })
    expect(upgradeResponse.status()).toBe(403)
  })

  test('unauthorized access rejected', async ({ request }) => {
    const response = await request.get('/api/notes')
    expect(response.status()).toBe(401)
  })
})