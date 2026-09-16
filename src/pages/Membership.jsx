import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Members, Courses, Progress } from '../lib/store'
import { supabaseEnabled } from '../lib/supabase'
import { useStore } from '../lib/useStore'

export default function Membership() {
  useStore()
  const member = Members.current()
  return member ? <Dashboard member={member} /> : <AuthForms />
}

function AuthForms() {
  const [mode, setMode] = useState('register')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', specialty: 'Medical Oncology', institution: '', grade: 'Resident' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    setBusy(true)
    try {
      if (mode === 'register') {
        const res = await Members.register(form)
        if (res && res.pending) setInfo('Account created! Please check your email to confirm your address, then log in.')
      } else {
        await Members.login(form.email, form.password)
      }
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>Membership</h1>
          <p>Join OncoAgora to save your learning progress, earn certificates and be part of the community.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="tabs">
            <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Register</button>
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Login</button>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          {info && <div className="alert alert-success">{info}</div>}
          <form className="form" onSubmit={submit}>
            {mode === 'register' && (
              <div><label>Full name</label><input value={form.name} onChange={set('name')} required placeholder="Dr. …" /></div>
            )}
            <div><label>Email</label><input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" /></div>
            <div><label>Password</label><input type="password" value={form.password} onChange={set('password')} required minLength={4} /></div>
            {mode === 'register' && (
              <>
                <div className="form-row">
                  <div><label>Phone</label><input value={form.phone} onChange={set('phone')} placeholder="+20 …" /></div>
                  <div><label>Career grade</label>
                    <select value={form.grade} onChange={set('grade')}>
                      <option>Medical Student</option><option>Resident</option><option>Fellow</option>
                      <option>Specialist</option><option>Consultant</option><option>Professor</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div><label>Specialty</label>
                    <select value={form.specialty} onChange={set('specialty')}>
                      <option>Medical Oncology</option><option>Clinical Oncology</option><option>Radiation Oncology</option>
                      <option>Surgical Oncology</option><option>Pathology</option><option>Radiology</option><option>Other</option>
                    </select>
                  </div>
                  <div><label>Institution</label><input value={form.institution} onChange={set('institution')} placeholder="Hospital / University" /></div>
                </div>
              </>
            )}
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : (mode === 'register' ? 'Create account' : 'Log in')}</button>
            <p className="form-note">{supabaseEnabled ? 'Registration creates a secure account. You may need to confirm your email before logging in.' : 'Demo accounts are stored in your browser. Connect Supabase for real authentication.'}</p>
          </form>
        </div>
      </section>
    </>
  )
}

function Dashboard({ member }) {
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState(member)
  const courses = Courses.all()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const save = async (e) => { e.preventDefault(); await Members.update(member.email, form); setEdit(false) }

  return (
    <>
      <div className="page-head">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>Welcome, {member.name}</h1>
            <p>{member.grade} · {member.specialty}{member.institution ? ` · ${member.institution}` : ''}</p>
          </div>
          <button className="btn btn-outline" onClick={() => Members.logout()}>Log out</button>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div>
              <h2 className="section-title" style={{ fontSize: '1.3rem' }}>My learning</h2>
              <div className="section-title-bar" />
              {courses.map((c) => {
                const pct = Progress.courseCompletion(member.email, c)
                return (
                  <div key={c.id} className="card" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>{c.title}</h3>
                      <Link to={`/courses/${c.id}`} className="btn btn-ghost btn-sm">{pct > 0 ? 'Continue' : 'Start'}</Link>
                    </div>
                    <div className="progress-bar" style={{ marginTop: 10 }}><div style={{ width: `${pct}%` }} /></div>
                    <div className="meta" style={{ marginTop: 4 }}>{pct}% complete{pct === 100 ? ' · 🎓 Certificate available' : ''}</div>
                  </div>
                )
              })}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Manage membership</h2>
                {!edit && <button className="btn btn-ghost btn-sm" onClick={() => setEdit(true)}>Edit</button>}
              </div>
              <div className="section-title-bar" />
              {edit ? (
                <form className="form card" onSubmit={save}>
                  <div><label>Full name</label><input value={form.name} onChange={set('name')} /></div>
                  <div><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
                  <div><label>Institution</label><input value={form.institution} onChange={set('institution')} /></div>
                  <div className="form-row">
                    <div><label>Grade</label>
                      <select value={form.grade} onChange={set('grade')}>
                        <option>Medical Student</option><option>Resident</option><option>Fellow</option>
                        <option>Specialist</option><option>Consultant</option><option>Professor</option>
                      </select>
                    </div>
                    <div><label>Specialty</label>
                      <select value={form.specialty} onChange={set('specialty')}>
                        <option>Medical Oncology</option><option>Clinical Oncology</option><option>Radiation Oncology</option>
                        <option>Surgical Oncology</option><option>Pathology</option><option>Radiology</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" type="submit">Save</button>
                    <button className="btn btn-ghost" type="button" onClick={() => { setForm(member); setEdit(false) }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="card">
                  <table className="data" style={{ width: '100%' }}>
                    <tbody>
                      <tr><th>Email</th><td>{member.email}</td></tr>
                      <tr><th>Phone</th><td>{member.phone || '—'}</td></tr>
                      <tr><th>Grade</th><td>{member.grade}</td></tr>
                      <tr><th>Specialty</th><td>{member.specialty}</td></tr>
                      <tr><th>Institution</th><td>{member.institution || '—'}</td></tr>
                      <tr><th>Member since</th><td>{member.joined}</td></tr>
                      <tr><th>Status</th><td><span className="badge badge-green">{member.status}</span></td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
