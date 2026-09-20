import { useState } from 'react'
import { Courses } from '../lib/store'
import { useStore } from '../lib/useStore'

const BANNERS = [
  ['Indigo → Teal', 'linear-gradient(135deg,#2c3e8c,#0ea5a6)'],
  ['Teal → Green', 'linear-gradient(135deg,#0ea5a6,#7cb518)'],
  ['Red → Amber', 'linear-gradient(135deg,#e63946,#f59e0b)'],
  ['Teal deep', 'linear-gradient(135deg,#0ea5a6,#0b7e7f)'],
  ['Indigo deep', 'linear-gradient(135deg,#2c3e8c,#1e2a66)']
]

function Field({ label, children }) { return <div><label>{label}</label>{children}</div> }

// ============================================================================
// LMS content manager — create courses, modules and lessons of every type.
// ============================================================================
export default function LmsAdmin() {
  useStore()
  const courses = Courses.all()
  const [selectedId, setSelectedId] = useState(courses[0]?.id || null)
  const selected = Courses.get(selectedId)

  return (
    <>
      <h2 className="section-title" style={{ fontSize: '1.3rem' }}>LMS content manager</h2>
      <div className="section-title-bar" />
      <p className="section-sub">Build the full learning platform here: create courses, add modules, and add lessons of any type — video, article, PDF or quiz.</p>

      <div className="grid" style={{ gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        <div>
          <CourseForm onCreate={(id) => setSelectedId(id)} />
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="lms-sidebar" style={{ position: 'static', maxHeight: 'none', border: 'none' }}>
              <div className="mod-title">Courses ({courses.length})</div>
              {courses.map((c) => (
                <a key={c.id} href="#" className={c.id === selectedId ? 'current' : ''}
                   onClick={(e) => { e.preventDefault(); setSelectedId(c.id) }}>
                  <span>📚</span><span>{c.title}</span>
                </a>
              ))}
              {courses.length === 0 && <div style={{ padding: 14, color: 'var(--muted)', fontSize: '0.85rem' }}>No courses yet.</div>}
            </div>
          </div>
        </div>

        <div>
          {selected ? <CourseEditor course={selected} onDeleted={() => setSelectedId(Courses.all()[0]?.id || null)} />
                    : <div className="empty">Create or select a course to edit its content.</div>}
        </div>
      </div>
    </>
  )
}

function CourseForm({ onCreate }) {
  const blank = { title: '', level: 'Beginner', hours: 4, summary: '', banner: BANNERS[0][1] }
  const [form, setForm] = useState(blank)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    Courses.add({ ...form, hours: Number(form.hours), modules: [] })
    const created = Courses.all()[0]
    setForm(blank)
    if (created) onCreate(created.id)
  }
  return (
    <form className="form card" onSubmit={submit} style={{ marginBottom: 16 }}>
      <h3 style={{ margin: 0 }}>New course</h3>
      <Field label="Title"><input value={form.title} onChange={set('title')} required placeholder="Course title" /></Field>
      <div className="form-row">
        <Field label="Level"><select value={form.level} onChange={set('level')}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
        <Field label="Hours"><input type="number" min="1" value={form.hours} onChange={set('hours')} /></Field>
      </div>
      <Field label="Summary"><textarea rows={2} value={form.summary} onChange={set('summary')} /></Field>
      <Field label="Banner"><select value={form.banner} onChange={set('banner')}>{BANNERS.map(([n, v]) => <option key={v} value={v}>{n}</option>)}</select></Field>
      <div style={{ height: 28, borderRadius: 8, background: form.banner }} />
      <button className="btn btn-primary btn-sm" type="submit">Create course</button>
    </form>
  )
}

function CourseEditor({ course, onDeleted }) {
  const [editMeta, setEditMeta] = useState(false)
  const [meta, setMeta] = useState(course)
  const [newModule, setNewModule] = useState('')
  const setM = (k) => (e) => setMeta({ ...meta, [k]: e.target.value })
  const saveMeta = (e) => { e.preventDefault(); Courses.update(course.id, { ...meta, hours: Number(meta.hours) }); setEditMeta(false) }

  const addModule = (e) => { e.preventDefault(); if (!newModule.trim()) return; Courses.addModule(course.id, newModule.trim()); setNewModule('') }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0 }}>{course.title}</h3>
            <div className="meta">{course.level} · {course.modules.length} modules · {Courses.lessons(course).length} lessons</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setMeta(course); setEditMeta(!editMeta) }}>{editMeta ? 'Close' : 'Edit'}</button>
            <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete this entire course?')) { Courses.remove(course.id); onDeleted() } }}>Delete</button>
          </div>
        </div>
        {editMeta && (
          <form className="form" onSubmit={saveMeta} style={{ marginTop: 14 }}>
            <Field label="Title"><input value={meta.title} onChange={setM('title')} /></Field>
            <div className="form-row">
              <Field label="Level"><select value={meta.level} onChange={setM('level')}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
              <Field label="Hours"><input type="number" value={meta.hours} onChange={setM('hours')} /></Field>
            </div>
            <Field label="Summary"><textarea rows={2} value={meta.summary} onChange={setM('summary')} /></Field>
            <Field label="Banner"><select value={meta.banner} onChange={setM('banner')}>{BANNERS.map(([n, v]) => <option key={v} value={v}>{n}</option>)}</select></Field>
            <button className="btn btn-primary btn-sm" type="submit">Save changes</button>
          </form>
        )}
      </div>

      {course.modules.map((mod, mi) => (
        <ModuleEditor key={mod.id} course={course} module={mod} index={mi} total={course.modules.length} />
      ))}

      <form className="form card" onSubmit={addModule} style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}><label>Add a module</label><input value={newModule} onChange={(e) => setNewModule(e.target.value)} placeholder="e.g. Module 4 — Applying the Evidence" /></div>
        <button className="btn btn-primary" type="submit">Add module</button>
      </form>
    </div>
  )
}

