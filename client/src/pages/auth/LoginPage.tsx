import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Calendar, Users, AlertTriangle, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await api.post('/auth/login', { email, password })
      const { accessToken, user } = res.data.data
      setAuth(user, accessToken)
      navigate(user.role === 'FACULTY' ? '/faculty' : '/coordinator')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Calendar, label: 'Auto Timetable' },
    { icon: Users, label: 'Faculty Availability' },
    { icon: AlertTriangle, label: 'Conflict Detection' },
    { icon: FileText, label: 'PDF & Excel Export' },
  ]

  return (
    <div className="min-h-screen bg-[#EBF0FA] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* LEFT PANEL — Feature showcase */}
        <div className="hidden md:flex flex-col w-[45%] bg-gradient-to-b from-[#C7D4F5] via-[#D6E1F8] to-[#EBF0FA] p-8 relative">
          <div className="mb-8">
            <div className="w-14 h-14 bg-[#1D6FE2] rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <h2 className="text-[#1A2B5F] font-bold text-xl leading-tight">
              Zeal Institutes
            </h2>
            <p className="text-slate-500 text-sm mt-1">Timetable Management System</p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4">
            <p className="text-[#1A2B5F] font-semibold text-sm uppercase tracking-wide mb-2">
              Smart Academic Scheduling
            </p>
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#1D6FE2]" />
                </div>
                <div className="flex-1 h-px bg-[#1D6FE2]/20 border-dashed border-t border-[#1D6FE2]/30" />
                <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-medium text-[#1A2B5F]">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom metrics strip */}
          <div className="mt-8 grid grid-cols-3 gap-2">
            {[
              { value: '7', label: 'Divisions' },
              { value: '20', label: 'Faculty' },
              { value: '10', label: 'Subjects' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/60 rounded-xl p-2 text-center">
                <p className="text-[#1D6FE2] font-bold text-lg">{value}</p>
                <p className="text-slate-500 text-[10px]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Login form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B] mb-1">
              ZEAL COLLEGE OF ENGINEERING &amp; RESEARCH
            </p>
            <h1 className="text-2xl font-bold text-[#1A2B5F] leading-tight">
              Faculty &amp; Coordinator
            </h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your portal account</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@zeal.edu.in"
                  required
                  className="w-full bg-[#EFF4FB] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FE2]/30 focus:border-[#1D6FE2] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-[#EFF4FB] border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FE2]/30 focus:border-[#1D6FE2] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1D6FE2] hover:bg-[#155BC0] text-white font-semibold rounded-full py-3 mt-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <button type="button" className="hover:text-[#1D6FE2] transition-colors">Help / Support</button>
            <button type="button" className="hover:text-[#1D6FE2] transition-colors">Forgot Password?</button>
          </div>

          {/* Quick-fill hints */}
          <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Dev Quick-Login</p>
            <div className="space-y-1">
              {[
                { label: 'Admin', email: 'admin@zeal.edu.in', pass: 'Admin@1234' },
                { label: 'Coordinator', email: 'coordinator@zeal.edu.in', pass: 'Coord@1234' },
                { label: 'Faculty', email: 'kinjal.vele@zeal.edu.in', pass: 'Faculty@1234' },
              ].map(({ label, email: e, pass }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setEmail(e); setPassword(pass) }}
                  className="w-full text-left text-[11px] text-slate-500 hover:text-[#1D6FE2] hover:bg-white px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="font-medium">{label}:</span> {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
