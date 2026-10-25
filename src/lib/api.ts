const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  retryAfter?: number

  constructor(status: number, message: string, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryAfter = retryAfter
  }
}

// O access token vive só em memória: não fica em localStorage, então um XSS não o leva embora.
// O refresh token está num cookie HttpOnly que o JavaScript nem enxerga.
let accessToken: string | null = null
let refreshInFlight: Promise<string | null> | null = null
let onSessionLost: () => void = () => {}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setSessionLostHandler(handler: () => void) {
  onSessionLost = handler
}

/**
 * Troca o cookie de refresh por um novo access token.
 *
 * Todas as chamadas simultâneas compartilham a MESMA requisição. Isso é obrigatório: o backend
 * rotaciona o refresh a cada uso e trata a reapresentação de um token já usado como roubo,
 * derrubando a sessão inteira. Duas renovações em paralelo (por exemplo, o StrictMode do React
 * em desenvolvimento, ou duas requisições recebendo 401 ao mesmo tempo) causariam exatamente isso.
 */
export function refreshSession(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
        if (!response.ok) {
          accessToken = null
          return null
        }
        const data = (await response.json()) as { accessToken: string }
        accessToken = data.accessToken
        return accessToken
      } catch {
        return null
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** Envia o access token e tenta renovar a sessão num 401. Use false em login, cadastro e logout. */
  auth?: boolean
  signal?: AbortSignal
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = response.statusText
  try {
    const body = (await response.json()) as { detail?: string; title?: string }
    message = body.detail ?? body.title ?? message
  } catch {
    // corpo vazio ou que não é JSON: usamos o statusText
  }
  const retryAfter = response.headers.get('Retry-After')
  return new ApiError(response.status, message, retryAfter ? Number(retryAfter) : undefined)
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options

  const send = () =>
    fetch(`${API_URL}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

  let response = await send()

  if (response.status === 401 && auth) {
    const renewed = await refreshSession()
    if (renewed) {
      response = await send()
    } else {
      onSessionLost()
    }
  }

  if (!response.ok) {
    throw await toApiError(response)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}
