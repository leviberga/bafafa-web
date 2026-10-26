import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { Avatar } from './Avatar'
import { Wordmark } from './Wordmark'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-lg font-bold ${isActive ? 'bg-ipe text-tinta' : 'text-tinta/80 hover:bg-tinta/5'}`

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 font-semibold ${isActive ? 'bg-ipe' : 'hover:bg-tinta/5'}`

export function AppShell() {
  const { account, logout } = useAuth()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-tinta/15 px-4 py-6 md:flex">
        <div className="flex flex-col gap-8">
          <Wordmark className="px-3 text-4xl" />
          <nav aria-label="Principal">
            <ul className="flex flex-col gap-1">
              <li>
                <NavLink to="/" end className={navLinkClass}>
                  Início
                </NavLink>
              </li>
              {account ? (
                <li>
                  <NavLink to={`/perfil/${account.handle}`} className={navLinkClass}>
                    Perfil
                  </NavLink>
                </li>
              ) : null}
            </ul>
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
          <nav aria-label="Principal" className="flex items-center gap-1">
            <NavLink to="/" end className={mobileLinkClass}>
              Início
            </NavLink>
            {account ? (
              <NavLink to={`/perfil/${account.handle}`} className={mobileLinkClass}>
                Perfil
              </NavLink>
            ) : null}
            <button type="button" onClick={() => void logout()} className="rounded-md px-3 py-1.5 font-semibold hover:bg-tinta/5">
              Sair
            </button>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[40rem] md:border-r md:border-tinta/15 md:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
