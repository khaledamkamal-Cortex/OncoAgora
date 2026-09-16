// All Supabase reads/writes for OncoAgora. store.js calls into this module
// when Supabase is configured; otherwise it uses its localStorage path.
import { supabase } from './supabase'

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
  if (error) throw new Error(error.message)
  if (!data.session) return { pending: true, email: profile.email } // email confirmation required
  return fetchCurrentMember()
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
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

// ---------------- Admin content writes ----------------
// Each returns the raw Supabase result; store.js reloads affected slices afterward.

export const db = {
  // Members (admin)
  loadMembers: async () => (await supabase.from('members').select('*')).data || [],
  removeMember: (email) => supabase.from('members').delete().eq('email', email),

  // Courses
  addCourse: (c) => supabase.from('courses').insert({ title: c.title, level: c.level, summary: c.summary, banner: c.banner, hours: c.hours, sort: 0 }),
  updateCourse: (id, patch) => supabase.from('courses').update((({ title, level, summary, banner, hours }) => ({ title, level, summary, banner, hours }))(patch)).eq('id', id),
  removeCourse: (id) => supabase.from('courses').delete().eq('id', id),

  // Modules
  addModule: async (courseId, title) => {
    const n = await nextSort('modules', 'course_id', courseId)
    return supabase.from('modules').insert({ course_id: courseId, title, sort: n })
  },
  updateModule: (id, patch) => supabase.from('modules').update({ title: patch.title }).eq('id', id),
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
function toLessonRow(l) {
  const row = { title: l.title, kind: l.kind }
  if ('url' in l) row.url = l.url
  if ('duration' in l) row.duration = l.duration
  if ('pages' in l) row.pages = l.pages
  if ('body' in l) row.body = l.body
  if ('questions' in l) row.questions = l.questions
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
