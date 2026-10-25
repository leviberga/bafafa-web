import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { refreshSession, setSessionLostHandler } from '../lib/api'
import { authApi } from '../lib/endpoints'
import type { Account, RegisterInput } from '../lib/types'
import { AuthContext, type Status } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [account, setAccount] = useState<Account | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  // Se a API não conseguir renovar a sessão no meio de uma requisição, voltamos para a tela de entrada.
  useEffect(() => {
    setSessionLostHandler(() => {
      setAccount(null)
      setStatus('anonymous')
      queryClient.clear()
    })
  }, [queryClient])

  // Ao abrir o app, tentamos restaurar a sessão pelo cookie de refresh.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      const token = await refreshSession()
      if (!token) {
        if (!cancelled) setStatus('anonymous')
        return
      }
      try {
        const me = await authApi.me()
        if (!cancelled) {
          setAccount(me)
          setStatus('authenticated')
        }
      } catch {
        if (!cancelled) setStatus('anonymous')
      }
    }
    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    await authApi.login(identifier, password)
    const me = await authApi.me()
    setAccount(me)
    setStatus('authenticated')
  }, [])

  const register = useCallback(
    async (input: RegisterInput) => {
      await authApi.register(input)
      await login(input.handle, input.password)
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // mesmo que a API falhe, encerramos a sessão deste lado
    }
    setAccount(null)
    setStatus('anonymous')
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(
    () => ({ status, account, login, register, logout }),
    [status, account, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
