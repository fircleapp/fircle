'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { api } from '@/lib/api'
import { MemberClaimingFlow } from '@/components/member-claiming-flow'

export function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user: supabaseUser, loading: authLoading } = useSupabase()
  const { data: userInfo, isLoading: userInfoLoading } = api.auth.getMe.useQuery(
    undefined,
    { enabled: !!supabaseUser }
  )

  // Show loading state while checking authentication
  if (authLoading || (supabaseUser && userInfoLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // User is authenticated but needs to claim/create a member profile
  if (supabaseUser && userInfo?.needsClaiming) {
    return <MemberClaimingFlow />
  }

  // User is fully authenticated and has a linked member profile
  return <>{children}</>
}

// Navigation component for authenticated users
export function AppNavigation() {
  const { user: supabaseUser, signOut } = useSupabase()
  const { data: userInfo } = api.auth.getMe.useQuery(
    undefined,
    { enabled: !!supabaseUser }
  )

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Fircle</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {userInfo?.member && (
              <span className="text-sm text-gray-600">
                Welcome, {userInfo.member.name}
              </span>
            )}
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
