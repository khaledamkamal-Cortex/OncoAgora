import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { supabaseEnabled } from '../lib/supabase'
import { Members } from '../lib/store'
import { useStore } from '../lib/useStore'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses' }
]

export function Navbar() {
  useStore()
  const member = Members.current()
  const [open, setOpen] = useState(false)
  return (
    <>
      {!supabaseEnabled && (
        <div className="demo-banner">Demo mode — data is stored in your browser. Connect Supabase to go live. Admin password: <b>onco-admin</b></div>
      )}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <img src="/logo.svg" alt="OncoAgora logo" />
            <span>
              <span className="brand-name">OncoAgora</span><br />
              <span className="brand-sub">Oncology Learning</span>
            </span>
          </Link>
          <button className="btn btn-ghost btn-sm no-print" style={{ marginLeft: 'auto' }} onClick={() => setOpen(!open)} aria-label="Toggle menu">☰ Menu</button>
          <div className="nav-links" style={{ display: open ? 'flex' : undefined }}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}>{n.label}</NavLink>
            ))}
            {member
              ? <NavLink to="/membership" className="nav-cta">My Learning</NavLink>
              : <NavLink to="/membership" className="nav-cta">Join / Login</NavLink>}
          </div>
        </div>
      </nav>
    </>
  )
}

export function Footer() {
  return (
    <footer className="site">
      <div className="container cols">
        <div>
          <h4>OncoAgora</h4>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af' }}>The gathering place for oncology learning — structured courses, quizzes, progress tracking and certificates.</p>
        </div>
        <div>
          <h4>Learn</h4>
          <Link to="/courses">Course Catalog</Link>
          <Link to="/membership">My Learning</Link>
        </div>
        <div>
          <h4>Community</h4>
          <Link to="/membership">Membership</Link>
          <a href="https://www.facebook.com/CAIROJournalClub" target="_blank" rel="noreferrer">CAIRO Journal Club</a>
        </div>
        <div>
          <h4>Manage</h4>
          <Link to="/admin">Admin Panel</Link>
          <a href="mailto:info@oncoagora.com">Contact</a>
        </div>
      </div>
      <div className="bottom">© {new Date().getFullYear()} OncoAgora. All rights reserved.</div>
    </footer>
  )
}
