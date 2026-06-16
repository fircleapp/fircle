import bcrypt from "bcryptjs"

import { TRPCError } from "@trpc/server"

import { env } from "~/env"
import { getMemberSlugBase, resolveUniqueMemberSlug } from "~/lib/member-slug"
import { firstFamilySetupInputSchema } from "~/lib/setup-schemas"
import { checkRateLimit, getClientIp } from "~/lib/rate-limit"
import { getConfiguredEmailDriver } from "~/server/email/provider"
import { isPushConfigured } from "~/server/push"
import { createStorageProvider } from "~/server/storage/provider"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

type SetupCheckStatus = "ok" | "warning" | "blocking"

type SetupReadinessCheck = {
  key: "database" | "auth" | "storage" | "push" | "email"
  label: string
  status: SetupCheckStatus
  message: string
  remediation?: string
}

export const setupRouter = createTRPCRouter({
  getBootstrapStatus: publicProcedure.query(async ({ ctx }) => {
    if (!env.SELF_HOSTED) {
      return {
        selfHosted: false,
        requiresSetup: false,
      }
    }

    const existingFamily = await ctx.db.family.findFirst({
      select: { id: true },
    })

    return {
      selfHosted: true,
      requiresSetup: !existingFamily,
    }
  }),

  getSetupReadiness: publicProcedure.query(async ({ ctx }) => {
    if (!env.SELF_HOSTED) {
      return {
        selfHosted: false,
        checks: [] as SetupReadinessCheck[],
        hasBlocking: false,
        canProceed: false,
      }
    }

    const checks: SetupReadinessCheck[] = []

    // 1) Database readiness
    try {
      await ctx.db.$queryRawUnsafe("SELECT 1")
      checks.push({
        key: "database",
        label: "Database",
        status: "ok",
        message: "Database connection is healthy.",
      })
    } catch {
      checks.push({
        key: "database",
        label: "Database",
        status: "blocking",
        message: "Database connection failed.",
        remediation: "Verify DATABASE_URL and ensure the database server is reachable.",
      })
    }

    // 2) Auth secret readiness
    if (env.AUTH_SECRET) {
      checks.push({
        key: "auth",
        label: "Auth secret",
        status: "ok",
        message: "AUTH_SECRET is configured.",
      })
    } else {
      const isBlocking = env.NODE_ENV === "production"
      checks.push({
        key: "auth",
        label: "Auth secret",
        status: isBlocking ? "blocking" : "warning",
        message: isBlocking
          ? "AUTH_SECRET is missing in production."
          : "AUTH_SECRET is not set (allowed in development).",
        remediation: "Set AUTH_SECRET to a strong random value before production use.",
      })
    }

    // 3) Storage readiness (R2 signing probe)
    try {
      const provider = createStorageProvider()
      await provider.signUpload({
        objectKey: "setup-readiness/probe.txt",
        mimeType: "text/plain",
        sizeBytes: 1,
      })

      checks.push({
        key: "storage",
        label: "Object storage",
        status: "ok",
        message: "Storage provider initialized and upload signing works.",
      })
    } catch {
      checks.push({
        key: "storage",
        label: "Object storage",
        status: "blocking",
        message: "Storage provider is not ready.",
        remediation: "Verify STORAGE_DRIVER and R2_* environment variables.",
      })
    }

    // 4) Push/VAPID readiness
    if (isPushConfigured()) {
      checks.push({
        key: "push",
        label: "Web Push (VAPID)",
        status: "ok",
        message: "VAPID keys are configured.",
      })
    } else {
      const isBlocking = env.NODE_ENV === "production"
      checks.push({
        key: "push",
        label: "Web Push (VAPID)",
        status: isBlocking ? "blocking" : "warning",
        message: isBlocking
          ? "VAPID keys are required in production."
          : "VAPID keys are not configured (push notifications disabled).",
        remediation:
          "Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT.",
      })
    }

    // 5) Email readiness (optional unless configured)
    try {
      const configuredDriver = getConfiguredEmailDriver()

      if (!configuredDriver) {
        checks.push({
          key: "email",
          label: "Transactional email",
          status: "warning",
          message: "No email driver configured.",
          remediation: "Set EMAIL_DRIVER and provider keys to enable email invites/notifications.",
        })
      } else {
        checks.push({
          key: "email",
          label: "Transactional email",
          status: "ok",
          message: `${configuredDriver} provider configuration is valid.`,
        })
      }
    } catch {
      checks.push({
        key: "email",
        label: "Transactional email",
        status: "blocking",
        message: "Email provider configuration is invalid.",
        remediation: "Verify EMAIL_DRIVER and provider-specific env variables.",
      })
    }

    const hasBlocking = checks.some((check) => check.status === "blocking")

    return {
      selfHosted: true,
      checks,
      hasBlocking,
      canProceed: !hasBlocking,
    }
  }),

  bootstrapFirstFamily: publicProcedure
    .input(firstFamilySetupInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!env.SELF_HOSTED) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "First-family bootstrap is available only in self-hosted mode.",
        })
      }

      const ip = getClientIp(ctx.headers)
      const setupRateLimit = checkRateLimit(`setup:first-family:${ip}`, 5, 15 * 60_000)
      if (!setupRateLimit.ok) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many setup attempts. Please try again later.",
        })
      }

      const hasAnyFamily = await ctx.db.family.findFirst({
        select: { id: true },
      })

      if (hasAnyFamily) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This instance is already configured. Sign in to continue.",
        })
      }

      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email is already in use. Choose another address or sign in.",
        })
      }

      const hashedPassword = await bcrypt.hash(input.password, 12)

      const created = await ctx.db.$transaction(async (tx) => {
        const family = await tx.family.create({
          data: {
            name: input.familyName,
          },
          select: {
            id: true,
            name: true,
          },
        })

        const user = await tx.user.create({
          data: {
            email: input.email,
            password: hashedPassword,
          },
          select: {
            id: true,
            email: true,
          },
        })

        const memberSlug = await resolveUniqueMemberSlug(
          tx,
          family.id,
          getMemberSlugBase(input.ownerName, input.ownerNickname),
        )

        await tx.familyMember.create({
          data: {
            familyId: family.id,
            userId: user.id,
            name: input.ownerName,
            nickname: input.ownerNickname ?? null,
            slug: memberSlug,
            role: "OWNER",
          },
          select: {
            id: true,
          },
        })

        return {
          family,
          user,
        }
      })

      return {
        family: created.family,
        user: created.user,
      }
    }),
})
