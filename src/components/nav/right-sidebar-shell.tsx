import Link from "next/link";
import {
  type RightSidebarContribution,
  type RightSidebarSection,
} from "~/components/nav/right-sidebar-types";

const baseSections: RightSidebarSection[] = [
  {
    id: "quick-access",
    title: "Quick Access",
    items: [
      {
        id: "family-settings",
        label: "Family Settings",
        href: "/settings/family",
        description: "Manage family profile details and preferences.",
        sortOrder: 10,
      },
      {
        id: "invites",
        label: "Invites",
        href: "/settings/invites",
        description: "Review invite links and pending invite access.",
        sortOrder: 20,
      },
      {
        id: "members",
        label: "Members",
        href: "/members",
        description: "Browse member profiles and identities.",
        sortOrder: 30,
      },
    ],
    sortOrder: 10,
  },
  {
    id: "helpful-pages",
    title: "Helpful Pages",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        href: "/notifications",
        description: "Catch up on recent mentions and activity.",
        sortOrder: 10,
      },
      {
        id: "gallery",
        label: "Gallery",
        href: "/gallery",
        description: "View photos and videos shared by your family.",
        sortOrder: 20,
      },
    ],
    sortOrder: 20,
  },
];

// Future feature modules should pass contributions into this slot.
const optionalContribution: RightSidebarContribution = {
  sections: [],
  items: [],
};

function bySortOrder<T extends { sortOrder?: number }>(a: T, b: T) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

function composeRightSidebarSections(input: {
  base: RightSidebarSection[];
  contribution: RightSidebarContribution;
}) {
  const normalizedBase = input.base.map((section) => ({
    ...section,
    items: [...section.items].sort(bySortOrder),
  }));

  const contributedSections = (input.contribution.sections ?? []).map((section) => ({
    ...section,
    items: [...section.items].sort(bySortOrder),
  }));

  const optionalItemsSection: RightSidebarSection | null =
    (input.contribution.items?.length ?? 0) > 0
      ? {
          id: "more-for-you",
          title: "More for You",
          sortOrder: 999,
          items: [...(input.contribution.items ?? [])].sort(bySortOrder),
        }
      : null;

  return [...normalizedBase, ...contributedSections, ...(optionalItemsSection ? [optionalItemsSection] : [])].sort(bySortOrder);
}

export function RightSidebarShell() {
  const sections = composeRightSidebarSections({
    base: baseSections,
    contribution: optionalContribution,
  });

  const hasOptionalContent =
    (optionalContribution.items?.length ?? 0) > 0 ||
    (optionalContribution.sections?.length ?? 0) > 0;

  return (
    <aside
      aria-label="Right sidebar"
      className="hidden border-border xl:flex xl:w-80 xl:shrink-0 xl:flex-col xl:border-l"
    >
      <div className="h-full overflow-y-auto p-4">
        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.id} className="rounded-2xl border border-border bg-card/60 p-4">
              <h2 className="mb-3 font-semibold text-sm tracking-wide text-muted-foreground uppercase">
                {section.title}
              </h2>

              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="block rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
                    >
                      <p className="font-medium text-sm text-foreground">{item.label}</p>
                      {item.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-2xl border border-dashed border-border bg-card/40 p-4">
            <h2 className="mb-2 font-semibold text-sm tracking-wide text-muted-foreground uppercase">
              More for You
            </h2>

            {hasOptionalContent ? (
              <p className="text-xs text-muted-foreground">
                Optional contributed content is active and composed into sections above.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No optional sidebar items are available yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}
