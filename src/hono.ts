import { parse } from 'cookie'
import type { MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { createSessionFromAdapter, type IronSession, type SessionOptions } from './session.ts'

declare module 'hono' {
  interface ContextVariableMap {
    session: IronSession
  }
}

export function session(options: SessionOptions): MiddlewareHandler {
  return createMiddleware(async (c, next) => {
    c.set(
      'session',
      await createSessionFromAdapter(
        {
          getCookie: (name) => parse(c.req.header('cookie') ?? '')[name],
          setCookie: (v) => c.res.headers.append('Set-Cookie', v),
        },
        options,
      ),
    )
    await next()
  })
}
