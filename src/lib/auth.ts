import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { passkey } from '@better-auth/passkey'
import { env } from 'cloudflare:workers'
import { db, schema } from '~/db'

const secret = env.BETTER_AUTH_SECRET
const baseURL = env.BETTER_AUTH_URL

export const auth = betterAuth({
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      accessStatus: {
        type: 'string',
        required: false,
        defaultValue: 'pending',
        input: false,
      },
      approvedAt: {
        type: 'date',
        required: false,
        input: false,
      },
    },
  },
  plugins: [passkey(), tanstackStartCookies()],
})
