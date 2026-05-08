import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "~/components/ui/button";
import { photoTaggingExamples } from "~/lib/mocks/tagging";

export default function PhotoTaggingPage() {
  const example = photoTaggingExamples[0];

  if (!example) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="font-medium text-muted-foreground text-sm">Create / Tagging</p>
        <h1 className="font-semibold text-3xl tracking-tight">Photo tagging</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Phase 1 route stub for the upcoming photo tag editor. Mock data is wired so the full UI can
          be built without revisiting route or data shape decisions.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border bg-card p-5">
          <div className="aspect-[4/3] rounded-2xl border border-dashed bg-muted/30 p-4">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-background/70 p-4">
              <div>
                <p className="font-medium">{example.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{example.helperText}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {example.anchors.map((anchor) => (
                  <span
                    key={anchor.id}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground"
                  >
                    <Tag className="size-3.5" aria-hidden="true" />
                    {anchor.person.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border bg-card p-5">
          <h2 className="font-medium text-lg">Stub contents</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Visible anchor markers from typed mock data</li>
            <li>Claimed and unclaimed member labels</li>
            <li>Dedicated route ready for the real editor UI</li>
          </ul>

          <Button asChild className="mt-5 w-full justify-between">
            <Link href="/create/tagging/video">
              Continue to video tagging
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}