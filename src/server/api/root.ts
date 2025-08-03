import { createTRPCRouter } from './trpc'
import { familyMemberRouter } from './routers/familyMember'

export const appRouter = createTRPCRouter({
  familyMember: familyMemberRouter,
})

export type AppRouter = typeof appRouter
