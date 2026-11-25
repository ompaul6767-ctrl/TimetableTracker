import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatRole(role: string): string {
  const roles: Record<string, string> = {
    ADMIN: 'System Administrator',
    COORDINATOR: 'Timetable Coordinator',
    FACULTY: 'Faculty Member',
  }
  return roles[role] || role
}
