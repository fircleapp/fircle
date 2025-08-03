import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { db } from '@/lib/db'

export const familyMemberRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.familyMember.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.familyMember.findUnique({
        where: { id: input.id },
      })
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
      })
    )
    .mutation(async ({ input }) => {
      return db.familyMember.create({
        data: {
          name: input.name,
          email: input.email,
        },
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Invalid email address').optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db.familyMember.update({
        where: { id },
        data,
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.familyMember.delete({
        where: { id: input.id },
      })
    }),
})
