import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { asc, eq } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { auth } from '~/lib/auth'
import { db } from '~/db'
import { session as sessionTable, user } from '~/db/schema'

async function loadAccessSession() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) return null

  const record = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  })

  if (!record) return null

  const isOwner = record.email.toLowerCase() === env.ADMIN_OWNER_EMAIL.toLowerCase()

  return {
    ...session,
    access: {
      status: isOwner ? ('active' as const) : record.accessStatus,
      isOwner,
    },
  }
}

export const getSession = createServerFn({ method: 'GET' }).handler(
  loadAccessSession,
)

export const getApprovedSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await loadAccessSession()
    if (!session || session.access.status !== 'active') return null
    return session
  },
)

export const listUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const current = await loadAccessSession()
  if (!current?.access.isOwner) throw new Error('Forbidden')

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      accessStatus: user.accessStatus,
      approvedAt: user.approvedAt,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.createdAt))

  return users.map((item) => ({
    ...item,
    isOwner: item.email.toLowerCase() === env.ADMIN_OWNER_EMAIL.toLowerCase(),
  }))
})

export const setUserAccess = createServerFn({ method: 'POST' })
  .validator(
    (input: { userId: string; status: 'active' | 'revoked' }) => input,
  )
  .handler(async ({ data }) => {
    const current = await loadAccessSession()
    if (!current?.access.isOwner) throw new Error('Forbidden')

    const target = await db.query.user.findFirst({
      where: eq(user.id, data.userId),
    })
    if (!target) throw new Error('User not found')
    if (target.email.toLowerCase() === env.ADMIN_OWNER_EMAIL.toLowerCase()) {
      throw new Error('The owner cannot be revoked')
    }

    await db
      .update(user)
      .set({
        accessStatus: data.status,
        approvedAt: data.status === 'active' ? new Date() : null,
      })
      .where(eq(user.id, data.userId))

    if (data.status === 'revoked') {
      await db.delete(sessionTable).where(eq(sessionTable.userId, data.userId))
    }

    return { ok: true }
  })
