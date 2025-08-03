import { FamilyMemberList } from '@/components/family-member-list'
import { AddFamilyMemberForm } from '@/components/add-family-member-form'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Fircle
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Your family circle management app built with Next.js, tRPC, and Prisma
        </p>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Add Family Member</h2>
            <AddFamilyMemberForm />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Family Members</h2>
            <FamilyMemberList />
          </div>
        </div>
      </div>
    </div>
  )
}
