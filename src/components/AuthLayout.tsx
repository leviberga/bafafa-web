import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

const rotate = (angle: string, delay: string) => ({ '--r': angle, '--d': delay }) as CSSProperties

interface AuthLayoutProps {
  title: string
  footer: { question: string; linkLabel: string; to: string }
  children: ReactNode
}

/** A tela de entrada é o único lugar com o cartaz: aqui a marca fala alto, o resto do app fica quieto. */
export function AuthLayout({ title, footer, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section
        aria-label="Bafafá"
        className="relative flex flex-col justify-between gap-10 overflow-hidden bg-ipe px-6 py-10 lg:px-14 lg:py-16"
      >
        <h1
          className="carimbo text-[clamp(4.5rem,16vw,12rem)] font-extrabold leading-[0.82] text-cobalto"
          style={{ ...rotate('-4deg', '0ms'), fontStretch: '75%' }}
        >
          Bafafá
        </h1>

        <p
          className="carimbo w-fit max-w-md bg-pitanga px-5 py-3 text-xl font-bold leading-snug text-white lg:text-2xl"
          style={rotate('2deg', '140ms')}
        >
          A conversa brasileira, em até 280 caracteres.
        </p>

        <p className="carimbo max-w-xs font-texto text-base leading-relaxed" style={rotate('0deg', '280ms')}>
          <strong>bafafá</strong> <em>s.m.</em> Rebuliço, confusão, barulho de muita gente falando ao mesmo tempo.
        </p>
      </section>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="mb-6 text-3xl font-extrabold">{title}</h2>
          {children}
          <p className="mt-8">
            {footer.question}{' '}
            <Link to={footer.to} className="font-bold text-cobalto underline underline-offset-4">
              {footer.linkLabel}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
