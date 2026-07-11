import { Link, createFileRoute } from '@tanstack/react-router'
import { signOut, useSession } from '~/lib/auth-client'

export const Route = createFileRoute('/_protected/protected')({
  component: ProtectedPage,
})

function ProtectedPage() {
  const { data: session, refetch } = useSession()

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold">Protected Page</h3>
      <p>You are signed in.</p>
      <p>Email: {session?.user.email}</p>
      {Route.useRouteContext().session.access.isOwner ? (
        <p className="mt-2">
          <Link className="underline" to="/admin">
            Manage user access
          </Link>
        </p>
      ) : null}
      <button
        type="button"
        className="mt-3 border rounded px-3 py-1"
        onClick={async () => {
          await signOut()
          await refetch()
        }}
      >
        Sign Out
      </button>
    </div>
  )
}
