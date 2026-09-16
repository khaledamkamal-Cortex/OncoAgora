import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty" style={{ padding: 72 }}>
          <h1 style={{ color: 'var(--purple)', fontSize: '3rem', marginBottom: 8 }}>404</h1>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to home</Link>
        </div>
      </div>
    </section>
  )
}
