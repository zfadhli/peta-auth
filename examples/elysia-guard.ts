import { Elysia } from 'elysia'
import { session, requireSession } from 'peta-auth/elysia'

new Elysia()
  .use(session({
    password: process.env.SESSION_SECRET ?? 'demo-secret-key-at-least-32-chars!!',
    cookieName: 'ely-session',
  }))
  .post('/login', async ({ session: s, body }: any) => {
    s.user = { name: body.name }
    await s.save()
    return Response.json({ ok: true })
  })
  .get('/public', () => Response.json({ message: 'this is public' }))
  .use(requireSession())
  .get('/protected/profile', ({ session: s }) => Response.json(s.user))
  .listen(3000)
