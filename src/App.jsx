import { Routes, Route } from 'react-router-dom'
import { Navbar, Footer } from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Course from './pages/Course'
import Membership from './pages/Membership'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<Course />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
