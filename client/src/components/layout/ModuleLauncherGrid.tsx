import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LucideIcon } from 'lucide-react'

export interface ModuleCard {
  id: string
  title: string
  icon: LucideIcon
  path: string
  color?: string
}

interface Props {
  modules: ModuleCard[]
  basePath: string
}

export default function ModuleLauncherGrid({ modules, basePath }: Props) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = modules.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Search */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Module"
            className="w-full bg-white border-b-2 border-slate-200 focus:border-[#1D6FE2] pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((module) => {
          const Icon = module.icon
          return (
            <button
              key={module.id}
              onClick={() => navigate(`${basePath}/${module.id}`)}
              className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 hover:scale-[1.03] group text-left"
              style={{ background: 'linear-gradient(180deg, #C7D4F5 0%, #E4EBFC 55%, #FFFFFF 100%)' }}
            >
              <div className="px-3 pt-4 pb-3">
                <p className="font-semibold text-[#1A2B5F] text-xs leading-tight min-h-[2.5rem]">
                  {module.title}
                </p>
              </div>
              <div className="flex justify-center pb-4">
                <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-[#1D6FE2]" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No modules found for "{search}"</p>
        </div>
      )}
    </div>
  )
}
