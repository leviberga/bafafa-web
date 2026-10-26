import { useState, type FormEvent } from 'react'
import { Field } from '../../components/Field'
import { describeError } from '../../lib/errors'
import type { Profile } from '../../lib/types'
import { useUpdateProfile } from './queries'

const BIO_MAX = 160

interface EditProfileFormProps {
  profile: Profile
  onDone: () => void
}

export function EditProfileForm({ profile, onDone }: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [bio, setBio] = useState(profile.bio)
  const update = useUpdateProfile(profile.handle)

  const canSave = displayName.trim().length > 0 && bio.length <= BIO_MAX && !update.isPending

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSave) return
    update.mutate({ displayName: displayName.trim(), bio: bio.trim() }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <Field
        label="Nome"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        required
        maxLength={50}
        autoComplete="name"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="font-semibold">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={3}
          className="resize-none rounded-md border-2 border-tinta bg-white px-3 py-2.5 font-texto text-base leading-relaxed"
        />
        <p className={`text-sm tabular-nums ${bio.length > BIO_MAX ? 'font-bold text-pitanga' : 'text-tinta/65'}`}>
          {BIO_MAX - bio.length} caracteres restantes
        </p>
      </div>

      {update.isError ? (
        <p role="alert" className="font-semibold text-pitanga">
          {describeError(update.error, 'Não foi possível salvar. Confira os campos e tente de novo.')}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-md bg-cobalto px-5 py-2 font-bold text-white hover:bg-cobalto/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {update.isPending ? 'Salvando…' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border-2 border-tinta px-5 py-2 font-bold hover:bg-tinta/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
