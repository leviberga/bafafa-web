import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { Avatar } from './Avatar'
import { Wordmark } from './Wordmark'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-lg font-bold ${isActive ? 'bg-ipe text-tinta' : 'text-tinta/80 hover:bg-tinta/5'}`

export function AppShell() {
  const { account, logout } = useAuth()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-tinta/15 px-4 py-6 md:flex">
        <div className="flex flex-col gap-8">
          <Wordmark className="px-3 text-4xl" />
          <nav aria-label="Principal">
            <NavLink to="/" end className={navLinkClass}>
              Início
            </NavLink>
          </nav>
        </div>

        {account ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-3">
              <Avatar name={account.handle} seed={account.handle} size="sm" />
              <span className="min-w-0 truncate font-semibold">@{account.handle}</span>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md px-3 py-2 text-left font-semibold text-tinta/80 hover:bg-tinta/5"
            >
              Sair
            </button>
          </div>
        ) : null}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-tinta/15 bg-papel/95 px-4 py-3 backdrop-blur md:hidden">
          <Wordmark className="text-3xl" />
          <button type="button" onClick={() => void logout()} className="rounded-md px-3 py-1.5 font-semibold hover:bg-tinta/5">
            Sair
          </button>
        </header>
        <main className="mx-auto w-full max-w-[40rem] md:border-r md:border-tinta/15 md:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
