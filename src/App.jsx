import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Navbar, Footer } from './components/Layout'
import { useStore } from './lib/useStore'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Course from './pages/Course'
import Membership from './pages/Membership'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

// When the member arrives from a password-recovery email link, send them
// straight to the reset-password page regardless of where the link landed.
function RecoveryRedirect() {
  const { passwordRecovery } = useStore()
  const loc = useLocation()
  const nav = useNavigate()
  useEffect(() => {
    if (passwordRecovery && loc.pathname !== '/reset-password') nav('/reset-password', { replace: true })
  }, [passwordRecovery, loc.pathname, nav])
  return null
}

export default function App() {
  return (
    <>
      <Navbar />
      <RecoveryRedirect />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<Course />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
