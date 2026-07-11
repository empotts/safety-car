import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getApprovedSession } from '~/lib/auth.functions'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await getApprovedSession()

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return { session }
  },
  component: () => <Outlet />,
})
