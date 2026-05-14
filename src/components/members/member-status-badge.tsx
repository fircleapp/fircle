import { Badge } from "~/components/ui/badge";
import { BadgeAlertIcon, Check, Clock3 } from "~/components/ui/icons";
import type { FamilyMemberStatus } from "~/lib/mocks/family-members";

type MemberStatusBadgeProps = {
  status: FamilyMemberStatus;
  hasPendingClaimInvite?: boolean;
  className?: string;
};

export function MemberStatusBadge({
  status,
  hasPendingClaimInvite = false,
  className,
}: MemberStatusBadgeProps) {
  const isClaimed = status === "claimed";
  const showClaimPending = !isClaimed && hasPendingClaimInvite;

  if (showClaimPending) {
    return <ClaimPendingBadge className={className} />;
  }

  return (
    <Badge
      className={className}
      variant={isClaimed ? "default" : "outline"}
    >
      {isClaimed ? (
        <Check data-icon="inline-start" aria-hidden="true" />
      ) : (
        <BadgeAlertIcon data-icon="inline-start" aria-hidden="true" />
      )}
      {isClaimed ? "Claimed" : "Unclaimed"}
    </Badge>
  );
}

export function ClaimPendingBadge({ className }: { className?: string }) {
  return (
    <Badge className={className} variant="secondary">
      <Clock3 data-icon="inline-start" aria-hidden="true" />
      Claim pending
    </Badge>
  );
}
