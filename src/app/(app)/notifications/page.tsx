import { BellRing } from "lucide-react";

import { tagNotifications } from "~/lib/mocks/tagging";

export default function NotificationsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="font-medium text-muted-foreground text-sm">Activity</p>
        <h1 className="font-semibold text-3xl tracking-tight">Notifications</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Phase 1 route stub for tag and memory activity. The page now resolves structured mock
          notifications so the full UI can be implemented on a stable foundation.
        </p>
      </header>

      <section className="rounded-3xl border bg-card p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BellRing className="size-4" aria-hidden="true" />
          {tagNotifications.length} mock notifications loaded
        </div>

        <div className="mt-4 space-y-3">
          {tagNotifications.map((notification) => (
            <article key={notification.id} className="rounded-2xl border bg-muted/20 px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                </div>
                <span className="text-xs text-muted-foreground">{notification.createdAtLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}