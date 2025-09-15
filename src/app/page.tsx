'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/components/LoginForm'
import { NotesApp } from '@/components/NotesApp'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (loginData: { token: string; user: any }) => {
    setToken(loginData.token)
    setUser(loginData.user)
    localStorage.setItem('token', loginData.token)
    localStorage.setItem('user', JSON.stringify(loginData.user))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!token || !user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <NotesApp user={user} token={token} onLogout={handleLogout} />
      )}
    </main>
  )
}