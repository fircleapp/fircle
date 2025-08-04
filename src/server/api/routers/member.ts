import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { db } from '@/lib/db'

export const memberRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return db.member.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true, // Include user data if member has an account
        taggedIn: {
          include: {
            post: {
              include: {
                author: {
                  include: {
                    member: true
                  }
                }
              }
            }
          }
        }
      },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.member.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          taggedIn: {
            include: {
              post: {
                include: {
                  author: {
                    include: {
                      member: true
                    }
                  }
                }
              }
            }
          }
        },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address').optional(),
        birthDate: z.date().optional(),
        bio: z.string().optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.member.create({
        data: input,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Invalid email address').optional(),
        birthDate: z.date().optional(),
        bio: z.string().optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db.member.update({
        where: { id },
        data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.member.delete({
        where: { id: input.id },
      })
    }),

  // Get unclaimed members (members without user accounts)
  getUnclaimed: protectedProcedure.query(async () => {
    return db.member.findMany({
      where: {
        user: null
      },
      orderBy: { createdAt: 'desc' }
    })
  }),
})
