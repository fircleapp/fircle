import { PlayCircle } from "~/components/ui/icons";

type PostVideoCardProps = {
  title: string;
  durationLabel?: string;
};

export function PostVideoCard({ title, durationLabel }: PostVideoCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/50">
      <div className="aspect-video p-1.5 sm:p-3">
        <div className="relative flex h-full items-center justify-center rounded-xl border border-border/70 bg-background">
          <PlayCircle className="size-9 text-muted-foreground sm:size-12" aria-hidden="true" />

          {durationLabel ? (
            <span className="absolute bottom-2 right-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[11px] text-foreground">
              {durationLabel}
            </span>
          ) : null}
        </div>
      </div>
      <p className="max-w-[75%] truncate px-3 pb-3 text-xs text-muted-foreground">{title}</p>
    </article>
  );
}
