import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { ChevronDown, Eye, EyeOff, X } from 'lucide-react'

type FieldError = string | undefined

interface FormSectionProps {
  title: string
  description: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-[#1A2B5F]">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function FieldLabel({
  htmlFor,
  id,
  children,
  required = false,
}: {
  htmlFor: string
  id?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label id={id} htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-slate-600">
      {children}
      {required && <span aria-hidden="true" className="ml-1 text-red-600">*</span>}
    </label>
  )
}

function FieldMessage({ id, error, hint }: { id: string; error: FieldError; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600" role="alert">
        {error}
      </p>
    )
  }
  if (hint) {
    return <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>
  }
  return null
}

interface TextFieldProps {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  hint?: string
  required?: boolean
  placeholder?: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  min?: number
  step?: number
}

export function TextField({
  id,
  label,
  registration,
  error,
  hint,
  required,
  placeholder,
  type = 'text',
  min,
  step,
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
      <input
        id={id}
        {...registration}
        type={type}
        min={min}
        step={step}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

interface SelectFieldProps {
  id: string
  label: string
  registration: UseFormRegisterReturn
  options: readonly string[]
  error?: FieldError
  hint?: string
  required?: boolean
  placeholder?: string
}

export function SelectField({
  id,
  label,
  registration,
  options,
  error,
  hint,
  required,
  placeholder = 'Select an option',
}: SelectFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
      <select
        id={id}
        {...registration}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

interface MultiSelectFieldProps {
  id: string
  label: string
  options: readonly string[]
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  error?: FieldError
  required?: boolean
  placeholder?: string
}

export function MultiSelectField({
  id,
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder = 'Choose one or more options',
}: MultiSelectFieldProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const toggleOption = (option: string, checked: boolean) => {
    onChange(checked ? [...value, option] : value.filter((item) => item !== option))
    onBlur?.()
    if (detailsRef.current) detailsRef.current.open = false
  }

  const removeOption = (option: string) => {
    onChange(value.filter((item) => item !== option))
    onBlur?.()
  }

  const describedBy = error ? `${id}-error` : undefined
  return (
    <div>
      <FieldLabel htmlFor={id} id={`${id}-label`} required={required}>{label}</FieldLabel>
      <details
        ref={detailsRef}
        className="group relative"
        onBlur={(event) => {
          const nextTarget = event.relatedTarget
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) onBlur?.()
        }}
      >
        <summary
          id={id}
          aria-labelledby={`${id}-label`}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`input-field flex cursor-pointer list-none items-center justify-between gap-3 text-left marker:hidden ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''
          }`}
        >
          <span className={value.length ? 'text-[#1A2B5F]' : 'text-slate-400'}>
            {value.length ? `${value.length} selected` : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div
          role="group"
          aria-label={label}
          className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          {options.map((option) => {
            const checked = value.includes(option)
            return (
              <label key={option} className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-[#EFF4FB]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => toggleOption(option, event.currentTarget.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1D6FE2] focus:ring-[#1D6FE2]"
                />
                {option}
              </label>
            )
          })}
        </div>
      </details>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label={`Selected ${label.toLowerCase()}`}>
          {value.map((option) => (
            <li key={option}>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-[#EFF4FB] py-1 pl-2.5 pr-1 text-xs font-medium text-[#1A2B5F]">
                {option}
                <button
                  type="button"
                  onClick={() => removeOption(option)}
                  aria-label={`Remove ${option}`}
                  className="rounded-full p-1 text-slate-500 hover:bg-white hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2]"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <FieldMessage id={id} error={error} />
    </div>
  )
}

interface SegmentedControlProps {
  id: string
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: FieldError
  required?: boolean
}

export function SegmentedControl({
  id,
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
  required,
}: SegmentedControlProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-red-600">*</span>}
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option, index) => {
          const optionId = index === 0 ? id : `${id}-${option.toLowerCase()}`
          return (
            <label key={option} htmlFor={optionId} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition-colors hover:bg-slate-50 has-[:checked]:border-[#1D6FE2] has-[:checked]:bg-[#EFF4FB]">
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                onBlur={onBlur}
                aria-required={required || undefined}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-4 w-4 shrink-0 border-slate-300 text-[#1D6FE2] focus:ring-[#1D6FE2]"
              />
              <span className="text-center text-xs font-medium text-slate-600">
                {option}
              </span>
            </label>
          )
        })}
      </div>
      <FieldMessage id={id} error={error} />
    </fieldset>
  )
}

interface PasswordFieldProps {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  hint?: string
}

export function PasswordField({ id, label, registration, error, required, hint }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          {...registration}
          type={visible ? 'text' : 'password'}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`input-field pr-12 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2]"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

interface FileUploadFieldProps {
  id: string
  label: string
  file: File | null
  onChange: (file: File | null) => void
  onBlur?: () => void
  accept: string
  error?: FieldError
  hint?: string
  required?: boolean
  preview?: ReactNode
}

function formatFileSize(size: number) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(2)} MB`
}

export function FileUploadField({
  id,
  label,
  file,
  onChange,
  onBlur,
  accept,
  error,
  hint,
  required,
  preview,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  useEffect(() => {
    if (!file && inputRef.current) inputRef.current.value = ''
  }, [file])

  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onChange={(event) => onChange(event.currentTarget.files?.[0] ?? null)}
        className={`input-field cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#EBF0FA] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#1D6FE2] hover:file:bg-blue-100 ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''
        }`}
      />
      <FieldMessage id={id} error={error} hint={hint} />
      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {preview}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#1A2B5F]">{file.name}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
