import type { ElementType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, Grid3X3, Building2, FlaskConical, GraduationCap } from 'lucide-react'
import { api } from '../../lib/api'

interface DashboardSummary {
  faculty: number
  subjects: number
  divisions: number
  batches: number
  classrooms: number
  laboratories: number
  departments: number
  currentTerms: number
}

interface DashboardResponse {
  summary: DashboardSummary
  currentTerm: { year: string; semester: string } | null
  institution: { name: string; department: string; code: string }
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: number
  icon: ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1A2B5F]">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

export default function CoordinatorDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary')
      return res.data.data as DashboardResponse
    },
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse border border-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium">Failed to load dashboard data</p>
          <p className="text-red-400 text-sm mt-1">Ensure the backend server is running and the database is seeded.</p>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Faculty Members', value: data?.summary.faculty || 0, icon: Users, color: 'bg-[#1D6FE2]' },
    { label: 'Subjects', value: data?.summary.subjects || 0, icon: BookOpen, color: 'bg-[#F59E0B]' },
    { label: 'Divisions', value: data?.summary.divisions || 0, icon: Grid3X3, color: 'bg-[#1A2B5F]' },
    { label: 'Batches', value: data?.summary.batches || 0, icon: GraduationCap, color: 'bg-[#F97316]' },
    { label: 'Classrooms', value: data?.summary.classrooms || 0, icon: Building2, color: 'bg-[#16A34A]' },
    { label: 'Laboratories', value: data?.summary.laboratories || 0, icon: FlaskConical, color: 'bg-[#7C3AED]' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1A2B5F]">Dashboard</h1>
        {data?.currentTerm && (
          <p className="text-sm text-slate-500 mt-0.5">
            {data.institution.name} — {data.institution.department} &nbsp;|&nbsp;
            Term: {data.currentTerm.year} {data.currentTerm.semester}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#1A2B5F] mb-3 text-sm">Institution Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">College</span>
              <span className="text-slate-700 font-medium text-right text-xs max-w-[200px]">Zeal College of Engineering, Pune</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department</span>
              <span className="text-slate-700 font-medium">{data?.institution.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Code</span>
              <span className="text-slate-700 font-medium">{data?.institution.code}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#1A2B5F] mb-3 text-sm">System Status</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Master Data', status: 'Seeded', color: 'text-[#16A34A]', bg: 'bg-[#E6F9ED]' },
              { label: 'Timetable Generation', status: 'Pending', color: 'text-[#F59E0B]', bg: 'bg-amber-50' },
              { label: 'Published Timetable', status: 'None', color: 'text-slate-400', bg: 'bg-slate-50' },
            ].map(({ label, status, color, bg }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-slate-500">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bg} ${color}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
