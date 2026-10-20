import './style.css'

type Priority = 'low' | 'medium' | 'high'
type Task = { id: number; title: string; done: boolean; priority: Priority; date: string }
type Filter = 'all' | 'today' | 'upcoming' | 'completed'

const STORE = 'daymark.tasks.v1'
const today = new Date()
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const plusDays = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return dateKey(d) }
const starter: Task[] = [
  { id: 1, title: 'Plan the week ahead', done: true, priority: 'low', date: dateKey(today) },
  { id: 2, title: 'Review project notes', done: false, priority: 'high', date: dateKey(today) },
  { id: 3, title: 'Send the team an update', done: false, priority: 'medium', date: dateKey(today) },
  { id: 4, title: 'Make time for a proper lunch', done: false, priority: 'low', date: plusDays(1) },
]
let tasks: Task[]
try { tasks = JSON.parse(localStorage.getItem(STORE) || 'null') || starter } catch { tasks = starter }
let filter: Filter = 'all'
let query = ''

const app = document.querySelector<HTMLDivElement>('#app')!
const safe = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
const prettyDate = (key: string) => key === dateKey(today) ? 'Today' : key === plusDays(1) ? 'Tomorrow' : new Date(`${key}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })
const visibleTasks = () => tasks.filter(task => {
  const matches = filter === 'all' || (filter === 'today' && task.date === dateKey(today)) || (filter === 'upcoming' && !task.done && task.date > dateKey(today)) || (filter === 'completed' && task.done)
  return matches && task.title.toLowerCase().includes(query.toLowerCase())
})

function render() {
  const open = tasks.filter(task => !task.done).length
  const completed = tasks.filter(task => task.done).length
  const shown = visibleTasks()
  const greeting = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(today)
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#" aria-label="Daymark home"><span class="brand-icon">d<span>.</span></span><span>daymark</span></a>
        <div class="workspace-label">WORKSPACE</div>
        <nav class="nav" aria-label="Task filters">
          <button class="nav-item ${filter === 'all' ? 'active' : ''}" data-filter="all"><span class="nav-symbol">▦</span> All tasks <span class="nav-count">${tasks.length}</span></button>
          <button class="nav-item ${filter === 'today' ? 'active' : ''}" data-filter="today"><span class="nav-symbol">◷</span> Today <span class="nav-count">${tasks.filter(t => !t.done && t.date === dateKey(today)).length}</span></button>
          <button class="nav-item ${filter === 'upcoming' ? 'active' : ''}" data-filter="upcoming"><span class="nav-symbol">⌁</span> Upcoming</button>
          <button class="nav-item ${filter === 'completed' ? 'active' : ''}" data-filter="completed"><span class="nav-symbol">✓</span> Completed</button>
        </nav>
        <div class="sidebar-bottom"><div class="focus-card"><span class="spark">✳</span><div><strong>Small steps count.</strong><p>Keep showing up for yourself.</p></div></div><div class="profile"><div class="avatar">Y</div><div><strong>Your space</strong><span>Personal workspace</span></div><span class="dots">···</span></div></div>
      </aside>
      <main class="main">
        <header class="topbar"><span class="crumb">My workspace <span>/</span> ${filter === 'all' ? 'All tasks' : filter[0].toUpperCase() + filter.slice(1)}</span><div class="top-actions"><span class="date-pill">◷ &nbsp; ${safe(greeting)}</span><button class="icon-button" id="search-toggle" aria-label="Search tasks">⌕</button></div></header>
        <section class="content">
          <div class="intro"><div><div class="eyebrow">A FRESH START, EVERY DAY</div><h1>Make room for<br/><em>what matters.</em></h1><p class="subtitle">A little progress each day adds up to something wonderful.</p></div><div class="day-art" aria-hidden="true"><div class="sun"></div><div class="hill hill-back"></div><div class="hill hill-front"></div><span class="art-star">✳</span></div></div>
          <div class="stats"><div class="stat"><span class="stat-icon lilac">↗</span><div><strong>${open}</strong><span>Tasks in motion</span></div></div><div class="stat"><span class="stat-icon green">✓</span><div><strong>${completed}</strong><span>Wins so far</span></div></div><div class="stat"><span class="stat-icon peach">✳</span><div><strong>${open ? Math.round(completed / tasks.length * 100) : 100}%</strong><span>Of your list complete</span></div></div></div>
          <div class="task-heading"><div><div class="section-kicker">YOUR SPACE</div><h2>${filter === 'today' ? 'Today’s focus' : filter === 'upcoming' ? 'Coming up' : filter === 'completed' ? 'Look what you did' : 'Your tasks'} <span class="heading-count">${shown.length}</span></h2></div><div class="heading-actions"><input id="search" class="search-input" placeholder="Find a task…" aria-label="Find a task" value="${safe(query)}"/><button class="add-button" id="add-task"><span>＋</span> Add a task</button></div></div>
          <div class="task-list">${shown.length ? shown.map(task => `<article class="task-row ${task.done ? 'is-done' : ''}" data-id="${task.id}"><button class="check ${task.done ? 'checked' : ''}" data-action="toggle" aria-label="${task.done ? 'Mark incomplete' : 'Complete task'}">${task.done ? '✓' : ''}</button><div class="task-copy"><span class="task-title">${safe(task.title)}</span><span class="task-meta"><span class="priority-dot ${task.priority}"></span>${task.priority} priority <span class="meta-separator">·</span> ${prettyDate(task.date)}</span></div><button class="delete-button" data-action="delete" aria-label="Delete ${safe(task.title)}">×</button></article>`).join('') : `<div class="empty"><span>✳</span><strong>Nothing on this page just yet.</strong><p>Add a task or choose another view to keep things moving.</p></div>`}</div>
          <div class="list-foot"><span>Showing ${shown.length} of ${tasks.length} tasks</span><span><i></i> Saved on this device</span></div>
        </section>
        <footer>Made for the things that matter <span>✳</span></footer>
      </main>
    </div>
    <dialog id="task-dialog"><form method="dialog" id="task-form"><button type="button" class="modal-close" id="close-dialog" aria-label="Close">×</button><div class="section-kicker">MAKE A LITTLE SPACE</div><h2>Add a task</h2><label for="task-title">What would you like to do?</label><input id="task-title" name="title" maxlength="100" placeholder="e.g. Take a fresh-air break" required/><div class="form-row"><div><label for="task-date">When</label><input id="task-date" name="date" type="date" value="${dateKey(today)}" required/></div><div><label for="task-priority">Priority</label><select id="task-priority" name="priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></div></div><button class="add-button submit-button" type="submit">Add to my list <span>→</span></button></form></dialog>`
  bind()
}

