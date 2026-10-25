import { createContext, useContext } from 'react'
import type { Account, RegisterInput } from '../lib/types'

export type Status = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  status: Status
  account: Account | null
  login: (identifier: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  }
  return context
}
