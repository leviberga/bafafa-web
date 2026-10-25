import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { AuthLayout } from '../components/AuthLayout'
import { Field } from '../components/Field'
import { describeError } from '../lib/errors'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register({
        displayName: displayName.trim(),
        handle: handle.trim().replace(/^@/, '').toLowerCase(),
        email: email.trim(),
        password,
      })
      navigate('/', { replace: true })
    } catch (caught) {
      setError(describeError(caught, 'Não foi possível criar a conta. Confira os dados e tente de novo.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Criar conta" footer={{ question: 'Já tem conta?', linkLabel: 'Entrar', to: '/entrar' }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          label="Nome"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="name"
          required
          maxLength={50}
        />
        <Field
          label="@usuário"
          hint="De 3 a 30 caracteres: letras, números e _."
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          pattern="@?[A-Za-z0-9_]{3,30}"
          title="De 3 a 30 caracteres: letras, números e _"
          required
        />
        <Field
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          maxLength={254}
        />
        <Field
          label="Senha"
          type="password"
          hint="De 8 a 72 caracteres."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
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
          {submitting ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  )
}
