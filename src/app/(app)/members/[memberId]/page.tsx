"use client";

import { useParams } from "next/navigation";

import { getFamilyMemberProfileById } from "~/lib/mocks/family-members";

export default function MemberProfilePage() {
  const params = useParams<{ memberId: string }>();
  const member = getFamilyMemberProfileById(params.memberId);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Phase 1 Scaffold</p>
        <h1 className="font-semibold text-2xl tracking-tight">Member Profile Route</h1>
      </header>

      {member ? (
        <div className="rounded-2xl border bg-card p-4">
          <p className="font-medium">{member.name}</p>
          <p className="text-sm text-muted-foreground">{member.relationship} · {member.status}</p>
          <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
          No member found for id: {params.memberId}
        </div>
      )}
    </section>
  );
}
