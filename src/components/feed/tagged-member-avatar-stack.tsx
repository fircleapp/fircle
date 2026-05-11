import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type TaggedMember = {
  name: string;
  avatarUrl: string;
};

type TaggedMemberAvatarStackProps = {
  members: TaggedMember[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TaggedMemberAvatarStack({ members }: TaggedMemberAvatarStackProps) {
  const visibleMembers = members.slice(0, 3);
  const remainingCount = members.length - visibleMembers.length;

  if (visibleMembers.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center"
      aria-label={`Tagged members: ${members.map((m) => m.name).join(", ")}`}
    >
      {visibleMembers.map((member, index) => (
        <Avatar
          key={member.name}
          className="-ml-2 size-8 border-2 border-background/70 shadow-sm"
          style={{ zIndex: visibleMembers.length - index }}
          aria-label={member.name}
          title={member.name}
        >
          <AvatarImage src={member.avatarUrl} alt={member.name} />
          <AvatarFallback className="bg-card text-[10px] font-semibold text-foreground">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
      ))}

      {remainingCount > 0 ? (
        <div
          className="-ml-2 flex size-8 items-center justify-center rounded-full border-2 border-background/70 bg-muted text-[10px] font-semibold text-muted-foreground shadow-sm"
          title={`${remainingCount} more tagged`}
        >
          +{remainingCount}
        </div>
      ) : null}
    </div>
  );
}