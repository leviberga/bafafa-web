import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="mb-2 text-3xl font-extrabold">Página não encontrada</h1>
        <p className="mb-6 text-tinta/80">O endereço não existe ou foi removido.</p>
        <Link to="/" className="font-bold text-cobalto underline underline-offset-4">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