function ModuleEditor({ course, module, index, total }) {
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(module.title)
  const [adding, setAdding] = useState(false)

  return (
    <div className="module">
      <div className="module-head">
        {renaming ? (
          <form onSubmit={(e) => { e.preventDefault(); Courses.updateModule(course.id, module.id, { title }); setRenaming(false) }} style={{ display: 'flex', gap: 6, flex: 1 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1, padding: '4px 8px' }} />
            <button className="btn btn-primary btn-sm" type="submit">Save</button>
          </form>
        ) : (
          <>
            <span>{module.title}</span>
            <span style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => Courses.moveModule(course.id, module.id, -1)}>↑</button>
              <button className="btn btn-ghost btn-sm" disabled={index === total - 1} onClick={() => Courses.moveModule(course.id, module.id, 1)}>↓</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setTitle(module.title); setRenaming(true) }}>Rename</button>
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete this module and its lessons?')) Courses.removeModule(course.id, module.id) }}>✕</button>
            </span>
          </>
        )}
      </div>

      {module.lessons.map((l, li) => (
        <LessonRow key={l.id} course={course} module={module} lesson={l} index={li} total={module.lessons.length} />
      ))}

      <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
        {adding
          ? <LessonForm course={course} module={module} onDone={() => setAdding(false)} />
          : <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>+ Add lesson</button>}
      </div>
    </div>
  )
}

const KIND_META = { video: ['li-video', '▶'], pdf: ['li-pdf', '📄'], article: ['li-article', '📖'], quiz: ['li-quiz', '❓'] }

