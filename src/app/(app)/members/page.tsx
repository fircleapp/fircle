import Link from "next/link";

import { familyMembers } from "~/lib/mocks/family-members";

export default function MembersPage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Phase 1 Scaffold</p>
        <h1 className="font-semibold text-2xl tracking-tight">Family Members</h1>
        <p className="text-sm text-muted-foreground">
          Route and mock data foundation is in place. Full directory UI arrives in Phase 2.
        </p>
      </header>

      <div className="rounded-2xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">Mock members loaded: {familyMembers.length}</p>
        <ul className="mt-3 space-y-2">
          {familyMembers.slice(0, 5).map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{member.name}</span>
              <span className="text-muted-foreground">{member.relationship}</span>
              <span className="text-muted-foreground">{member.status}</span>
              <Link href={`/members/${member.id}`} className="underline-offset-4 hover:underline">
                Open
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <Link
            href="/members/new"
            className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
          >
            Go to add-member route
          </Link>
        </div>
      </div>
    </section>
  );
}