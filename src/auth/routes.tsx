import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './context'

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center font-semibold text-tinta/65" role="status">
      Carregando…
    </div>
  )
}

/** Telas que exigem login: quem não entrou vai para /entrar. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Loading />
  if (status === 'anonymous') return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Telas de entrada e cadastro: quem já entrou vai para o início. */
export function GuestOnly() {
  const { status } = useAuth()

  if (status === 'loading') return <Loading />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