function persist() { localStorage.setItem(STORE, JSON.stringify(tasks)); render() }
function bind() {
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter as Filter; render() }))
  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => {
    const id = Number(button.closest<HTMLElement>('[data-id]')?.dataset.id)
    if (button.dataset.action === 'toggle') tasks = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task)
    if (button.dataset.action === 'delete') tasks = tasks.filter(task => task.id !== id)
    persist()
  }))
  document.querySelector<HTMLButtonElement>('#add-task')!.addEventListener('click', () => document.querySelector<HTMLDialogElement>('#task-dialog')!.showModal())
  document.querySelector<HTMLButtonElement>('#close-dialog')!.addEventListener('click', () => document.querySelector<HTMLDialogElement>('#task-dialog')!.close())
  document.querySelector<HTMLButtonElement>('#search-toggle')!.addEventListener('click', () => { const input = document.querySelector<HTMLInputElement>('#search')!; input.classList.toggle('search-visible'); if (input.classList.contains('search-visible')) input.focus() })
  document.querySelector<HTMLInputElement>('#search')!.addEventListener('input', event => { query = (event.target as HTMLInputElement).value; const start = (event.target as HTMLInputElement).selectionStart; render(); const next = document.querySelector<HTMLInputElement>('#search')!; next.focus(); next.setSelectionRange(start, start) })
  document.querySelector<HTMLFormElement>('#task-form')!.addEventListener('submit', event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget as HTMLFormElement)
    const title = String(form.get('title')).trim()
    if (!title) return
    tasks.unshift({ id: Date.now(), title, done: false, date: String(form.get('date')), priority: form.get('priority') as Priority })
    document.querySelector<HTMLDialogElement>('#task-dialog')!.close()
    persist()
  })
}
render()
