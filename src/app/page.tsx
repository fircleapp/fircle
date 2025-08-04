import { MemberList } from '@/components/member-list'
import { AddMemberForm } from '@/components/add-member-form'
import { PostList } from '@/components/post-list'
import { ProtectedContent, AppNavigation } from '@/components/protected-content'

export default function HomePage() {
  return (
    <ProtectedContent>
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Welcome to Fircle
          </h1>
          <p className="text-lg text-gray-600 text-center mb-12">
            Your family circle management app with enhanced member and post management
          </p>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Add Member Form */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-semibold mb-4">Add Family Member</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <AddMemberForm />
              </div>
            </div>
            
            {/* Members List */}
            <div className="lg:col-span-2">
              <MemberList />
            </div>
          </div>

          {/* Posts Section */}
          <div className="mt-12">
            <PostList />
          </div>

          {/* Information Section */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-blue-900">
              🎉 Authentication System Active
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>✅ You are now logged in and your account is linked to a family member profile.</p>
              <p>✅ All pages are protected - only authenticated users can access them.</p>
              <p>✅ Your member profile allows you to be tagged in posts and participate in family activities.</p>
              <p>✅ You can create posts, add family members, and manage your family circle.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedContent>
  )
}
