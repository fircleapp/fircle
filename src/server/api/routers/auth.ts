import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { db } from '@/lib/db'
import { TRPCError } from '@trpc/server'

export const authRouter = createTRPCRouter({
  // Get current user info
  getMe: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return {
        supabaseUser: ctx.supabaseUser,
        user: null,
        member: null,
        needsClaiming: true,
      }
    }

    return {
      supabaseUser: ctx.supabaseUser,
      user: ctx.user,
      member: ctx.user.member,
      needsClaiming: false,
    }
  }),

  // Get unclaimed members for the claiming process
  getUnclaimedMembers: protectedProcedure.query(async () => {
    return db.member.findMany({
      where: {
        user: null, // Members without linked user accounts
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Claim an existing member profile
  claimMember: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already has a linked account
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email: ctx.supabaseUser.email! },
            { providerId: ctx.supabaseUser.id },
          ]
        }
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already has a linked account',
        })
      }

      // Check if member exists and is unclaimed
      const member = await db.member.findUnique({
        where: { id: input.memberId },
        include: { user: true }
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found',
        })
      }

      if (member.user) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Member already has a linked user account',
        })
      }

      // Create user record and link to member
      const user = await db.user.create({
        data: {
          email: ctx.supabaseUser.email!,
          username: ctx.supabaseUser.user_metadata?.username || ctx.supabaseUser.email?.split('@')[0],
          provider: 'supabase',
          providerId: ctx.supabaseUser.id,
          memberId: input.memberId,
        },
        include: {
          member: true,
        },
      })

      return user
    }),

  // Create a new member and link to user
  createMemberAndLink: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        bio: z.string().optional(),
        birthDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already has a linked account
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email: ctx.supabaseUser.email! },
            { providerId: ctx.supabaseUser.id },
          ]
        }
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already has a linked account',
        })
      }

      // Create member and user in a transaction
      const result = await db.$transaction(async (prisma) => {
        // Create the member
        const member = await prisma.member.create({
          data: {
            name: input.name,
            email: ctx.supabaseUser.email,
            bio: input.bio,
            birthDate: input.birthDate,
          },
        })

        // Create the user and link to member
        const user = await prisma.user.create({
          data: {
            email: ctx.supabaseUser.email!,
            username: ctx.supabaseUser.user_metadata?.username || ctx.supabaseUser.email?.split('@')[0],
            provider: 'supabase',
            providerId: ctx.supabaseUser.id,
            memberId: member.id,
          },
          include: {
            member: true,
          },
        })

        return user
      })

      return result
    }),
})
