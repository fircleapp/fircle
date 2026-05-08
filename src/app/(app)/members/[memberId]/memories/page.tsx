import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "~/components/ui/button";
import { getFamilyMemberProfileById } from "~/lib/mocks/family-members";
import { getTaggedMemoriesByMemberId } from "~/lib/mocks/tagging";

type MemberMemoriesPageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function MemberMemoriesPage({ params }: MemberMemoriesPageProps) {
  const { memberId } = await params;
  const member = getFamilyMemberProfileById(memberId);

  if (!member) {
    notFound();
  }

  const memories = getTaggedMemoriesByMemberId(memberId);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">Members / Memories</p>
          <h1 className="font-semibold text-3xl tracking-tight">Memories with {member.name}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Phase 1 archive route stub. It already resolves the member profile and pulls tagged-memory
            mock data for later grid and filter work.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/members/${member.id}`}>Back to profile</Link>
        </Button>
      </header>

      <section className="rounded-3xl border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {memories.map((memory) => (
            <article key={memory.id} className="rounded-2xl border bg-muted/20 p-4">
              <p className="font-medium">{memory.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{memory.caption}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                {memory.type} · {memory.createdAtLabel}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}