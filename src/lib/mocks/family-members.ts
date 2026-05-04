export type FamilyMemberStatus = "claimed" | "unclaimed";

export type FamilyRelationship =
  | "Parent"
  | "Sibling"
  | "Child"
  | "Grandparent"
  | "Aunt/Uncle"
  | "Cousin"
  | "Family Friend";

export type FamilyMemberSummary = {
  id: string;
  name: string;
  relationship: FamilyRelationship;
  status: FamilyMemberStatus;
  avatarUrl?: string;
  addedByName: string;
  addedAtLabel: string;
};

export type FamilyMemberProfile = FamilyMemberSummary & {
  bio?: string;
  location?: string;
  note?: string;
  recentActivity: string[];
};

export type ClaimInvitePreview = {
  token: string;
  memberId: string;
  memberName: string;
  relationship: FamilyRelationship;
  familyName: string;
  invitedByName: string;
  status: "valid" | "expired" | "claimed";
};

export const familyMembers: FamilyMemberSummary[] = [
  {
    id: "member-emma-walker",
    name: "Emma Walker",
    relationship: "Parent",
    status: "claimed",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop",
    addedByName: "System",
    addedAtLabel: "Joined 1y ago",
  },
  {
    id: "member-noah-walker",
    name: "Noah Walker",
    relationship: "Parent",
    status: "claimed",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop",
    addedByName: "System",
    addedAtLabel: "Joined 1y ago",
  },
  {
    id: "member-lily-walker",
    name: "Lily Walker",
    relationship: "Child",
    status: "claimed",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop",
    addedByName: "Emma Walker",
    addedAtLabel: "Joined 8mo ago",
  },
  {
    id: "member-evelyn-walker",
    name: "Evelyn Walker",
    relationship: "Grandparent",
    status: "unclaimed",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop",
    addedByName: "Noah Walker",
    addedAtLabel: "Added 3mo ago",
  },
  {
    id: "member-logan-ross",
    name: "Logan Ross",
    relationship: "Sibling",
    status: "claimed",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop",
    addedByName: "Emma Walker",
    addedAtLabel: "Joined 6mo ago",
  },
  {
    id: "member-nina-ross",
    name: "Nina Ross",
    relationship: "Cousin",
    status: "unclaimed",
    addedByName: "Logan Ross",
    addedAtLabel: "Added 2mo ago",
  },
  {
    id: "member-ben-harper",
    name: "Ben Harper",
    relationship: "Aunt/Uncle",
    status: "unclaimed",
    avatarUrl:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=240&h=240&fit=crop",
    addedByName: "Noah Walker",
    addedAtLabel: "Added 1mo ago",
  },
  {
    id: "member-ava-kim",
    name: "Ava Kim",
    relationship: "Family Friend",
    status: "claimed",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop",
    addedByName: "Emma Walker",
    addedAtLabel: "Joined 4mo ago",
  },
];

export const familyMemberProfiles: FamilyMemberProfile[] = familyMembers.map((member) => ({
  ...member,
  bio:
    member.status === "claimed"
      ? `${member.name.split(" ")[0]} shares family updates and memories with the group.`
      : `${member.name.split(" ")[0]} has a profile in the family circle and can claim this account later.`,
  location: "Springfield",
  note: member.status === "unclaimed" ? "Claim invite pending" : undefined,
  recentActivity: [
    "Tagged in a weekend dinner memory",
    "Mentioned in family planning chat",
    "Added to summer reunion list",
  ],
}));

export const claimInvitePreviews: ClaimInvitePreview[] = [
  {
    token: "claim-rose-001",
    memberId: "member-evelyn-walker",
    memberName: "Evelyn Walker",
    relationship: "Grandparent",
    familyName: "The Walker Family",
    invitedByName: "Noah Walker",
    status: "valid",
  },
  {
    token: "claim-nina-002",
    memberId: "member-nina-ross",
    memberName: "Nina Ross",
    relationship: "Cousin",
    familyName: "The Walker Family",
    invitedByName: "Logan Ross",
    status: "expired",
  },
  {
    token: "claim-ben-003",
    memberId: "member-ben-harper",
    memberName: "Ben Harper",
    relationship: "Aunt/Uncle",
    familyName: "The Walker Family",
    invitedByName: "Emma Walker",
    status: "claimed",
  },
];

export const getFamilyMemberProfileById = (memberId: string) =>
  familyMemberProfiles.find((member) => member.id === memberId);

export const getClaimInvitePreviewByToken = (token: string) =>
  claimInvitePreviews.find((preview) => preview.token === token);
