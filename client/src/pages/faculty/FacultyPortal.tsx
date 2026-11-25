import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { Table2, Calendar, Star, BarChart3, Menu, LayoutGrid, UserRound } from 'lucide-react'
import InstitutionalHeader from '../../components/layout/InstitutionalHeader'
import Sidebar from '../../components/layout/Sidebar'
import ModuleLauncherGrid from '../../components/layout/ModuleLauncherGrid'
import PlaceholderCard from '../../components/ui/PlaceholderCard'
import type { ModuleCard } from '../../components/layout/ModuleLauncherGrid'
import FacultyProfilePage from './FacultyProfilePage'

const MODULES: ModuleCard[] = [
  { id: 'my-timetable', title: 'My Timetable', icon: Table2, path: 'my-timetable' },
  { id: 'my-availability', title: 'My Availability', icon: Calendar, path: 'my-availability' },
  { id: 'preferred-slots', title: 'Preferred Slots', icon: Star, path: 'preferred-slots' },
  { id: 'my-workload', title: 'My Workload', icon: BarChart3, path: 'my-workload' },
]

const SIDEBAR_ITEMS = [
  ...MODULES.map(m => ({ id: m.id, label: m.title, icon: m.icon, path: m.path })),
  { id: 'profile', label: 'Profile', icon: UserRound, path: 'profile' },
]

export default function FacultyPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const isLauncherIndex =
    location.pathname === '/faculty' || location.pathname === '/faculty/'

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <InstitutionalHeader />

      <div className="flex">
        {!isLauncherIndex && (
          <Sidebar
            items={SIDEBAR_ITEMS}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
            basePath="/faculty"
          />
        )}

        <main className="flex-1 min-w-0">
          {!isLauncherIndex && (
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-sm font-medium text-slate-600">Faculty Portal</span>
              </div>
              <Link
                to="/faculty"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D6FE2] bg-[#EBF0FA] px-3 py-1.5 rounded-full"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                All Modules
              </Link>
            </div>
          )}

          <Routes>
            <Route index element={<ModuleLauncherGrid modules={MODULES} basePath="/faculty" />} />
            <Route path="profile" element={<FacultyProfilePage />} />
            <Route path="my-timetable" element={<PlaceholderCard title="My Timetable" icon={Table2} description="View your published weekly timetable with class schedule and room details." />} />
            <Route path="my-availability" element={<PlaceholderCard title="My Availability" icon={Calendar} description="Submit your availability (Available/Unavailable) for each time slot by week." />} />
            <Route path="preferred-slots" element={<PlaceholderCard title="Preferred Slots" icon={Star} description="Set your slot preferences (Preferred/Neutral/Avoid) for timetable optimization." />} />
            <Route path="my-workload" element={<PlaceholderCard title="My Workload" icon={BarChart3} description="Track your daily and weekly teaching hours against your assigned limits." />} />
            <Route path="*" element={<Navigate to="/faculty" replace />} />
          </Routes>
        </main>
      </div>

      <button
        type="button"
        className="fixed bottom-6 left-6 bg-[#1D6FE2] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg hover:bg-[#155BC0] transition-colors flex items-center gap-2 z-50"
      >
        <span className="w-2 h-2 bg-white rounded-full" />
        Support
      </button>
    </div>
  )
}
