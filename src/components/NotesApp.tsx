'use client'

import { useState, useEffect } from 'react'
import { NotesList } from './NotesList'
import { CreateNoteForm } from './CreateNoteForm'
import { EditNoteForm } from './EditNoteForm'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  user: { email: string }
}

interface NotesAppProps {
  user: any
  token: string
  onLogout: () => void
}

export function NotesApp({ user, token, onLogout }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [error, setError] = useState('')
  const [upgrading, setUpgrading] = useState(false)

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else {
        console.error('Failed to fetch notes')
      }
    } catch (err) {
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [token])

  const handleNoteCreated = (newNote: Note) => {
    setNotes([newNote, ...notes])
    setShowCreateForm(false)
    setError('')
  }

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ))
    setEditingNote(null)
  }

  const handleNoteDeleted = (deletedNoteId: string) => {
    setNotes(notes.filter(note => note.id !== deletedNoteId))
  }

  const handleCreateError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleUpgrade = async () => {
    if (!user.tenant?.slug) return
    
    setUpgrading(true)
    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert('Successfully upgraded to Pro plan!')
        setError('')
        fetchNotes()
      } else {
        const data = await response.json()
        alert(`Upgrade failed: ${data.error}`)
      }
    } catch (err) {
      alert('Upgrade failed')
    } finally {
      setUpgrading(false)
    }
  }

  const canUpgrade = user.role === 'ADMIN' && user.tenant?.plan === 'FREE'
  const isAtLimit = user.tenant?.plan === 'FREE' && notes.length >= 3

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-600">
                {user.email} • {user.tenant?.name} • {user.role} • {user.tenant?.plan} Plan
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {canUpgrade && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="btn btn-primary"
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                </button>
              )}
              <button
                onClick={onLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
              {error.includes('Free plan limited') && canUpgrade && (
                <button
                  onClick={handleUpgrade}
                  className="ml-4 btn btn-primary text-sm"
                  disabled={upgrading}
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade Now'}
                </button>
              )}
            </div>
          )}

          {isAtLimit && !showCreateForm && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              You&apos;ve reached the Free plan limit of 3 notes.
              {canUpgrade && (
                <button
                  onClick={handleUpgrade}
                  className="ml-4 btn btn-primary text-sm"
                  disabled={upgrading}
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Notes ({notes.length})
            </h2>
            {!showCreateForm && !editingNote && (
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={isAtLimit}
                className="btn btn-primary"
              >
                Create Note
              </button>
            )}
          </div>

          {showCreateForm && (
            <CreateNoteForm
              token={token}
              onNoteCreated={handleNoteCreated}
              onCancel={() => setShowCreateForm(false)}
              onError={handleCreateError}
            />
          )}

          {editingNote && (
            <EditNoteForm
              note={editingNote}
              token={token}
              onNoteUpdated={handleNoteUpdated}
              onCancel={() => setEditingNote(null)}
            />
          )}

          {!showCreateForm && !editingNote && (
            <NotesList
              notes={notes}
              token={token}
              onEdit={setEditingNote}
              onDelete={handleNoteDeleted}
            />
          )}
        </div>
      </main>
    </div>
  )
}