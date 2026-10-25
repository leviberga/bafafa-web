import { useId, type InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function Field({ label, hint, className = '', ...inputProps }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? hintId : undefined}
        className={`rounded-md border-2 border-tinta bg-white px-3 py-2.5 text-base ${className}`}
        {...inputProps}
      />
      {hint ? (
        <p id={hintId} className="text-sm text-tinta/65">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
