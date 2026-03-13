import { useAppSelector } from '@src/store'
import { Navigate } from 'react-router-dom'

interface MainLayoutProps {
  children: React.ReactNode
}

const GuestGuard = ({ children }: MainLayoutProps) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  return isAuthenticated ? <Navigate to="/profile" /> : children
}

export default GuestGuard
