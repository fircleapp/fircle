'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useSupabase } from '@/components/providers/supabase-provider'

export function MemberClaimingFlow() {
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const { user: supabaseUser } = useSupabase()

  const { data: unclaimedMembers, isLoading: loadingMembers } = api.auth.getUnclaimedMembers.useQuery()
  const utils = api.useUtils()

  const claimMember = api.auth.claimMember.useMutation({
    onSuccess: () => {
      utils.auth.getMe.invalidate()
      window.location.reload() // Refresh to update auth state
    },
  })

  const createAndLink = api.auth.createMemberAndLink.useMutation({
    onSuccess: () => {
      utils.auth.getMe.invalidate()
      window.location.reload() // Refresh to update auth state
    },
  })

  const handleClaimMember = (memberId: string) => {
    claimMember.mutate({ memberId })
  }

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      createAndLink.mutate({
        name: name.trim(),
        bio: bio.trim() || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      })
    }
  }

  if (loadingMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome to Fircle!
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Hi {supabaseUser?.email}! Let's set up your family profile.
          </p>
        </div>

        {!showCreateNew && unclaimedMembers && unclaimedMembers.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Claim Your Existing Profile
            </h2>
            <p className="text-gray-600 mb-6">
              We found some family members who might be you. Select your profile to claim it:
            </p>
            
            <div className="space-y-3">
              {unclaimedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    {member.email && (
                      <p className="text-sm text-gray-600">{member.email}</p>
                    )}
                    {member.bio && (
                      <p className="text-sm text-gray-500 mt-1">{member.bio}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleClaimMember(member.id)}
                    disabled={claimMember.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {claimMember.isPending ? 'Claiming...' : 'This is me'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowCreateNew(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                None of these are me → Create new profile
              </button>
            </div>
          </div>
        )}

        {(showCreateNew || !unclaimedMembers || unclaimedMembers.length === 0) && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Create Your Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Let's create a new family member profile for you.
            </p>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                  Birth Date (optional)
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio (optional)
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              {(claimMember.error || createAndLink.error) && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                  {claimMember.error?.message || createAndLink.error?.message}
                </div>
              )}

              <div className="flex gap-3">
                {unclaimedMembers && unclaimedMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCreateNew(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Back to claiming
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createAndLink.isPending || !name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createAndLink.isPending ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
