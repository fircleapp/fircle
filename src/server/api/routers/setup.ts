import bcrypt from "bcryptjs"

import { TRPCError } from "@trpc/server"

import { env } from "~/env"
import { getMemberSlugBase, resolveUniqueMemberSlug } from "~/lib/member-slug"
import { firstFamilySetupInputSchema } from "~/lib/setup-schemas"
import { checkRateLimit, getClientIp } from "~/lib/rate-limit"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

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

  getSetupReadiness: publicProcedure.query(async () => {
    if (!env.SELF_HOSTED) {
      return {
        selfHosted: false,
        checks: [],
      }
    }

    // Placeholder readiness payload; detailed checks are implemented in Phase 4.
    return {
      selfHosted: true,
      checks: [],
    }
  }),

  bootstrapFirstFamily: publicProcedure
    .input(firstFamilySetupInputSchema)
    .mutation(async ({ ctx, input }) => {
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
