import { createSessionFromAdapter } from './session.ts'
import type { SessionOptions, IronSession } from './session.ts'
import { getCookie, appendHeader } from 'h3'
import type { H3Event } from 'h3'

export function useSession(
  event: H3Event,
  options: SessionOptions,
): Promise<IronSession> {
  const password = options.password ?? process.env.NUXT_SESSION_PASSWORD
  if (!password) throw new Error('peta-auth/nuxt: NUXT_SESSION_PASSWORD is required')

  return createSessionFromAdapter({
    getCookie: (name) => getCookie(event, name),
    setCookie: (value) => appendHeader(event, 'Set-Cookie', value),
  }, {
    password,
    cookieName: options?.cookieName ?? 'nuxt-session',
    ttl: options?.ttl,
    cookieOptions: options?.cookieOptions,
  })
}
