import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import FacultyRegistrationPage from './pages/faculty/FacultyRegistrationPage'
import CoordinatorPortal from './pages/coordinator/CoordinatorPortal'
import FacultyPortal from './pages/faculty/FacultyPortal'

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user?.role || '')) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/faculty/register" element={<FacultyRegistrationPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'FACULTY' ? '/faculty' : '/coordinator'} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/coordinator/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
              <CoordinatorPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/*"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <FacultyPortal />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
