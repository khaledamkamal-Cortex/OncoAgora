import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Courses, Members, Progress } from '../lib/store'
import { useStore } from '../lib/useStore'

const KIND_ICON = { video: ['li-video', '▶'], pdf: ['li-pdf', '📄'], article: ['li-article', '📖'], quiz: ['li-quiz', '❓'] }

export default function Course() {
  useStore()
  const { courseId } = useParams()
  const course = Courses.get(courseId)
  const member = Members.current()
  const lessons = useMemo(() => (course ? Courses.lessons(course) : []), [course])
  const [currentId, setCurrentId] = useState(lessons[0]?.id)

  if (!course) return <div className="section container"><div className="empty">Course not found. <Link to="/courses">Back to the catalog</Link></div></div>

  const current = lessons.find((l) => l.id === currentId) || lessons[0]
  const completion = member ? Progress.courseCompletion(member.email, course) : 0
  const idx = lessons.findIndex((l) => l.id === current?.id)

  const goNext = () => { if (idx < lessons.length - 1) setCurrentId(lessons[idx + 1].id) }
  const goPrev = () => { if (idx > 0) setCurrentId(lessons[idx - 1].id) }

  return (
    <>
      <div className="page-head">
        <div className="container">
          <Link to="/courses" style={{ color: '#fff', opacity: 0.85, fontSize: '0.9rem' }}>← All courses</Link>
          <h1 style={{ marginTop: 6 }}>{course.title}</h1>
          <div style={{ maxWidth: 420, marginTop: 10 }}>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.25)' }}><div style={{ width: `${completion}%` }} /></div>
            <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: 4 }}>{completion}% complete</div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {completion === 100 && member && <Certificate name={member.name} course={course.title} />}
          <div className="lms-layout">
            <aside className="lms-sidebar">
              {course.modules.map((mod) => (
                <div key={mod.id}>
                  <div className="mod-title">{mod.title}</div>
                  {mod.lessons.map((l) => {
                    const done = member && Progress.isDone(member.email, course.id, l.id)
                    const [, icon] = KIND_ICON[l.kind] || ['', '•']
                    return (
                      <a key={l.id} className={l.id === current?.id ? 'current' : ''} onClick={(e) => { e.preventDefault(); setCurrentId(l.id) }} href="#">
                        <span>{done ? '✅' : icon}</span>
                        <span>{l.title}</span>
                      </a>
                    )
                  })}
                </div>
              ))}
            </aside>

            <div>
              {current && <LessonView key={current.id} lesson={current} course={course} member={member} onDone={goNext} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button className="btn btn-ghost" onClick={goPrev} disabled={idx <= 0}>← Previous</button>
                <button className="btn btn-primary" onClick={goNext} disabled={idx >= lessons.length - 1}>Next lesson →</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function LessonView({ lesson, course, member, onDone }) {
  const done = member && Progress.isDone(member.email, course.id, lesson.id)
  const markDone = () => { if (member) Progress.toggle(member.email, course.id, lesson.id, !done) }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <h2 style={{ color: 'var(--purple-dark)', fontSize: '1.3rem' }}>{lesson.title}</h2>
        {member
          ? <button className={`btn btn-sm ${done ? 'btn-ghost' : 'btn-gold'}`} onClick={markDone}>{done ? '✓ Completed — undo' : 'Mark as complete'}</button>
          : <Link to="/membership" className="btn btn-ghost btn-sm">Log in to track progress</Link>}
      </div>

      {lesson.kind === 'video' && (lesson.url
        ? <div className="video-frame"><iframe src={lesson.url} title={lesson.title} allowFullScreen /></div>
        : <div className="alert alert-info">🎬 The recording for this lesson will be added soon.</div>)}
      {lesson.kind === 'article' && <div style={{ whiteSpace: 'pre-line', fontSize: '1rem' }}>{lesson.body}</div>}
      {lesson.kind === 'pdf' && <div className="alert alert-info">📄 PDF document ({lesson.pages || '?'} pages). In production this renders the uploaded PDF from Supabase Storage.</div>}
      {lesson.kind === 'quiz' && <Quiz lesson={lesson} onPass={() => { if (member && !done) Progress.toggle(member.email, course.id, lesson.id, true) }} />}
    </div>
  )
}

function Quiz({ lesson, onPass }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const correct = lesson.questions.filter((q, i) => answers[i] === q.answer).length
  const passed = correct === lesson.questions.length

  const submit = () => { setSubmitted(true); if (correct === lesson.questions.length) onPass() }

  return (
    <div>
      {lesson.questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>{qi + 1}. {q.q}</p>
          {q.options.map((opt, oi) => {
            let cls = 'quiz-option'
            if (submitted) {
              if (oi === q.answer) cls += ' correct'
              else if (answers[qi] === oi) cls += ' wrong'
            } else if (answers[qi] === oi) cls += ' selected'
            return (
              <div key={oi} className={cls} onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}>
                <input type="radio" checked={answers[qi] === oi} readOnly /> <span>{opt}</span>
              </div>
            )
          })}
        </div>
      ))}
      {!submitted
        ? <button className="btn btn-primary" onClick={submit} disabled={Object.keys(answers).length < lesson.questions.length}>Submit answers</button>
        : <div className={`alert ${passed ? 'alert-success' : 'alert-error'}`}>
            You scored {correct} / {lesson.questions.length}. {passed ? 'Passed! Lesson marked complete.' : 'Review the highlighted answers and try again.'}
            {!passed && <button className="btn btn-ghost btn-sm" style={{ marginLeft: 12 }} onClick={() => { setSubmitted(false); setAnswers({}) }}>Retry</button>}
          </div>}
    </div>
  )
}

function Certificate({ name, course }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="certificate">
        <div style={{ fontSize: '0.8rem', letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>OncoAgora</div>
        <div style={{ fontSize: '2.4rem' }}>🎓</div>
        <div style={{ fontSize: '0.9rem', letterSpacing: 2, color: 'var(--muted)' }}>CERTIFICATE OF COMPLETION</div>
        <p style={{ marginTop: 16 }}>This certifies that</p>
        <div className="cname">{name}</div>
        <p>has successfully completed the course</p>
        <h1 style={{ fontSize: '1.3rem' }}>{course}</h1>
        <p style={{ color: 'var(--muted)', marginTop: 10 }}>Issued {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: 14 }} className="no-print">
        <button className="btn btn-gold" onClick={() => window.print()}>🖨 Print / Save certificate</button>
      </div>
    </div>
  )
}
