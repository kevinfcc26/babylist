import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../shared/Input'
import Button from '../shared/Button'

export default function EnterCodeForm() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) { setError('Ingresa un código'); return }
    if (trimmed.length === 6) {
      navigate(`/list/${trimmed}`)
    } else if (trimmed.length === 12) {
      navigate(`/manage/${trimmed}`)
    } else {
      setError('El código debe tener 6 caracteres (familia) o 12 caracteres (admin)')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Código de acceso"
        placeholder="abc123 o abc123def456"
        value={code}
        onChange={e => { setCode(e.target.value); setError('') }}
        error={error}
        helper="6 caracteres para ver la lista · 12 caracteres para administrar"
        maxLength={12}
      />
      <Button type="submit" variant="secondary" className="w-full mt-2">
        Ir a la lista
      </Button>
    </form>
  )
}
