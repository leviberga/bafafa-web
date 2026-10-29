import { Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAuth } from './auth/routes'
import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { ThreadPage } from './pages/ThreadPage'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/perfil/:handle" element={<ProfilePage />} />
          <Route path="/post/:id" element={<ThreadPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
