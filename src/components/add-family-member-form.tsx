'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export function AddFamilyMemberForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const utils = api.useUtils()
  const createMember = api.familyMember.create.useMutation({
    onSuccess: () => {
      utils.familyMember.getAll.invalidate()
      setName('')
      setEmail('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && email.trim()) {
      createMember.mutate({ name: name.trim(), email: email.trim() })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter family member's name"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email address"
          required
        />
      </div>

      {createMember.error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {createMember.error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={createMember.isPending || !name.trim() || !email.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createMember.isPending ? 'Adding...' : 'Add Family Member'}
      </button>
    </form>
  )
}
