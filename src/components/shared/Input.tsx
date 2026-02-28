import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export default function Input({ label, error, helper, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 disabled:bg-gray-50 disabled:text-gray-400 ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
    </div>
  )
}
