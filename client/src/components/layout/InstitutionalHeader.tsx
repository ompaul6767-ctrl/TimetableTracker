import { Bell, HelpCircle, ChevronDown, LogOut, LayoutGrid } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

function getInitials(user: { email: string; faculty?: { firstName: string; lastName: string } }) {
  if (user.faculty) {
    return `${user.faculty.firstName[0]}${user.faculty.lastName[0]}`.toUpperCase()
  }
  return user.email.slice(0, 2).toUpperCase()
}

function getDisplayName(user: { email: string; faculty?: { firstName: string; lastName: string } }) {
  if (user.faculty) return `${user.faculty.firstName} ${user.faculty.lastName}`
  return user.email.split('@')[0].toUpperCase()
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: 'System Administrator',
    COORDINATOR: 'Timetable Coordinator',
    FACULTY: 'Faculty Member',
  }
  return labels[role] || role
}

export default function InstitutionalHeader() {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  if (!user) return null

  const homePath = user.role === 'FACULTY' ? '/faculty' : '/coordinator'
  const initials = getInitials(user)
  const displayName = getDisplayName(user)
  const dept =
    user.faculty?.department?.name ||
    user.coordinatorDepartments?.[0]?.department?.name ||
    'Department of Computer Engineering'

  return (
    <div className="sticky top-0 z-50 shadow-sm">
      {/* TOP BAR */}
      <div className="bg-[#EEF2FA] border-b border-slate-200 px-4 py-2.5">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Left: Logo + College Name (clickable Home) */}
          <button
            type="button"
            onClick={() => navigate(homePath)}
            className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
            title="Go to All Modules"
          >
            <div className="w-10 h-10 bg-[#1D6FE2] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">ZC</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1A2B5F] uppercase tracking-wide leading-tight">
                ZEAL COLLEGE OF ENGINEERING &amp; RESEARCH, PUNE
              </p>
              <p className="text-[10px] text-slate-500">Timetable Management System</p>
            </div>
          </button>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home / All Modules */}
            <button
              type="button"
              onClick={() => navigate(homePath)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1A2B5F] hover:bg-slate-50 hover:border-[#1D6FE2]/40 transition-colors"
              title="All Modules"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#1D6FE2]" />
              <span className="hidden sm:inline">All Modules</span>
            </button>

            {/* Department selector */}
            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              <span>CSE</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {/* Term selector */}
            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              <span>2026-27 Sem-I</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {/* Bell */}
            <button
              type="button"
              className="relative p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            {/* Help */}
            <button
              type="button"
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
              title="Help"
            >
              <HelpCircle className="w-5 h-5 text-slate-500" />
            </button>
            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-slate-500 hover:text-red-500" />
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 bg-[#1A2B5F] rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-white font-semibold text-xs">{initials}</span>
            </div>
          </div>
        </div>
      </div>

      {/* USER INFO STRIP */}
      <div className="bg-white border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-3 max-w-screen-2xl mx-auto">
          <div className="w-8 h-8 bg-[#1A2B5F] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">{initials}</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="font-semibold text-sm text-[#1A2B5F]">{displayName}</span>
            <span className="inline-flex items-center gap-1.5 bg-[#E6F9ED] text-[#16A34A] text-xs font-medium px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
              Active
            </span>
            {user.faculty?.employeeCode && (
              <span className="text-xs font-medium text-[#1D6FE2] bg-[#EBF0FA] px-2 py-0.5 rounded-md hidden sm:inline">
                {user.faculty.employeeCode}
              </span>
            )}
            <span className="text-xs text-slate-500 hidden sm:block">
              {getRoleLabel(user.role)}
            </span>
            <span className="text-xs text-slate-400 hidden md:block">{dept}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
