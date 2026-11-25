import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, BookOpen, Building2, Grid3X3,
  Clock, ClipboardList, Calendar, Zap, Table2,
  AlertTriangle, Download, FileText, Menu, LayoutGrid
} from 'lucide-react'
import InstitutionalHeader from '../../components/layout/InstitutionalHeader'
import Sidebar from '../../components/layout/Sidebar'
import ModuleLauncherGrid from '../../components/layout/ModuleLauncherGrid'
import CoordinatorDashboard from './CoordinatorDashboard'
import PlaceholderCard from '../../components/ui/PlaceholderCard'
import type { ModuleCard } from '../../components/layout/ModuleLauncherGrid'

const MODULES: ModuleCard[] = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
  { id: 'faculty', title: 'Faculty', icon: Users, path: 'faculty' },
  { id: 'subjects', title: 'Subjects', icon: BookOpen, path: 'subjects' },
  { id: 'rooms-labs', title: 'Rooms & Labs', icon: Building2, path: 'rooms-labs' },
  { id: 'divisions', title: 'Divisions & Batches', icon: Grid3X3, path: 'divisions' },
  { id: 'time-slots', title: 'Time Slots', icon: Clock, path: 'time-slots' },
  { id: 'teaching-assignments', title: 'Teaching Assignments', icon: ClipboardList, path: 'teaching-assignments' },
  { id: 'availability', title: 'Faculty Availability', icon: Calendar, path: 'availability' },
  { id: 'generate', title: 'Generate Timetable', icon: Zap, path: 'generate' },
  { id: 'workspace', title: 'Timetable Workspace', icon: Table2, path: 'workspace' },
  { id: 'conflicts', title: 'Conflicts', icon: AlertTriangle, path: 'conflicts' },
  { id: 'export', title: 'Export', icon: Download, path: 'export' },
  { id: 'audit', title: 'Audit Logs', icon: FileText, path: 'audit' },
]

const SIDEBAR_ITEMS = MODULES.map(m => ({ id: m.id, label: m.title, icon: m.icon, path: m.path }))

export default function CoordinatorPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const isLauncherIndex =
    location.pathname === '/coordinator' || location.pathname === '/coordinator/'

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
            basePath="/coordinator"
          />
        )}

        <main className="flex-1 min-w-0">
          {/* Mobile menu bar when inside a module */}
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
                <span className="text-sm font-medium text-slate-600">Coordinator Portal</span>
              </div>
              <Link
                to="/coordinator"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D6FE2] bg-[#EBF0FA] px-3 py-1.5 rounded-full"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                All Modules
              </Link>
            </div>
          )}

          <Routes>
            <Route index element={<ModuleLauncherGrid modules={MODULES} basePath="/coordinator" />} />
            <Route path="dashboard" element={<CoordinatorDashboard />} />
            <Route path="faculty" element={<PlaceholderCard title="Faculty Management" icon={Users} description="Manage faculty profiles, workload limits, and department assignments." />} />
            <Route path="subjects" element={<PlaceholderCard title="Subject Management" icon={BookOpen} description="Configure theory/practical subjects, hours per week, and semester mapping." />} />
            <Route path="rooms-labs" element={<PlaceholderCard title="Rooms & Labs" icon={Building2} description="Manage classroom and laboratory resources with capacity and equipment details." />} />
            <Route path="divisions" element={<PlaceholderCard title="Divisions & Batches" icon={Grid3X3} description="Configure SY BTech divisions A–G with E1/E2/E3 batch assignments." />} />
            <Route path="time-slots" element={<PlaceholderCard title="Time Slots" icon={Clock} description="Define lecture, lunch, and recess time slots for each day of the week." />} />
            <Route path="teaching-assignments" element={<PlaceholderCard title="Teaching Assignments" icon={ClipboardList} description="Assign faculty to subjects and divisions with weekly hour targets." />} />
            <Route path="availability" element={<PlaceholderCard title="Faculty Availability" icon={Calendar} description="View and manage faculty availability submissions for each week." />} />
            <Route path="generate" element={<PlaceholderCard title="Generate Timetable" icon={Zap} description="Run the CSP solver to auto-generate a constraint-satisfying timetable." />} />
            <Route path="workspace" element={<PlaceholderCard title="Timetable Workspace" icon={Table2} description="Drag-and-drop timetable editor with live conflict validation." />} />
            <Route path="conflicts" element={<PlaceholderCard title="Conflict Management" icon={AlertTriangle} description="View and resolve hard/soft constraint conflicts in the generated timetable." />} />
            <Route path="export" element={<PlaceholderCard title="Export" icon={Download} description="Export timetable to traditional college-format PDF or Excel files." />} />
            <Route path="audit" element={<PlaceholderCard title="Audit Logs" icon={FileText} description="Track all system actions, changes, and user activity logs." />} />
            <Route path="*" element={<Navigate to="/coordinator" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating support button */}
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
