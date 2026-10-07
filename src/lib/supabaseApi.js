// All Supabase reads/writes for OncoAgora. store.js calls into this module
// when Supabase is configured; otherwise it uses its localStorage path.
import { supabase } from './supabase'

// Translate raw Supabase auth errors into messages fit for members.
function friendly(message) {
  const msg = message || 'Something went wrong. Please try again.'
  if (/rate limit/i.test(msg)) return 'Registration is temporarily busy (too many sign-ups at once). Please try again in about an hour — your details were not saved, so just register again.'
  if (/already registered|already exists/i.test(msg)) return 'An account with this email already exists — switch to Login.'
  if (/invalid login credentials/i.test(msg)) return 'Invalid email or password.'
  if (/not confirmed/i.test(msg)) return 'Your email is not confirmed yet — please use the confirmation link sent to your inbox, then log in.'
  if (/password should be/i.test(msg)) return 'Password is too short — please use at least 6 characters.'
  if (/is invalid/i.test(msg) && /email/i.test(msg)) return 'That email address was not accepted — please double-check it.'
  return msg
}

// ---------------- Courses (assembled into nested course objects) ----------------

export async function loadCourses() {
  const [{ data: courses }, { data: modules }, { data: lessons }] = await Promise.all([
    supabase.from('courses').select('*').order('sort'),
    supabase.from('modules').select('*').order('sort'),
    supabase.from('lessons').select('*').order('sort')
  ])
  return (courses || []).map((c) => ({
    ...c,
    modules: (modules || []).filter((m) => m.course_id === c.id).map((m) => ({
      ...m,
      lessons: (lessons || []).filter((l) => l.module_id === m.id)
    }))
  }))
}

// ---------------- Auth / members ----------------

export async function signUp(profile) {
  // Profile fields travel as user metadata; a DB trigger (handle_new_user)
  // creates the matching members row with elevated rights. This works whether
  // or not email confirmation is enabled.
  const { data, error } = await supabase.auth.signUp({
    email: profile.email,
    password: profile.password,
    options: { data: { name: profile.name, phone: profile.phone, grade: profile.grade, specialty: profile.specialty, institution: profile.institution } }
  })
  if (error) throw new Error(friendly(error.message))
  if (!data.session) return { pending: true, email: profile.email } // email confirmation required
  return fetchCurrentMember()
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(friendly(error.message))
  return fetchCurrentMember()
}

export async function signOut() { await supabase.auth.signOut() }

export async function fetchCurrentMember() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('members').select('*').eq('user_id', user.id).maybeSingle()
  const { data: adminRow } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!data) return null
  return { ...data, isAdmin: !!adminRow }
}

export async function updateMemberProfile(email, patch) {
  const fields = (({ name, phone, institution, grade, specialty }) => ({ name, phone, institution, grade, specialty }))(patch)
  await supabase.from('members').update(fields).eq('email', email)
}

// ---------------- Progress ----------------

export async function loadProgress(memberId) {
  const { data } = await supabase.from('progress').select('course_id,lesson_id').eq('member_id', memberId)
  return data || []
}

export async function setProgress(memberId, courseId, lessonId, done) {
  if (done) await supabase.from('progress').upsert({ member_id: memberId, course_id: courseId, lesson_id: lessonId }, { onConflict: 'member_id,lesson_id' })
  else await supabase.from('progress').delete().eq('member_id', memberId).eq('lesson_id', lessonId)
}

// ---------------- Certificate templates ----------------

export async function getCertTemplate(courseId) {
  const { data } = await supabase.from('cert_templates').select('data_url').eq('course_id', courseId).maybeSingle()
  return data?.data_url || null
}
export function setCertTemplate(courseId, dataUrl) {
  return supabase.from('cert_templates').upsert({ course_id: courseId, data_url: dataUrl, updated_at: new Date().toISOString() })
}
export function removeCertTemplate(courseId) {
  return supabase.from('cert_templates').delete().eq('course_id', courseId)
}

// ---------------- Admin content writes ----------------
// Each returns the raw Supabase result; store.js reloads affected slices afterward.

export const db = {
  // Members (admin)
  loadMembers: async () => (await supabase.from('members').select('*')).data || [],
  removeMember: (email) => supabase.from('members').delete().eq('email', email),

  // Courses
  addCourse: (c) => supabase.from('courses').insert({ title: c.title, level: c.level, summary: c.summary, banner: c.banner, hours: c.hours, cme_points: c.cme_points || 0, sort: 0 }),
  updateCourse: (id, patch) => supabase.from('courses').update(pick(patch, ['title', 'level', 'summary', 'banner', 'hours', 'cme_points', 'hidden', 'cert_enabled', 'cert_name_y'])).eq('id', id),
  removeCourse: (id) => supabase.from('courses').delete().eq('id', id),

  // Modules
  addModule: async (courseId, title) => {
    const n = await nextSort('modules', 'course_id', courseId)
    return supabase.from('modules').insert({ course_id: courseId, title, sort: n })
  },
  updateModule: (id, patch) => supabase.from('modules').update(pick(patch, ['title', 'cme_points'])).eq('id', id),
  removeModule: (id) => supabase.from('modules').delete().eq('id', id),
  swapModuleSort: (a, b) => swapSort('modules', a, b),

  // Lessons
  addLesson: async (moduleId, lesson) => {
    const n = await nextSort('lessons', 'module_id', moduleId)
    return supabase.from('lessons').insert({ ...toLessonRow(lesson), module_id: moduleId, sort: n })
  },
  updateLesson: (id, patch) => supabase.from('lessons').update(toLessonRow(patch)).eq('id', id),
  removeLesson: (id) => supabase.from('lessons').delete().eq('id', id),
  swapLessonSort: (a, b) => swapSort('lessons', a, b)
}

// ---------------- helpers ----------------
function pick(obj, keys) {
  const out = {}
  for (const k of keys) if (k in obj) out[k] = obj[k]
  return out
}
function toLessonRow(l) {
  // Only copy keys that are present, so a partial patch (e.g. { hidden: true })
  // never nulls out the other columns.
  const row = {}
  for (const k of ['title', 'kind', 'url', 'duration', 'pages', 'body', 'questions', 'hidden', 'pass_pct']) {
    if (k in l) row[k] = l[k]
  }
  return row
}
async function nextSort(table, fk, fkVal) {
  const { data } = await supabase.from(table).select('sort').eq(fk, fkVal).order('sort', { ascending: false }).limit(1)
  return ((data && data[0]?.sort) || 0) + 1
}
async function swapSort(table, a, b) {
  await supabase.from(table).update({ sort: b.sort }).eq('id', a.id)
  await supabase.from(table).update({ sort: a.sort }).eq('id', b.id)
}
