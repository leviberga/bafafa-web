import { ApiError } from './api'

/** Transforma um erro da API numa mensagem que diz o que houve e o que fazer. */
export function describeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      const wait = error.retryAfter ? `Tente de novo em ${error.retryAfter} segundos.` : 'Tente de novo em instantes.'
      return `Muitas tentativas seguidas. ${wait}`
    }
    if (error.status === 401) return 'Sua sessão expirou. Entre de novo.'
    if (error.status === 400) return fallback
    if (error.status >= 500) return 'O servidor não respondeu como esperado. Tente de novo em instantes.'
    return error.message || fallback
  }
  if (error instanceof TypeError) {
    return 'Não foi possível falar com o servidor. Confira sua conexão e se a API está no ar.'
  }
  return fallback
}
