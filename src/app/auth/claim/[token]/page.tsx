"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { getClaimInvitePreviewByToken } from "~/lib/mocks/family-members";

export default function ClaimAccountPage() {
  const params = useParams<{ token: string }>();
  const claimPreview = getClaimInvitePreviewByToken(params.token);

  return (
    <main className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Phase 1 Scaffold</p>
        <h1 className="font-semibold text-2xl tracking-tight">Claim Family Profile</h1>

        {claimPreview ? (
          <div className="rounded-2xl border bg-muted/30 p-4 text-sm">
            <p className="font-medium">{claimPreview.memberName}</p>
            <p className="text-muted-foreground">
              {claimPreview.relationship} · {claimPreview.familyName}
            </p>
            <p className="mt-2 text-muted-foreground">
              Invite by {claimPreview.invitedByName} · status: {claimPreview.status}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            No claim preview found for token: {params.token}
          </div>
        )}

        <Link
          href="/auth/signin"
          className="inline-flex text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
