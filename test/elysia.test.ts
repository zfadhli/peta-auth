import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { session } from '../src/elysia.ts'

const password = { 1: 'a'.repeat(32) }
const cookieName = 'ely-session'

function createApp() {
  return new Elysia()
    .use(session({ password, cookieName }))
    .post('/login', async ({ session: s, body }: any) => {
      s.user = { name: body.name }
      await s.save()
      return Response.json({ ok: true })
    })
    .get('/profile', ({ session: s }) => {
      if (!s.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
      return Response.json(s.user)
    })
    .post('/logout', ({ session: s }) => {
      s.destroy()
      return Response.json({ ok: true })
    })
    .get('/views', async ({ session: s }) => {
      s.views = (s.views ?? 0) + 1
      await s.save()
      return Response.json({ views: s.views })
    })
}

describe('Elysia adapter', () => {
  const app = createApp()

  it('returns 401 without login', async () => {
    const res = await app.handle(new Request('http://localhost/profile'))
    expect(res.status).toBe(401)
  })

  it('logs in and persists session', async () => {
    const login = await app.handle(new Request('http://localhost/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Jason' }),
    }))
    expect((await login.json()).ok).toBe(true)

    const cookie = login.headers.getSetCookie()[0]
    const profile = await app.handle(new Request('http://localhost/profile', { headers: { cookie } }))
    expect((await profile.json()).name).toBe('Jason')
  })

  it('increments views counter', async () => {
    const login = await app.handle(new Request('http://localhost/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'V' }),
    }))
    let cookie = login.headers.getSetCookie()[0]

    const r1 = await app.handle(new Request('http://localhost/views', { headers: { cookie } }))
    expect((await r1.json()).views).toBe(1)
    cookie = r1.headers.getSetCookie()[0]

    const r2 = await app.handle(new Request('http://localhost/views', { headers: { cookie } }))
    expect((await r2.json()).views).toBe(2)
  })

  it('clears session on logout', async () => {
    const login = await app.handle(new Request('http://localhost/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'J' }),
    }))
    const cookie = login.headers.getSetCookie()[0]

    const logout = await app.handle(new Request('http://localhost/logout', { method: 'POST', headers: { cookie } }))
    const clearedCookie = logout.headers.getSetCookie()[0]

    const profile = await app.handle(new Request('http://localhost/profile', { headers: { cookie: clearedCookie } }))
    expect(profile.status).toBe(401)
  })
})
