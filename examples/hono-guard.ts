import { Hono } from 'hono'
import { session, requireSession } from 'peta-auth/hono'

const app = new Hono()

app.use('*', session({
  password: process.env.SESSION_SECRET ?? 'demo-secret-key-at-least-32-chars!!',
  cookieName: 'my-session',
}))

app.post('/login', async (c) => {
  const { name } = await c.req.json()
  Object.assign(c.var.session, { user: { name }, loggedInAt: Date.now() })
  await c.var.session.save()
  return c.json({ ok: true })
})

app.get('/public', (c) => c.json({ message: 'this is public' }))

app.use('/protected/*', requireSession())

app.get('/protected/profile', (c) => {
  return c.json(c.var.session.user)
})

export default app
