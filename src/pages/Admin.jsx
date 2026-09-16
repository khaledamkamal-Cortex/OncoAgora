import { useState } from 'react'
import { Admin, Members, Courses, resetDemo } from '../lib/store'
import { supabaseEnabled } from '../lib/supabase'
import { useStore } from '../lib/useStore'
import LmsAdmin from './LmsAdmin'

export default function AdminPage() {
  useStore()
  if (!Admin.isAuthed()) return <AdminLogin />
  return <AdminPanel />
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { await (supabaseEnabled ? Admin.login(email, pw) : Admin.login(pw)) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return (
    <>
      <div className="page-head"><div className="container"><h1>Admin Panel</h1><p>Restricted access.</p></div></div>
      <section className="section">
        <div className="container" style={{ maxWidth: 420 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form className="form card" onSubmit={submit}>
            {supabaseEnabled && <div><label>Admin email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus placeholder="you@example.com" /></div>}
            <div><label>{supabaseEnabled ? 'Password' : 'Admin password'}</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus={!supabaseEnabled} /></div>
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Log in'}</button>
            <p className="form-note">{supabaseEnabled ? 'Log in with your registered admin account.' : <>Demo password: <b>onco-admin</b></>}</p>
          </form>
        </div>
      </section>
    </>
  )
}

const TABS = ['Dashboard', 'LMS Content', 'Members']

function AdminPanel() {
  const [tab, setTab] = useState('LMS Content')
  return (
    <>
      <div className="page-head">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div><h1>Admin Panel</h1><p>Manage courses, lessons and members.</p></div>
          <button className="btn btn-outline" onClick={() => Admin.logout()}>Log out</button>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="admin-layout">
            <nav className="admin-nav">
              {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
            </nav>
            <div>
              {tab === 'Dashboard' && <Dashboard />}
              {tab === 'LMS Content' && <LmsAdmin />}
              {tab === 'Members' && <MembersAdmin />}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Dashboard() {
  const courses = Courses.all()
  const lessonCount = courses.reduce((n, c) => n + Courses.lessons(c).length, 0)
  const stats = [
    ['Courses', courses.length],
    ['Modules', courses.reduce((n, c) => n + c.modules.length, 0)],
    ['Lessons', lessonCount],
    ['Members', Members.all().length]
  ]
  return (
    <>
      <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Overview</h2>
      <div className="section-title-bar" />
      <div className="grid grid-4">
        {stats.map(([label, num]) => <div key={label} className="card stat-card"><div className="num">{num}</div><div className="lbl">{label}</div></div>)}
      </div>
      {!supabaseEnabled && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Danger zone</h3>
          <p className="form-note" style={{ marginBottom: 10 }}>Reset all demo data (courses, members, progress) back to the seeded defaults.</p>
          <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Reset all demo data?')) resetDemo() }}>Reset demo data</button>
        </div>
      )}
    </>
  )
}

function MembersAdmin() {
  const members = Members.all()
  return (
    <>
      <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Members ({members.length})</h2>
      <div className="section-title-bar" />
      {members.length === 0 ? <div className="empty">No members have registered yet.</div> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Email</th><th>Grade</th><th>Specialty</th><th>Joined</th><th></th></tr></thead>
            <tbody>{members.map((m) => (
              <tr key={m.id}><td>{m.name}</td><td>{m.email}</td><td>{m.grade}</td><td>{m.specialty}</td><td>{m.joined}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Remove ${m.name}?`)) Members.remove(m.email) }}>Remove</button></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  )
}
