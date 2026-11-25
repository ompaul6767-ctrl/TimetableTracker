import { LucideIcon, Clock } from 'lucide-react'

interface Props {
  title: string
  description?: string
  icon?: LucideIcon
}

export default function PlaceholderCard({ title, description, icon: Icon }: Props) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#EBF0FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
          {Icon ? (
            <Icon className="w-8 h-8 text-[#1D6FE2]" />
          ) : (
            <Clock className="w-8 h-8 text-[#1D6FE2]" />
          )}
        </div>
        <h2 className="text-lg font-semibold text-[#1A2B5F] mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-4">
          {description || 'This module is ready for implementation in the next phase.'}
        </p>
        <div className="inline-flex items-center gap-2 bg-[#EBF0FA] text-[#1D6FE2] text-xs font-medium px-4 py-2 rounded-full">
          <span className="w-1.5 h-1.5 bg-[#1D6FE2] rounded-full" />
          Ready for Implementation
        </div>
      </div>
    </div>
  )
}
