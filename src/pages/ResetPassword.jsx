import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Members } from '../lib/store'
import { useStore } from '../lib/useStore'

// Two modes on one page:
//  • Arrived from a recovery email (or already logged in): set a new password.
//  • Otherwise: request a reset link by email.
export default function ResetPassword() {
  const s = useStore()
  const member = Members.current()
  const canSetPassword = s.passwordRecovery || !!member

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>{canSetPassword ? 'Set a new password' : 'Reset your password'}</h1>
          <p>{canSetPassword
            ? 'Choose a new password for your OncoAgora account.'
            : 'Enter your account email and we will send you a reset link.'}</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 480 }}>
          {canSetPassword ? <SetPasswordForm memberName={member?.name} /> : <RequestForm />}
        </div>
      </section>
    </>
  )
}

function RequestForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await Members.requestPasswordReset(email)
      setSent(true)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (sent) {
    return (
      <div className="alert alert-success">
        If an account exists for <b>{email}</b>, a password-reset link is on its way. Open it on this device and you will be asked for a new password. The link is valid for a limited time.
      </div>
    )
  }
  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="form card" onSubmit={submit}>
        <div><label>Account email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" autoFocus /></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        <p className="form-note">Remembered it after all? <Link to="/membership">Back to login</Link>.</p>
      </form>
    </>
  )
}

function SetPasswordForm({ memberName }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    if (pw !== pw2) return setError('The two passwords do not match.')
    setBusy(true)
    try {
      await Members.updatePassword(pw)
      setDone(true)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (done) {
    return (
      <div className="alert alert-success">
        ✅ Your password has been updated{memberName ? `, ${memberName}` : ''} — you are logged in.
        <div style={{ marginTop: 10 }}><Link to="/membership" className="btn btn-primary btn-sm">Go to My Learning</Link></div>
      </div>
    )
  }
  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="form card" onSubmit={submit}>
        <div><label>New password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} autoFocus /></div>
        <div><label>Confirm new password</label><input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required minLength={6} /></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
      </form>
    </>
  )
}
