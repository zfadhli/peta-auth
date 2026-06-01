import { parse } from 'cookie'
import { Elysia } from 'elysia'
import type { SessionOptions } from './session.ts'
import { createSessionFromAdapter } from './session.ts'

export function session(options: SessionOptions) {
  return new Elysia({ name: 'peta-auth' }).derive({ as: 'scoped' }, async ({ headers: reqHeaders, set }) => {
    const cookieStr =
      reqHeaders instanceof Headers
        ? (reqHeaders.get('cookie') ?? '')
        : ((reqHeaders as Record<string, string>).cookie ?? '')

    const session = await createSessionFromAdapter(
      {
        getCookie: (name) => parse(cookieStr)[name],
        setCookie: (v) => {
          set.headers['Set-Cookie'] = v
        },
      },
      options,
    )

    return { session }
  })
}
