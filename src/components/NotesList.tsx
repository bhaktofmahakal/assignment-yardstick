'use client'

import { useState } from 'react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  user: { email: string }
}

interface NotesListProps {
  notes: Note[]
  token: string
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NotesList({ notes, token, onEdit, onDelete }: NotesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return
    }

    setDeletingId(noteId)
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onDelete(noteId)
      } else {
        alert('Failed to delete note')
      }
    } catch (err) {
      alert('Failed to delete note')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No notes yet</div>
        <p className="text-gray-400">Create your first note to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="card">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {note.title}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(note)}
                  className="btn btn-secondary text-xs px-2 py-1 h-auto"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="btn btn-danger text-xs px-2 py-1 h-auto"
                >
                  {deletingId === note.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">
              {note.content}
            </p>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>Created by {note.user.email}</span>
              <div className="space-x-4">
                <span>Created: {formatDate(note.createdAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <span>Updated: {formatDate(note.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}