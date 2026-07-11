import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-2">
      <h3>Safety Car</h3>
      <p>A private app starter with owner-approved access and passkeys.</p>
    </div>
  )
}
