import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { listUsers, setUserAccess } from '~/lib/auth.functions'

export const Route = createFileRoute('/_protected/admin')({
  beforeLoad: ({ context }) => {
    if (!context.session.access.isOwner) throw redirect({ to: '/protected' })
  },
  loader: () => listUsers(),
  component: AdminPage,
})

function AdminPage() {
  const users = Route.useLoaderData()
  const router = useRouter()
  const [busyUser, setBusyUser] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const changeAccess = async (
    userId: string,
    status: 'active' | 'revoked',
  ) => {
    setBusyUser(userId)
    setMessage('')
    try {
      await setUserAccess({ data: { userId, status } })
      await router.invalidate()
      setMessage(status === 'active' ? 'Access approved.' : 'Access revoked.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setBusyUser(null)
    }
  }

  return (
    <main className="p-4 max-w-3xl">
      <h1 className="text-2xl font-semibold">User access</h1>
      <p className="mt-1 text-sm opacity-75">
        New accounts remain pending until you approve them. Revoking a user also
        deletes their active sessions.
      </p>
      <div className="mt-5 space-y-3">
        {users.map((item) => (
          <section className="border rounded p-3" key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm opacity-75">{item.email}</p>
                <p className="text-sm mt-1">
                  {item.isOwner ? 'owner · active' : item.accessStatus}
                </p>
              </div>
              {!item.isOwner ? (
                <div className="flex gap-2">
                  <button
                    className="border rounded px-3 py-1"
                    disabled={busyUser === item.id || item.accessStatus === 'active'}
                    onClick={() => changeAccess(item.id, 'active')}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className="border rounded px-3 py-1"
                    disabled={busyUser === item.id || item.accessStatus === 'revoked'}
                    onClick={() => changeAccess(item.id, 'revoked')}
                    type="button"
                  >
                    Revoke
                  </button>
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>
      {message ? <p className="mt-4">{message}</p> : null}
    </main>
  )
}
