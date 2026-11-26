import { api } from '../../lib/api'
import { useState, type InputHTMLAttributes } from 'react'
import { useForm, type FieldErrors, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  Hash,
  Lock,
  Mail,
  Phone,
  Table2,
  UserPlus,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

const facultyRegistrationSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your full name.'),
  prn: z.string().trim().min(1, 'Enter your PRN.'),
  email: z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.'),
  password: z.string()
    .min(8, 'Use at least 8 characters.')
    .regex(/[A-Z]/, 'Include at least one uppercase letter.')
    .regex(/[a-z]/, 'Include at least one lowercase letter.')
    .regex(/\d/, 'Include at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Include at least one special character.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

type FacultyRegistrationValues = z.infer<typeof facultyRegistrationSchema>

const defaultValues: FacultyRegistrationValues = {
  fullName: '',
  prn: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
}

const features = [
  { icon: UserPlus, label: 'Create Your Account' },
  { icon: ClipboardCheck, label: 'Complete Your Profile' },
  { icon: CalendarCheck, label: 'Set Availability' },
  { icon: Table2, label: 'View Your Timetable' },
]

const metrics = [
  { value: '7', label: 'Divisions' },
  { value: '20', label: 'Faculty' },
  { value: '10', label: 'Subjects' },
]

interface RegistrationInputProps {
  id: string
  label: string
  icon: LucideIcon
  registration: UseFormRegisterReturn
  error?: string
  placeholder: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
}

function RegistrationInput({
  id,
  label,
  icon: Icon,
  registration,
  error,
  placeholder,
  type = 'text',
}: RegistrationInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}<span aria-hidden="true" className="ml-1 text-red-600">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          {...registration}
          type={type}
          placeholder={placeholder}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-[#EFF4FB] py-3 pl-10 pr-4 text-sm transition-all focus:border-[#1D6FE2] focus:outline-none focus:ring-2 focus:ring-[#1D6FE2]/30 ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200'
          }`}
        />
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}

interface RegistrationPasswordProps {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: string
  hint?: string
}

function RegistrationPassword({ id, label, registration, error, hint }: RegistrationPasswordProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}<span aria-hidden="true" className="ml-1 text-red-600">*</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          {...registration}
          type={visible ? 'text' : 'password'}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`w-full rounded-xl border bg-[#EFF4FB] py-3 pl-10 pr-12 text-sm transition-all focus:border-[#1D6FE2] focus:outline-none focus:ring-2 focus:ring-[#1D6FE2]/30 ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-sm text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2]"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
      {!error && hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default function FacultyRegistrationPage() {
const [isLoading, setIsLoading] = useState(false)
const [serverError, setServerError] = useState('')
const [resetVersion, setResetVersion] = useState(0)
const navigate = useNavigate()

  const {
    register,
    watch,
    handleSubmit,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FacultyRegistrationValues>({
    resolver: zodResolver(facultyRegistrationSchema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })

  const password = watch('password')

  const handleValidSubmit = async (values: FacultyRegistrationValues) => {
  setServerError('')
  setIsLoading(true)

  try {
    await api.post('/auth/register', {
      fullName: values.fullName,
      prn: values.prn,
      email: values.email,
      mobile: values.mobile,
      password: values.password,
    })

    reset(defaultValues)
    navigate('/login')
  } catch (error: any) {
    setServerError(
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Registration failed. Please try again.'
    )
  } finally {
    setIsLoading(false)
  }
}

  const handleInvalidSubmit = (formErrors: FieldErrors<FacultyRegistrationValues>) => {
    const firstError = Object.keys(formErrors)[0] as keyof FacultyRegistrationValues | undefined
    if (!firstError) return

    const field = document.getElementById(firstError)
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (field instanceof HTMLElement) {
      field.focus({ preventScroll: true })
      return
    }
    setFocus(firstError)
  }

  const clearForm = () => {
  setIsLoading(false)
  setServerError('')
  reset(defaultValues)
  setResetVersion((version) => version + 1)
}

  const passwordStrength = (() => {
    if (!password) return 'Use 8+ characters with uppercase, lowercase, a number, and a special character.'
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length
    if (checks === 5) return 'Strong password'
    if (checks >= 3) return 'Good start — add the remaining requirements.'
    return 'Keep going — add length and a mix of character types.'
  })()

  return (
    <div className="min-h-screen bg-[#EBF0FA] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        <aside className="hidden md:flex flex-col w-[45%] bg-gradient-to-b from-[#C7D4F5] via-[#D6E1F8] to-[#EBF0FA] p-8 relative">
          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D6FE2]">
              <span className="text-xl font-bold text-white">Z</span>
            </div>
            <h2 className="text-xl font-bold leading-tight text-[#1A2B5F]">Zeal Institutes</h2>
            <p className="mt-1 text-sm text-slate-500">Timetable Management System</p>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#1A2B5F]">
              Faculty Onboarding
            </p>
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm">
                  <Icon className="h-5 w-5 text-[#1D6FE2]" aria-hidden="true" />
                </div>
                <div className="h-px flex-1 border-t border-dashed border-[#1D6FE2]/30 bg-[#1D6FE2]/20" />
                <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-medium text-[#1A2B5F]">{label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
            {metrics.map(({ value, label }) => (
              <div key={label} className="rounded-xl bg-white/60 p-2 text-center">
                <p className="text-lg font-bold text-[#1D6FE2]">{value}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1D6FE2]">
              <span className="text-xl font-bold text-white">Z</span>
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight text-[#1A2B5F]">Zeal Institutes</h2>
              <p className="mt-1 text-sm text-slate-500">Timetable Management System</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
              ZEAL COLLEGE OF ENGINEERING &amp; RESEARCH
            </p>
            <h1 className="text-2xl font-bold leading-tight text-[#1A2B5F]">Faculty Registration</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create your account. You can complete your academic profile after registration.
            </p>
          </div>

          <Link
            to="/login"
            className="mb-5 inline-flex min-h-9 self-start items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-[#1D6FE2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Login
          </Link>

          <form onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)} noValidate className="space-y-4">
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {serverError}
            </div>
        )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RegistrationInput
                id="fullName"
                label="Full Name"
                icon={UserRound}
                registration={register('fullName')}
                error={errors.fullName?.message}
                placeholder="Your full name"
              />
              <RegistrationInput
                id="prn"
                label="PRN"
                icon={Hash}
                registration={register('prn')}
                error={errors.prn?.message}
                placeholder="Enter your PRN"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RegistrationInput
                id="email"
                label="Email Address"
                icon={Mail}
                type="email"
                registration={register('email')}
                error={errors.email?.message}
                placeholder="you@zeal.edu.in"
              />
              <RegistrationInput
                id="mobile"
                label="Mobile Number"
                icon={Phone}
                type="tel"
                registration={register('mobile')}
                error={errors.mobile?.message}
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RegistrationPassword
                key={`password-${resetVersion}`}
                id="password"
                label="Password"
                registration={register('password')}
                error={errors.password?.message}
                hint={passwordStrength}
              />
              <RegistrationPassword
                key={`confirm-password-${resetVersion}`}
                id="confirmPassword"
                label="Confirm Password"
                registration={register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#1D6FE2] py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#155BC0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                  Registering...
                </>
              ) : (
                'REGISTER'
              )}
            </button>
          </form>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <p className="text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="rounded-sm font-medium text-[#1D6FE2] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2] focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
            </p>
            <button
              type="button"
              onClick={clearForm}
              className="shrink-0 rounded-sm text-slate-500 transition-colors hover:text-[#1D6FE2] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2]"
            >
              Clear Form
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
