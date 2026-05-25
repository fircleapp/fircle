import type { Prisma } from "../../generated/prisma"

export type NotificationCategory = "TAG" | "MENTION" | "ENGAGEMENT" | "INVITE" | "SYSTEM"

export type NotificationEventType =
  | "MEDIA_TAG_CREATED"
  | "MEDIA_TAG_UPDATED"
  | "POST_MENTION_CREATED"
  | "COMMENT_MENTION_CREATED"
  | "POST_COMMENT_CREATED"
  | "COMMENT_REPLIED"
  | "POST_LIKED"
  | "COMMENT_LIKED"
  | "INVITE_CREATED"
  | "INVITE_STATUS_CHANGED"
  | "SYSTEM_EVENT"

export type NotificationSeed = {
  familyId: string
  recipientMemberId: string
  actorMemberId?: string | null
  category: NotificationCategory
  eventType: NotificationEventType
  sourceType: string
  sourceId: string
  title: string
  body: string
}

type NotificationTx = Prisma.TransactionClient

const IN_APP_CHANNEL = "IN_APP" as const
const QUEUED_STATUS = "QUEUED" as const

export async function createNotifications(tx: NotificationTx, seeds: NotificationSeed[]) {
  for (const seed of seeds) {
    const existing = await tx.notification.findUnique({
      where: {
        familyId_recipientMemberId_eventType_sourceType_sourceId: {
          familyId: seed.familyId,
          recipientMemberId: seed.recipientMemberId,
          eventType: seed.eventType,
          sourceType: seed.sourceType,
          sourceId: seed.sourceId,
        },
      },
      select: { id: true },
    })

    if (existing) {
      continue
    }

    const notification = await tx.notification.create({
      data: {
        familyId: seed.familyId,
        recipientMemberId: seed.recipientMemberId,
        actorMemberId: seed.actorMemberId ?? null,
        category: seed.category,
        eventType: seed.eventType,
        sourceType: seed.sourceType,
        sourceId: seed.sourceId,
        title: seed.title,
        body: seed.body,
      },
      select: {
        id: true,
      },
    })

    await tx.notificationDeliveryLog.create({
      data: {
        notificationId: notification.id,
        channel: IN_APP_CHANNEL,
        status: QUEUED_STATUS,
      },
    })
  }
}

export async function getClaimedMemberIds(
  tx: NotificationTx,
  familyId: string,
  memberIds: string[],
) {
  if (memberIds.length === 0) {
    return []
  }

  const uniqueMemberIds = [...new Set(memberIds)]

  const members = await tx.familyMember.findMany({
    where: {
      familyId,
      id: { in: uniqueMemberIds },
      userId: { not: null },
    },
    select: {
      id: true,
    },
  })

  return members.map((member) => member.id)
}

export async function getClaimedAdminMemberIds(
  tx: NotificationTx,
  familyId: string,
  excludeMemberIds: string[] = [],
) {
  const members = await tx.familyMember.findMany({
    where: {
      familyId,
      role: { in: ["OWNER", "ADMIN"] },
      userId: { not: null },
      ...(excludeMemberIds.length > 0
        ? {
            id: { notIn: excludeMemberIds },
          }
        : {}),
    },
    select: {
      id: true,
    },
  })

  return members.map((member) => member.id)
}