function LessonRow({ course, module, lesson, index, total }) {
  const [editing, setEditing] = useState(false)
  const [, icon] = KIND_META[lesson.kind] || ['', '•']
  if (editing) {
    return <div style={{ padding: 14, borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <LessonForm course={course} module={module} lesson={lesson} onDone={() => setEditing(false)} />
    </div>
  }
  return (
    <div className="lesson-row">
      <span className={`lesson-icon ${KIND_META[lesson.kind]?.[0] || ''}`}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{lesson.title}</div>
        <div className="meta" style={{ margin: 0 }}>{lesson.kind}{lesson.duration ? ` · ${lesson.duration}` : ''}{lesson.pages ? ` · ${lesson.pages}p` : ''}{lesson.questions ? ` · ${lesson.questions.length} question(s)` : ''}</div>
      </div>
      <span style={{ display: 'flex', gap: 4 }}>
        <button className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => Courses.moveLesson(course.id, module.id, lesson.id, -1)}>↑</button>
        <button className="btn btn-ghost btn-sm" disabled={index === total - 1} onClick={() => Courses.moveLesson(course.id, module.id, lesson.id, 1)}>↓</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete this lesson?')) Courses.removeLesson(course.id, module.id, lesson.id) }}>✕</button>
      </span>
    </div>
  )
}

function emptyQuestion() { return { q: '', options: ['', '', '', ''], answer: 0 } }

function LessonForm({ course, module, lesson, onDone }) {
  const [form, setForm] = useState(lesson || { title: '', kind: 'video', url: '', duration: '', pages: '', body: '', questions: [emptyQuestion()] })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const setQuestion = (qi, patch) => setForm({ ...form, questions: form.questions.map((q, i) => i === qi ? { ...q, ...patch } : q) })
  const setOption = (qi, oi, val) => setQuestion(qi, { options: form.questions[qi].options.map((o, i) => i === oi ? val : o) })
  const addQuestion = () => setForm({ ...form, questions: [...(form.questions || []), emptyQuestion()] })
  const removeQuestion = (qi) => setForm({ ...form, questions: form.questions.filter((_, i) => i !== qi) })

  const submit = (e) => {
    e.preventDefault()
    // Keep only the fields relevant to the chosen kind.
    const payload = { title: form.title, kind: form.kind }
    if (form.kind === 'video') { payload.url = form.url; payload.duration = form.duration }
    if (form.kind === 'pdf') { payload.url = form.url; payload.pages = form.pages ? Number(form.pages) : undefined }
    if (form.kind === 'article') { payload.body = form.body }
    if (form.kind === 'quiz') { payload.questions = (form.questions || []).filter((q) => q.q.trim()) }
    if (lesson) Courses.updateLesson(course.id, module.id, lesson.id, payload)
    else Courses.addLesson(course.id, module.id, payload)
    onDone()
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <Field label="Lesson title"><input value={form.title} onChange={set('title')} required placeholder="Lesson title" /></Field>
        <Field label="Type">
          <select value={form.kind} onChange={set('kind')}>
            <option value="video">Video</option><option value="pdf">PDF</option>
            <option value="article">Article (text)</option><option value="quiz">Quiz</option>
          </select>
        </Field>
      </div>

      {form.kind === 'video' && (
        <div className="form-row">
          <Field label="Video URL (YouTube or Vimeo)"><input value={form.url} onChange={set('url')} placeholder="https://youtu.be/… or https://vimeo.com/…" /></Field>
          <Field label="Duration"><input value={form.duration} onChange={set('duration')} placeholder="08:20" /></Field>
        </div>
      )}
      {form.kind === 'video' && <p className="form-note">Paste any YouTube or Vimeo link — watch page, share link or embed URL. It is converted to the player format automatically (unlisted Vimeo links with a hash work too).</p>}

      {form.kind === 'pdf' && (
        <div className="form-row">
          <Field label="PDF URL"><input value={form.url} onChange={set('url')} placeholder="https://… or Supabase Storage link" /></Field>
          <Field label="Pages"><input type="number" value={form.pages} onChange={set('pages')} /></Field>
        </div>
      )}

      {form.kind === 'article' && (
        <Field label="Article text"><textarea rows={8} value={form.body} onChange={set('body')} placeholder="Write the lesson content. Blank lines create paragraphs." /></Field>
      )}

      {form.kind === 'quiz' && (
        <div>
          {(form.questions || []).map((q, qi) => (
            <div key={qi} className="card" style={{ marginBottom: 10, background: 'var(--bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Question {qi + 1}</label>
                {form.questions.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>Remove</button>}
              </div>
              <input value={q.q} onChange={(e) => setQuestion(qi, { q: e.target.value })} placeholder="Question text" style={{ marginBottom: 8 }} />
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <input type="radio" name={`correct-${qi}`} checked={q.answer === oi} onChange={() => setQuestion(qi, { answer: oi })} title="Mark correct" />
                  <input value={opt} onChange={(e) => setOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                </div>
              ))}
              <p className="form-note">Select the radio next to the correct answer.</p>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addQuestion}>+ Add question</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button className="btn btn-primary btn-sm" type="submit">{lesson ? 'Save lesson' : 'Add lesson'}</button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}
