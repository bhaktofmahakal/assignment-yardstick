import { test, expect } from '@playwright/test'

test.describe('Frontend Interface', () => {
  test('login page loads and works', async ({ page }) => {
    await page.goto('/')
    
    // Check login form elements
    await expect(page.getByText('Sign in to your account')).toBeVisible()
    await expect(page.getByText('Test Accounts')).toBeVisible()
    
    // Test login with valid account
    await page.fill('input[type="email"]', 'admin@acme.test')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Should redirect to notes app
    await expect(page.getByText('Notes')).toBeVisible()
    await expect(page.getByText('admin@acme.test')).toBeVisible()
    await expect(page.getByText('Acme')).toBeVisible()
  })

  test('notes management interface works', async ({ page }) => {
    await page.goto('/')
    
    // Login
    await page.fill('input[type="email"]', 'user@acme.test')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Wait for notes interface
    await expect(page.getByText('Your Notes')).toBeVisible()
    
    // Create note
    await page.click('button:has-text("Create Note")')
    await page.fill('input[placeholder*="title"]', 'Test Frontend Note')
    await page.fill('textarea[placeholder*="content"]', 'Test content from frontend')
    await page.click('button:has-text("Create Note")')
    
    // Verify note appears
    await expect(page.getByText('Test Frontend Note')).toBeVisible()
  })

  test('upgrade prompt shows for free plan', async ({ page }) => {
    await page.goto('/')
    
    // Login as admin
    await page.fill('input[type="email"]', 'admin@acme.test')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Should see upgrade button for admin on free plan
    await expect(page.getByText('Upgrade to Pro')).toBeVisible()
  })
})