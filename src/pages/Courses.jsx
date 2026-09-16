import { Link } from 'react-router-dom'
import { Courses, Members, Progress } from '../lib/store'
import { useStore } from '../lib/useStore'

export default function CoursesPage() {
  useStore()
  const courses = Courses.all()
  const member = Members.current()

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>Course Catalog</h1>
          <p>Structured, self-paced oncology courses — video lectures, readings, PDFs and quizzes. Track your progress and earn certificates.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {!member && (
            <div className="alert alert-info">
              You can browse courses freely. <Link to="/membership">Log in or register</Link> to save your progress and earn certificates.
            </div>
          )}
          {courses.length === 0 && <div className="empty">No courses published yet — check back soon.</div>}
          <div className="grid grid-2">
            {courses.map((c) => {
              const lessons = Courses.lessons(c)
              const completion = member ? Progress.courseCompletion(member.email, c) : 0
              return (
                <Link key={c.id} to={`/courses/${c.id}`} className="card card-link" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 110, background: c.banner, display: 'flex', alignItems: 'flex-end', padding: 16 }}>
                    <span className="badge badge-gold">{c.level}</span>
                  </div>
                  <div style={{ padding: 18 }}>
                    <h3>{c.title}</h3>
                    <p>{c.summary}</p>
                    <div className="meta" style={{ margin: '10px 0 6px' }}>
                      {c.modules.length} modules · {lessons.length} lessons · ~{c.hours}h
                    </div>
                    {member && (
                      <>
                        <div className="progress-bar"><div style={{ width: `${completion}%` }} /></div>
                        <div className="meta" style={{ marginTop: 4 }}>{completion}% complete</div>
                      </>
                    )}
                    <span className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>{completion > 0 ? 'Continue' : 'Start course'} →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
