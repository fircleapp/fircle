'use client'

import { api } from '@/lib/api'

export function FamilyMemberList() {
  const { data: familyMembers, isLoading, error } = api.familyMember.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Error loading family members: {error.message}
      </div>
    )
  }

  if (!familyMembers || familyMembers.length === 0) {
    return (
      <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg">
        No family members found. Add one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {familyMembers.map((member) => (
        <div key={member.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg">{member.name}</h3>
          <p className="text-gray-600">{member.email}</p>
          <p className="text-sm text-gray-400">
            Added {new Date(member.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}
