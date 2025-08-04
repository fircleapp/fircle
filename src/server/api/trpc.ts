import { initTRPC, TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import superjson from 'superjson'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

// Create context for tRPC
export async function createTRPCContext(opts?: FetchCreateContextFnOptions) {
  const supabase = await createClient()
  
  // Get the session from the request
  const { data: { session } } = await supabase.auth.getSession()
  
  let user = null
  if (session?.user) {
    // Look up the User record in our database
    user = await db.user.findFirst({
      where: {
        OR: [
          { email: session.user.email! },
          { providerId: session.user.id },
        ]
      },
      include: {
        member: true,
      }
    })
  }

  return {
    session,
    user,
    supabaseUser: session?.user || null,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

// Public procedure - no auth required
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.supabaseUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      supabaseUser: ctx.supabaseUser,
    },
  })
})

// User procedure - requires both authentication and linked user account
export const userProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.supabaseUser || !ctx.user) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'Must be logged in with a linked account' 
    })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      supabaseUser: ctx.supabaseUser,
      user: ctx.user,
    },
  })
})
