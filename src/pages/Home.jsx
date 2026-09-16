import { Link } from 'react-router-dom'
import { Courses, Members, Progress } from '../lib/store'
import { useStore } from '../lib/useStore'

export default function Home() {
  useStore()
  const courses = Courses.all()
  const member = Members.current()
  const totalLessons = courses.reduce((n, c) => n + Courses.lessons(c).length, 0)

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge badge-gold" style={{ marginBottom: 14 }}>Oncology · Education · Community</span>
          <h1>Onco<span className="acronym">Agora</span></h1>
          <p className="tagline">The gathering place for oncology learning</p>
          <p className="sub">A dedicated learning platform for oncology professionals — structured courses of video lectures, readings and quizzes, with progress tracking and certificates of completion. Born from the CAIRO Journal Club's critical-appraisal curriculum.</p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-gold">Browse Courses</Link>
            <Link to="/membership" className="btn btn-outline">{member ? 'My Learning' : 'Become a Member'}</Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="grid grid-4">
            <StatBox num={courses.length} label="Courses" />
            <StatBox num={totalLessons} label="Lessons" />
            <StatBox num="4" label="Lesson formats" />
            <StatBox num="🎓" label="Certificates" />
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'linear-gradient(120deg,var(--purple-light),var(--blue-light))' }}>
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="section-title-bar" />
          <div className="grid grid-3">
            <FeatureCard icon="📚" title="1 · Enrol" text="Pick a course from the catalog. Each course is built from modules of video, article, PDF and quiz lessons." />
            <FeatureCard icon="✅" title="2 · Learn & track" text="Mark lessons complete and pass the quizzes. Your progress is saved to your account so you can pick up anywhere." />
            <FeatureCard icon="📜" title="3 · Get certified" text="Finish every lesson to unlock a personalised certificate of completion you can print or save." />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Featured courses</h2>
          <div className="section-title-bar" />
          <div className="grid grid-2">
            {courses.slice(0, 4).map((c) => {
              const lessons = Courses.lessons(c)
              const pct = member ? Progress.courseCompletion(member.email, c) : 0
              return (
                <Link key={c.id} to={`/courses/${c.id}`} className="card card-link" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 96, background: c.banner, display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                    <span className="badge badge-gold">{c.level}</span>
                  </div>
                  <div style={{ padding: 18 }}>
                    <h3>{c.title}</h3>
                    <p>{c.summary}</p>
                    <div className="meta" style={{ marginTop: 8 }}>{c.modules.length} modules · {lessons.length} lessons · ~{c.hours}h</div>
                    {member && pct > 0 && (
                      <>
                        <div className="progress-bar" style={{ marginTop: 8 }}><div style={{ width: `${pct}%` }} /></div>
                        <div className="meta" style={{ marginTop: 4 }}>{pct}% complete</div>
                      </>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
          <div style={{ marginTop: 20 }}><Link to="/courses" className="btn btn-primary">View all courses →</Link></div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 className="section-title">Why "Agora"?</h2>
          <div className="section-title-bar" />
          <p>In ancient Greece, the <i>agora</i> was the gathering place — where citizens met to learn, debate and grow. OncoAgora carries that spirit into oncology education: a shared space where clinicians sharpen their ability to read, appraise and apply the evidence that shapes patient care.</p>
        </div>
      </section>
    </>
  )
}

function StatBox({ num, label }) {
  return <div className="card stat-card"><div className="num">{num}</div><div className="lbl">{label}</div></div>
}
function FeatureCard({ icon, title, text }) {
  return (
    <div className="card">
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <h3 style={{ marginTop: 6 }}>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
