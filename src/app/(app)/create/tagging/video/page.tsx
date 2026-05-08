import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "~/components/ui/button";
import { videoTaggingExamples } from "~/lib/mocks/tagging";

export default function VideoTaggingPage() {
  const example = videoTaggingExamples[0];

  if (!example) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="font-medium text-muted-foreground text-sm">Create / Tagging</p>
        <h1 className="font-semibold text-3xl tracking-tight">Video tagging</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Phase 1 route stub for timeline-based tagging. The page is connected to mock video moments so
          the full editor can be layered on next.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border bg-card p-5">
          <div className="rounded-2xl border border-dashed bg-muted/30 p-4">
            <p className="font-medium">{example.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{example.helperText}</p>

            <div className="mt-4 grid gap-2">
              {example.moments.map((moment) => (
                <div key={moment.id} className="rounded-2xl border bg-background px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-sm">
                      <Clock3 className="size-4 text-muted-foreground" aria-hidden="true" />
                      {moment.atLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">{moment.people.length} tagged</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {moment.people.map((person) => person.name).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border bg-card p-5">
          <h2 className="font-medium text-lg">Stub contents</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Typed timeline marker data</li>
            <li>Timestamp-to-people relationships</li>
            <li>Route ready for a split-pane editor</li>
          </ul>

          <Button asChild className="mt-5 w-full justify-between" variant="outline">
            <Link href="/create/tagging/photo">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to photo tagging
            </Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}