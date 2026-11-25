import { NavLink, Link } from 'react-router-dom'
import { X, LayoutGrid, PanelLeftClose, PanelLeftOpen, LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
}

interface Props {
  items: SidebarItem[]
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  basePath: string
}

export default function Sidebar({
  items,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  basePath,
}: Props) {
  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-slate-100 z-40 transition-all duration-300 shadow-lg flex flex-col',
          'md:sticky md:top-[104px] md:h-[calc(100vh-104px)] md:translate-x-0 md:shadow-none',
          isCollapsed ? 'md:w-16 w-60' : 'w-60',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 md:hidden">
          <span className="font-semibold text-sm text-[#1A2B5F]">Navigation</span>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop top bar: All Modules + collapse toggle */}
        <div
          className={cn(
            'hidden md:flex items-center border-b border-slate-100 p-2.5',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <Link
              to={basePath}
              className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-semibold text-[#1A2B5F] hover:bg-[#EBF0FA] hover:text-[#1D6FE2] transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-[#1D6FE2]" />
              <span>All Modules</span>
            </Link>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#1A2B5F] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-2.5 space-y-1 overflow-y-auto flex-1 pb-20">
          {/* Mobile All Modules link */}
          <Link
            to={basePath}
            onClick={onClose}
            className="md:hidden flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1A2B5F] hover:bg-[#EBF0FA] hover:text-[#1D6FE2] transition-colors border-b border-slate-100 mb-1"
          >
            <LayoutGrid className="w-4 h-4 flex-shrink-0 text-[#1D6FE2]" />
            <span>All Modules</span>
          </Link>

          {/* Collapsed desktop All Modules icon */}
          {isCollapsed && (
            <Link
              to={basePath}
              title="All Modules"
              className="hidden md:flex items-center justify-center px-2 py-2.5 rounded-xl text-[#1D6FE2] hover:bg-[#EBF0FA] transition-colors mb-1"
            >
              <LayoutGrid className="w-4 h-4 flex-shrink-0" />
            </Link>
          )}

          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={`${basePath}/${item.id}`}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isCollapsed && 'md:justify-center md:px-2',
                    isActive
                      ? 'bg-[#EBF0FA] text-[#1D6FE2]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1A2B5F]'
                  )
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className={cn('truncate', isCollapsed && 'md:hidden')}>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
