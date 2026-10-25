import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Api = typeof import('./api')

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })
}

describe('cliente da API', () => {
  let api: Api
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(async () => {
    // O cliente guarda estado no módulo (token e renovação em andamento): cada teste começa do zero.
    vi.resetModules()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    api = await import('./api')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('chamadas simultâneas de renovação compartilham uma única requisição', async () => {
    fetchMock.mockImplementation(async () => json({ accessToken: 'novo-token' }))

    const [a, b, c] = await Promise.all([api.refreshSession(), api.refreshSession(), api.refreshSession()])

    expect([a, b, c]).toEqual(['novo-token', 'novo-token', 'novo-token'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('renova a sessão num 401 e repete a requisição com o token novo', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ title: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(json({ accessToken: 'token-renovado' }))
      .mockResolvedValueOnce(json({ ok: true }))

    const result = await api.request<{ ok: boolean }>('/auth/me')

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    const retry = fetchMock.mock.calls[2][1] as RequestInit
    expect((retry.headers as Record<string, string>).Authorization).toBe('Bearer token-renovado')
  })

  it('se a renovação falhar, avisa que a sessão acabou e lança o erro', async () => {
    const onSessionLost = vi.fn()
    api.setSessionLostHandler(onSessionLost)
    fetchMock
      .mockResolvedValueOnce(json({ title: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(json({ title: 'Unauthorized' }, 401))

    await expect(api.request('/timeline/home')).rejects.toMatchObject({ status: 401 })
    expect(onSessionLost).toHaveBeenCalledTimes(1)
  })

  it('requisições sem autenticação (login) não tentam renovar a sessão num 401', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: 'Credenciais inválidas.' }, 401))

    await expect(api.request('/auth/login', { method: 'POST', body: {}, auth: false })).rejects.toMatchObject({
      status: 401,
      message: 'Credenciais inválidas.',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('expõe o Retry-After dos erros 429', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: 'Muitas requisições.' }, 429, { 'Retry-After': '12' }))

    await expect(api.request('/posts', { method: 'POST', body: { text: 'oi' } })).rejects.toMatchObject({
      status: 429,
      retryAfter: 12,
    })
  })

  it('devolve undefined em respostas 204', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(api.request<void>('/posts/abc/like', { method: 'PUT' })).resolves.toBeUndefined()
  })
})
