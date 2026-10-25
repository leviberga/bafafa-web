import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { AuthLayout } from '../components/AuthLayout'
import { Field } from '../components/Field'
import { ApiError } from '../lib/api'
import { describeError } from '../lib/errors'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(identifier.trim().replace(/^@/, ''), password)
      const destination = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(destination, { replace: true })
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 401
          ? 'E-mail, @usuário ou senha incorretos. Confira os dados e tente de novo.'
          : describeError(caught, 'Não foi possível entrar. Tente de novo.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Entrar" footer={{ question: 'Ainda não tem conta?', linkLabel: 'Criar conta', to: '/cadastro' }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          label="E-mail ou @usuário"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          required
          maxLength={254}
        />
        <Field
          label="Senha"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          maxLength={72}
        />
        {error ? (
          <p role="alert" className="font-semibold text-pitanga">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-cobalto px-5 py-3 text-lg font-bold text-white hover:bg-cobalto/90 disabled:opacity-50"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  )
}
