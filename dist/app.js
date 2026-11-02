import { DEMO_PARENT, CHILDREN, WEEKS, COURSES } from './demo-data.js';
import { initMaxBridge } from './max-bridge.js';

const app = document.querySelector('#app');
const dialogRoot = document.querySelector('#dialog-root');
const progressKey = 'foxel-demo-progress-v1';
const navItems = [
  ['home', 'Главная', 'home'], ['children', 'Дети', 'users'], ['statistics', 'Прогресс', 'chart'],
  ['tasks', 'Задания', 'checklist'], ['achievements', 'Награды', 'trophy'], ['profile', 'Профиль', 'user'],
];
const state = {
  view: 'home', childId: CHILDREN[0].id, scenario: 'base', week: 0,
  query: '', subject: 'all', taskStatus: 'all', achievementFilter: 'all',
  done: loadProgress(), modal: null, returnFocus: null,
  max: { mode: 'browser', launchDetected: false, bridgeReady: false, identityVerified: false, sessionState: 'demo', identity: null, foxfordLinked: false },
};
let toastTimer;

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function icon(name, extraClass = '') {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>',
    chart: '<path d="M4 3v17h17M9 15v-4m5 4V6m5 9v-6"/>',
    checklist: '<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M9 3h6v4H9zM8 12l1 1 2-2m3 1h3m-9 5 1 1 2-2m3 1h3"/>',
    trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0zm4 10v5m-4 3h8M8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    chevronLeft: '<path d="m15 5-7 7 7 7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    book: '<path d="M12 5v16M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1z"/>',
    math: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h2m4 0h2m-8 4h2m4 0h2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    atom: '<circle cx="12" cy="12" r="1"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(40 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-40 12 12)"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    sparkles: '<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3zM20 2v4m-2-2h4"/>',
    flame: '<path d="M13 3c1 5 5 5 5 10a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 2 4 2 4 2-2 2-5 2-7z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 2m0 4h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    link: '<path d="m10 14 4-4m-6 6-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 2 2-2a4 4 0 1 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
    shield: '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z"/><path d="m8 12 3 3 5-6"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-4zm0 0h4a3 3 0 1 0-3-4z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5M5.5 7a7.5 7.5 0 0 1 12-2L20 8M4 16l2.5 3a7.5 7.5 0 0 0 12-2"/>',
    bell: '<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/>',
  };
  return `<svg class="icon ${esc(extraClass)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkles}</svg>`;
}
function foxLogo(className = '') {
  return `<svg class="fox-logo ${esc(className)}" viewBox="0 0 48 48" aria-hidden="true"><path fill="#f47732" d="m5 7 14 7h10l14-7-3 23-16 13L8 30z"/><path fill="#fff4e9" d="m9 19 15 11 15-11-3 12-12 10L12 31z"/><path fill="#292b2e" d="m20 30 4 4 4-4z"/><path fill="#292b2e" d="m13 22 5 2-1 2-4-2zm22 0-5 2 1 2 4-2z"/></svg>`;
}
function foxIllustration() {
  return `<svg class="hero-fox" viewBox="0 0 330 230" role="img" aria-label="Лисёнок с книгами — символ любопытства"><ellipse cx="178" cy="210" rx="116" ry="11" fill="#eddfca"/><path d="M257 162c48-40 57-14 42 9-8 14-27 31-59 28" fill="#f47732"/><path d="M292 146c15-3 23 8 7 25l-10 12-15-15z" fill="#fffaf2"/><rect x="82" y="188" width="134" height="17" rx="5" fill="#565441"/><rect x="70" y="170" width="151" height="18" rx="5" fill="#c8d5ba"/><path d="M85 177h109M91 195h98" stroke="#fffaf2" stroke-width="3" stroke-linecap="round"/><path d="M127 160c-4-39 14-66 47-66s55 37 52 78l-15 18h-71z" fill="#f6a25d"/><path d="M147 128c18-14 38-13 51 0l9 44h-69z" fill="#fff5e4"/><path d="m117 37 38 21h40l37-21-9 63-49 35-49-35z" fill="#f47732"/><path d="m127 55 24 12-27 17zm95 0-24 12 27 17z" fill="#8c492c"/><path d="m127 85 47 29 48-29-8 22-40 28-39-28z" fill="#fff7e9"/><path d="m163 109 11 10 11-10z" fill="#34332f"/><path d="m144 88 12 5m38-5-12 5" stroke="#34332f" stroke-width="4" stroke-linecap="round"/><path d="M124 144c-21 7-35 7-39 18 22 5 38 6 56-1m74-17c20 4 26 11 23 19-14 5-28 3-36-3" fill="#f47732"/><path d="m136 157 37 10 37-10v33l-37 11-37-11z" fill="#fffaf2"/><path d="m173 167 37-10v33l-37 11z" fill="#e8dfcc"/><path d="M173 170v24m-28-24 19 5m-19 3 19 5m18-8 19-5m-19 13 19-5" stroke="#b1b8a2" stroke-width="2" stroke-linecap="round"/><path d="m67 63 4 10 10 4-10 4-4 10-4-10-10-4 10-4zm206 24 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#f6b769"/><circle cx="264" cy="43" r="5" fill="#a1b58f"/><circle cx="92" cy="125" r="4" fill="#a1b58f"/><path d="m246 124 9-4m-23-101 4-9M91 38l-6-6" stroke="#b9b19f" stroke-width="3" stroke-linecap="round"/></svg>`;
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) || '{}');
    if (saved.version !== 1 || !saved.completed || typeof saved.completed !== 'object' || Array.isArray(saved.completed)) return {};
    return Object.fromEntries(Object.entries(saved.completed).filter(([key, value]) => /^(leo|sofia):[a-z-]+$/.test(key) && typeof value === 'boolean'));
  } catch { return {}; }
}
function saveProgress() {
  try { localStorage.setItem(progressKey, JSON.stringify({ version: 1, completed: state.done })); }
  catch { toast('Прогресс сохранён только до закрытия этой страницы.'); }
}
function child() { return CHILDREN.find(item => item.id === state.childId) || CHILDREN[0]; }
function visibleTasks(student = child()) { return student.tasks.filter(task => !task.expanded || state.scenario === 'expanded'); }
function isDone(task, student = child()) { return state.done[`${student.id}:${task.id}`] ?? task.completed; }
function stats(student = child()) {
  const source = student.weeks[state.week];
  const days = [...source.days];
  const subjectResults = [...source.subjectResults];
  let minutes = source.minutes;
  if (state.week === 0) {
    let added = 0, removed = 0;
    for (const task of student.tasks) {
      const delta = Number(isDone(task, student)) - Number(task.completed);
      if (!delta) continue;
      const subjectIndex = student.subjects.findIndex(subject => subject.id === task.subject);
      if (subjectIndex >= 0) subjectResults[subjectIndex] = Math.max(0, subjectResults[subjectIndex] + delta);
      minutes += delta * task.minutes;
      if (delta > 0) added += delta; else removed -= delta;
    }
    days[6] += added;
    for (let index = days.length - 1; index >= 0 && removed > 0; index--) {
      const amount = Math.min(days[index], removed);
      days[index] -= amount;
      removed -= amount;
    }
  }
  return { ...source, subjectResults, completed: days.reduce((total, value) => total + value, 0), days, activeDays: days.filter(Boolean).length, minutes: Math.max(0, minutes) };
}
function subjectFor(id, student = child()) { return student.subjects.find(subject => subject.id === id) || student.subjects[0]; }
function plural(number, words = ['задание', 'задания', 'заданий']) {
  const hundred = Math.abs(number) % 100, ten = hundred % 10;
  return hundred > 10 && hundred < 20 ? words[2] : ten === 1 ? words[0] : ten >= 2 && ten <= 4 ? words[1] : words[2];
}
function avatar(student, size = '') { return `<span class="student-avatar avatar-${esc(student.color)} ${esc(size)}" aria-hidden="true">${esc(student.initials)}</span>`; }
function button(text, action, className = 'button-primary', attributes = '', buttonIcon = '') {
  return `<button class="button ${className}" type="button" data-action="${action}" ${attributes}>${esc(text)}${buttonIcon ? icon(buttonIcon) : ''}</button>`;
}
function pageHeading(eyebrow, title, subtitle, action = '') {
  return `<header class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1 tabindex="-1">${title}</h1><p class="page-subtitle">${esc(subtitle)}</p></div>${action}</header>`;
}
function childSwitcher() {
  return `<section class="student-switcher" aria-label="Выбор ученика"><div class="switcher-label"><span class="tiny-label">СМОТРИМ ВМЕСТЕ</span><span>Профиль ученика</span></div><div class="student-options">${CHILDREN.map(student => `<button class="student-option ${state.childId === student.id ? 'selected' : ''}" data-action="child" data-child="${student.id}" type="button" aria-pressed="${state.childId === student.id}">${avatar(student)}<span><strong>${esc(student.name)}</strong><small>${student.grade} класс</small></span>${state.childId === student.id ? `<span class="selected-dot">${icon('check')}</span>` : ''}</button>`).join('')}</div></section>`;
}
function scenarioSwitcher() {
  return `<div class="scenario-control"><span class="scenario-label">Сценарий ${button('', 'info-scenario', 'icon-button tiny', 'aria-label="О сценариях демонстрации"', 'help')}</span><div class="segmented small" role="group" aria-label="Сценарий демонстрации"><button type="button" data-action="scenario" data-scenario="base" aria-pressed="${state.scenario === 'base'}" class="${state.scenario === 'base' ? 'active' : ''}">Базовый</button><button type="button" data-action="scenario" data-scenario="expanded" aria-pressed="${state.scenario === 'expanded'}" class="${state.scenario === 'expanded' ? 'active' : ''}">Расширенный</button></div></div>`;
}
function render() {
  const currentTitle = navItems.find(item => item[0] === state.view)?.[1] || 'Главная';
  app.innerHTML = `<div class="app-shell"><aside class="sidebar" aria-label="Основная навигация"><button class="brand" data-action="nav" data-view="home" type="button" aria-label="Foxel — на главную">${foxLogo()}<span><strong>фоксфорд</strong><small>FOXEL · ПРОТОТИП</small></span></button><div class="sidebar-caption">Семейный кабинет</div><nav class="desktop-nav">${navItems.map(([view, label, name]) => `<button class="nav-item ${state.view === view ? 'active' : ''}" data-action="nav" data-view="${view}" type="button" ${state.view === view ? 'aria-current="page"' : ''}>${icon(name)}<span>${label}</span>${view === 'tasks' ? `<span class="nav-counter">${visibleTasks().filter(task => !isDone(task)).length}</span>` : ''}</button>`).join('')}</nav><div class="sidebar-note"><span class="note-spark">${icon('sparkles')}</span><strong>Рядом с каждым<br>открытием</strong><p>Замечайте маленькие успехи.<br>Из них растёт уверенность.</p></div><button class="sidebar-profile" data-action="nav" data-view="profile" type="button"><span class="parent-avatar">АС</span><span><strong>Анна Соколова</strong><small>Демо-профиль родителя</small></span>${icon('chevron')}</button></aside><div class="workspace"><header class="topbar"><div class="mobile-brand">${foxLogo()}<strong>foxel</strong></div><span class="breadcrumb">Семейный кабинет <span>/</span> <strong>${currentTitle}</strong></span><div class="topbar-actions"><span class="demo-badge"><span></span>Демо · учебные данные</span><button class="icon-button" type="button" data-action="help" aria-label="О демонстрации">${icon('help')}</button></div></header><main id="main-content" class="main-content">${childSwitcher()}<div class="view-content">${renderView()}</div><footer class="page-footer"><span>Создано для любопытства ${icon('sparkles')}</span><span>Все имена и результаты вымышлены</span></footer></main></div><nav class="bottom-nav" aria-label="Мобильная навигация">${navItems.map(([view, label, name]) => `<button class="${state.view === view ? 'active' : ''}" type="button" data-action="nav" data-view="${view}" ${state.view === view ? 'aria-current="page"' : ''}>${icon(name)}<span>${label}</span></button>`).join('')}</nav></div>`;
  if (state.modal) renderModal();
}
function renderView() {
  switch (state.view) {
    case 'children': return renderChildren();
    case 'statistics': return renderStatistics();
    case 'tasks': return renderTasks();
    case 'achievements': return renderAchievements();
    case 'profile': return renderProfile();
    default: return renderHome();
  }
}
function metrics() {
  const student = child(), data = stats(), previous = student.weeks[Math.min(state.week + 1, 2)];
  const difference = data.completed - previous.completed;
  return `<section class="metric-grid" aria-label="Учебная статистика"><article class="metric-card"><div class="metric-top"><span class="metric-icon tint-orange">${icon('checklist')}</span><span class="metric-trend">${state.week < WEEKS.length - 1 ? `${difference >= 0 ? '+' : ''}${difference} к прошлой неделе` : 'Учебная неделя'}</span></div><strong class="metric-number">${data.completed}<span> ${plural(data.completed)}</span></strong><p>Решено за неделю</p></article><article class="metric-card"><div class="metric-top"><span class="metric-icon tint-green">${icon('flame')}</span>${button('', 'info-regularity', 'icon-button tiny', 'aria-label="Что значит регулярность занятий"', 'help')}</div><strong class="metric-number">${data.activeDays}<span> из 7 дней</span></strong><p>Занимались в своём ритме</p></article><article class="metric-card"><div class="metric-top"><span class="metric-icon tint-purple">${icon('target')}</span><span class="metric-note">Хорошая работа</span></div><strong class="metric-number">${data.accuracy}<span> %</span></strong><p>Правильных ответов</p></article></section>`;
}
function weekControls() {
  return `<div class="week-control" role="group" aria-label="Выбор учебной недели"><button class="icon-button" type="button" data-action="week" data-direction="previous" ${state.week >= WEEKS.length - 1 ? 'disabled' : ''} aria-label="Предыдущая неделя">${icon('chevronLeft')}</button><span>${WEEKS[state.week].label}</span><button class="icon-button" type="button" data-action="week" data-direction="next" ${state.week === 0 ? 'disabled' : ''} aria-label="Следующая неделя">${icon('chevron')}</button></div>`;
}
function weekChart() {
  const data = stats(), max = Math.max(...data.days, 10), labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return `<div class="week-chart"><svg viewBox="0 0 510 186" role="img" aria-label="Количество решённых заданий по дням: ${data.days.map((value, index) => `${labels[index]} ${value}`).join(', ')}"><path d="M15 145h480M15 92h480M15 39h480" stroke="#eeece6" stroke-dasharray="4 5"/>${data.days.map((value, index) => {
    const height = value / max * 106, x = 31 + index * 69;
    return `<rect x="${x}" y="28" width="35" height="117" rx="9" fill="#f5f3ed"/><rect x="${x}" y="${145 - Math.max(height, value ? 6 : 0)}" width="35" height="${Math.max(height, value ? 6 : 0)}" rx="9" fill="${index === 6 ? '#b9caa6' : '#f49a5d'}"/><text x="${x + 17.5}" y="${value ? 135 - height : 132}" text-anchor="middle" fill="#57574f" font-size="12" font-weight="600">${value || '—'}</text><text x="${x + 17.5}" y="172" text-anchor="middle" fill="#868780" font-size="12">${labels[index]}</text>`;
  }).join('')}</svg></div>`;
}
function progressPanel(compact = false) {
  return `<article class="panel rhythm-panel"><div class="panel-heading"><div><p class="tiny-label">${compact ? 'МАЛЕНЬКИЕ ШАГИ КАЖДЫЙ ДЕНЬ' : 'УЧИМСЯ В СВОЁМ РИТМЕ'}</p><h2>Ритм недели</h2></div>${weekControls()}</div>${weekChart()}<div class="chart-footer"><span><i class="legend-dot"></i> Решённые задания</span>${button('Подробнее', 'nav', 'text-button', 'data-view="statistics"', 'arrow')}</div></article>`;
}
function homeTaskCard(task) {
  const subject = subjectFor(task.subject), done = isDone(task);
  return `<button class="home-task ${done ? 'done' : ''}" type="button" data-action="open-task" data-task="${task.id}"><span class="subject-icon tint-${subject.color}">${icon(done ? 'check' : subject.icon)}</span><span class="home-task-text"><strong>${esc(task.title)}</strong><small>${esc(subject.name)} <span>·</span> ${task.minutes} мин</small></span>${icon('chevron')}</button>`;
}
function renderHome() {
  const student = child(), activeTasks = visibleTasks().filter(task => !isDone(task));
  return `${pageHeading('ДОБРО ПОЖАЛОВАТЬ, АННА', 'У каждого открытия<br>свой ритм.', 'Учёба, успехи и маленькие шаги вперёд — в одном месте.', scenarioSwitcher())}<section class="hero-card"><div class="hero-copy"><span class="hero-eyebrow">${esc(student.name)} · ${student.grade} класс</span><h2>Заметить успех.<br>Поддержать интерес.</h2><p>${esc(student.focus)}</p><div class="hero-actions">${button('Посмотреть прогресс', 'nav', 'button-dark', 'data-view="statistics"', 'arrow')}${button('Как это работает', 'help', 'hero-link')}</div></div><div class="hero-art">${foxIllustration()}<span class="art-label">Большое начинается<br>с любопытства</span></div></section>${metrics()}<div class="dashboard-grid">${progressPanel(true)}<article class="panel next-steps"><div class="panel-heading"><div><p class="tiny-label">БЕЗ СПЕШКИ, С ИНТЕРЕСОМ</p><h2>Следующий шаг</h2></div><span class="count-badge">${activeTasks.length}</span></div><div class="home-task-list">${(activeTasks.length ? activeTasks : visibleTasks()).slice(0, 3).map(homeTaskCard).join('')}</div>${button('Все задания', 'nav', 'text-button task-list-link', 'data-view="tasks"', 'arrow')}</article></div>${state.scenario === 'expanded' ? challengeCard() + courseSection() : `<section class="gentle-banner"><span class="gentle-icon">${icon('sparkles')}</span><div><h3>Немного внимания — много уверенности</h3><p>Обсудите с ребёнком, что сегодня получилось. Даже маленький успех стоит заметить.</p></div>${button('Идея для разговора', 'conversation', 'button-outline', '', 'arrow')}</section>`}`;
}
function challengeCard() {
  const done = Math.min(visibleTasks().filter(task => isDone(task)).length, 3);
  return `<section class="challenge-card"><span class="challenge-symbol">${icon('target')}</span><div class="challenge-copy"><span class="tiny-label">СЕМЕЙНАЯ МИССИЯ · РАСШИРЕННЫЙ СЦЕНАРИЙ</span><h2>Три шага к новому открытию</h2><p>Решите три тренировочных задания и отметьте успех вместе.</p><div class="challenge-progress"><progress value="${done}" max="3" aria-label="Прогресс семейной миссии">${done} из 3</progress><strong>${done}/3</strong></div></div>${button(done >= 3 ? 'Посмотреть награду' : 'Выбрать задание', 'nav', 'button-dark', `data-view="${done >= 3 ? 'achievements' : 'tasks'}"`, 'arrow')}</section>`;
}
function courseSection() {
  return `<section class="course-section"><div class="section-heading"><div><p class="tiny-label">ПОДДЕРЖИВАЕМ ЛЮБОПЫТСТВО</p><h2>Что ещё интересно ${esc(child().name === 'Лев' ? 'Льву' : 'Софье')}</h2></div><span class="subtle-pill">Демо-подборка</span></div><div class="course-grid">${COURSES.filter(course => course.child === state.childId).map(course => `<article class="course-card course-${course.color}"><span class="course-category">${esc(course.category)}</span><span class="course-orb">${icon(course.icon)}</span><h3>${esc(course.title)}</h3><p>${esc(course.subtitle)}</p><button type="button" class="text-button" data-action="course" data-course="${course.id}">О программе ${icon('arrow')}</button></article>`).join('')}</div></section>`;
}
function renderChildren() {
  return `${pageHeading('КАЖДОМУ — СВОЙ ПУТЬ', 'Два ученика.<br>Много открытий.', 'Выберите ребёнка, чтобы увидеть его занятия, прогресс и награды.', scenarioSwitcher())}<section class="children-grid">${CHILDREN.map(student => {
    const data = stats(student), selected = student.id === state.childId;
    return `<article class="child-card ${selected ? 'selected' : ''}"><div class="child-card-top">${avatar(student, 'large')}<span class="subtle-pill">${student.grade} класс</span></div><h2>${esc(student.fullName)}</h2><p>${esc(student.description)}</p><div class="child-card-metrics"><span><strong>${data.completed}</strong><small>заданий за неделю</small></span><span><strong>${data.accuracy}%</strong><small>правильных ответов</small></span></div><div class="child-subjects">${student.subjects.map(subject => `<span class="mini-subject tint-${subject.color}" title="${esc(subject.name)}">${icon(subject.icon)}</span>`).join('')}</div>${button(selected ? 'Открыть прогресс' : 'Выбрать и открыть', 'choose-child-progress', selected ? 'button-dark' : 'button-outline', `data-child="${student.id}"`, 'arrow')}</article>`;
  }).join('')}</section><section class="gentle-banner"><span class="gentle-icon">${icon('users')}</span><div><h3>Дети учатся по-разному</h3><p>Здесь у каждого свой профиль. Сравнивайте успехи ребёнка с его собственными прошлыми результатами.</p></div>${button('О демо-профилях', 'info-children', 'text-button', '', 'arrow')}</section>`;
}
function renderStatistics() {
  const student = child(), data = stats();
  return `${pageHeading('ПРОГРЕСС БЕЗ ЛИШНЕГО ДАВЛЕНИЯ', `Каждый шаг ${esc(student.name === 'Лев' ? 'Льва' : 'Софьи')}<br>имеет значение.`, `${WEEKS[state.week].long} · демонстрационная статистика`, scenarioSwitcher())}${metrics()}<div class="statistics-layout">${progressPanel()}<article class="panel learning-note"><span class="learning-note-icon tint-green">${icon('book')}</span><p class="tiny-label">ПОДСКАЗКА РОДИТЕЛЮ</p><h2>Обсудите путь,<br>а не только ответ</h2><p>Спросите: «Как ты до этого додумался?» Объяснение помогает лучше понять даже знакомую тему.</p><div class="study-time">${icon('clock')}<span><strong>${data.minutes} минут</strong><small>учёбы в этой неделе</small></span></div>${button('Попробовать задание', 'nav', 'button-outline', 'data-view="tasks"', 'arrow')}</article></div><section class="panel subject-panel"><div class="panel-heading"><div><p class="tiny-label">ЧТО ПОЛУЧАЕТСЯ УВЕРЕННЕЕ</p><h2>По предметам</h2></div><span class="subtle-pill">${WEEKS[state.week].label}</span></div><div class="subject-table"><div class="subject-table-heading"><span>Предмет</span><span>Решено заданий</span><span>Правильные ответы</span><span></span></div>${student.subjects.map((subject, index) => {
    const count = data.subjectResults[index];
    return `<div class="subject-row"><div class="subject-name"><span class="subject-icon tint-${subject.color}">${icon(subject.icon)}</span><strong>${esc(subject.name)}</strong></div><span class="subject-count">${Math.max(0, count)} <small>${plural(Math.max(0, count))}</small></span><div class="subject-progress"><progress class="progress-${subject.color}" value="${data.subjectAccuracy[index]}" max="100" aria-label="${esc(subject.name)}: ${data.subjectAccuracy[index]}% правильных ответов"></progress><strong>${data.subjectAccuracy[index]}%</strong></div><button type="button" class="icon-button subject-practice" data-action="subject-tasks" data-subject="${subject.id}" aria-label="Задания по предмету ${esc(subject.name)}">${icon('arrow')}</button></div>`;
  }).join('')}</div><p class="panel-footnote">Результаты вымышлены. Выполненные здесь задания добавляются к демо-прогрессу текущей недели.</p></section>`;
}
function renderTasks() {
  const tasks = visibleTasks(), done = tasks.filter(task => isDone(task)).length;
  return `${pageHeading('ОДНО НЕБОЛЬШОЕ ОТКРЫТИЕ ЗА РАЗ', 'Попробуем<br>что-нибудь новое?', 'Короткие тренировочные задания с понятными объяснениями.', scenarioSwitcher())}<section class="tasks-summary"><span class="summary-icon tint-green">${icon('checklist')}</span><div><strong>Выполнено ${done} из ${tasks.length} заданий</strong><p>Можно решить задание или отметить то, что уже сделано.</p></div><progress value="${done}" max="${tasks.length}" aria-label="Выполнено ${done} из ${tasks.length} заданий"></progress></section><section class="task-controls" aria-label="Фильтры заданий"><label class="search-field">${icon('search')}<input type="search" placeholder="Найти задание" aria-label="Поиск заданий" data-input="task-search" value="${esc(state.query)}" autocomplete="off"></label><label class="select-field"><span class="sr-only">Предмет</span><select data-input="task-subject" aria-label="Выбрать предмет"><option value="all" ${state.subject === 'all' ? 'selected' : ''}>Все предметы</option>${child().subjects.map(subject => `<option value="${subject.id}" ${state.subject === subject.id ? 'selected' : ''}>${esc(subject.name)}</option>`).join('')}</select></label><div class="segmented task-status" role="group" aria-label="Состояние заданий">${[['all','Все'],['active','К выполнению'],['done','Выполнены']].map(([value,label]) => `<button class="${state.taskStatus === value ? 'active' : ''}" type="button" data-action="task-status" data-status="${value}" aria-pressed="${state.taskStatus === value}">${label}</button>`).join('')}</div></section><div id="task-results" aria-live="polite">${taskResults()}</div>`;
}
function taskResults() {
  const query = state.query.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е');
  const tasks = visibleTasks().filter(task => {
    const done = isDone(task), subject = subjectFor(task.subject);
    return (state.subject === 'all' || state.subject === task.subject)
      && (state.taskStatus === 'all' || (state.taskStatus === 'done' ? done : !done))
      && (!query || `${task.title} ${task.description} ${subject.name}`.toLocaleLowerCase('ru').replace(/ё/g, 'е').includes(query));
  });
  if (!tasks.length) return `<div class="empty-state">${icon('search')}<h2>Здесь пока тихо</h2><p>По этим условиям заданий нет. Попробуйте другой предмет или очистите фильтры.</p>${button('Сбросить фильтры', 'reset-task-filters', 'button-outline')}</div>`;
  return `<div class="task-result-label">Найдено: ${tasks.length} ${plural(tasks.length)}</div><div class="task-grid">${tasks.map(task => {
    const subject = subjectFor(task.subject), done = isDone(task);
    return `<article class="task-card ${done ? 'completed' : ''}"><div class="task-card-top"><span class="subject-icon tint-${subject.color}">${icon(subject.icon)}</span><span class="task-state ${done ? 'is-done' : ''}">${done ? icon('check') + 'Выполнено' : task.expanded ? 'Новое в расширенном' : 'Тренировка'}</span></div><p class="task-subject">${esc(subject.name)}</p><h2>${esc(task.title)}</h2><p class="task-description">${esc(task.description)}</p><span class="task-duration">${icon('clock')}${task.minutes} минут · 1 вопрос</span><div class="task-card-actions">${button(done ? 'Открыть ещё раз' : 'Начать', 'open-task', done ? 'button-outline' : 'button-dark', `data-task="${task.id}"`, 'arrow')}<button class="task-check ${done ? 'checked' : ''}" data-action="toggle-task" data-task="${task.id}" type="button" aria-pressed="${done}" aria-label="${done ? 'Отметить невыполненным' : 'Отметить выполненным'}: ${esc(task.title)}" title="${done ? 'Отметить невыполненным' : 'Отметить выполненным'}">${icon('check')}</button></div></article>`;
  }).join('')}</div>`;
}
function achievements(student = child()) {
  const all = [...student.achievements];
  if (student.tasks.filter(task => isDone(task, student)).length >= 3) all.unshift({ id: 'family-mission', title: 'Три шага к открытию', category: 'study', label: 'Учёба', date: 'Получено в этой демонстрации', description: 'Три тренировочных задания уже выполнены', icon: 'sparkles', color: 'green' });
  return all;
}
function renderAchievements() {
  const all = achievements(), filtered = all.filter(item => state.achievementFilter === 'all' || item.category === state.achievementFilter);
  return `${pageHeading('ПОВОД ЗАМЕТИТЬ УСПЕХ', 'Собираем<br>маленькие победы.', `Портфолио ${child().name === 'Лев' ? 'Льва' : 'Софьи'} · ${all.length} ${plural(all.length, ['награда', 'награды', 'наград'])} в демонстрации`, scenarioSwitcher())}<section class="achievement-banner"><span class="achievement-big-icon">${icon('trophy')}</span><div><h2>Усилия достойны внимания</h2><p>Не только первые места. Новая привычка, сложная тема и смелая попытка тоже заслуживают награды.</p></div><span class="banner-sticker">${icon('star')} В своём темпе</span></section><div class="filter-chips" role="group" aria-label="Тип награды">${[['all','Все награды'],['study','Учёба'],['olympiad','Олимпиады'],['habit','Привычки']].map(([value,label]) => `<button type="button" class="filter-chip ${state.achievementFilter === value ? 'active' : ''}" data-action="achievement-filter" data-filter="${value}" aria-pressed="${state.achievementFilter === value}">${label}<span>${value === 'all' ? all.length : all.filter(item => item.category === value).length}</span></button>`).join('')}</div><section class="achievement-grid">${filtered.map(item => `<article class="achievement-card"><span class="reward-medal medal-${item.color}">${icon(item.icon)}</span><span class="reward-category">${esc(item.label)}</span><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><span class="reward-date">${esc(item.date)}</span><button class="text-button" type="button" data-action="download-reward" data-reward="${item.id}">${icon('download')} Скачать образец</button></article>`).join('')}</section><p class="download-note">${icon('info')}Скачивается демонстрационный диплом в формате SVG. Это образец, а не официальный документ.</p>`;
}
function maxStatusLabel() {
  if (!state.max.launchDetected) return 'Демонстрация в браузере';
  if (state.max.identityVerified) return 'Личность MAX подтверждена';
  if (state.max.sessionState === 'checking') return 'Открыто из MAX · проверяем запуск';
  return 'Запуск из MAX · демонстрационный режим';
}
function renderProfile() {
  return `${pageHeading('ВАШЕ СЕМЕЙНОЕ ПРОСТРАНСТВО', 'Рядом с учёбой.<br>Рядом с ребёнком.', 'Управление демонстрационным профилем и режимом приложения.', scenarioSwitcher())}<div class="profile-layout"><section class="panel parent-profile"><span class="parent-avatar big">АС</span><span class="subtle-pill">Родитель · демо</span><h2>${esc(DEMO_PARENT.name)}</h2><p>${esc(DEMO_PARENT.description)}</p><div class="profile-id">Демо-ID <strong>${DEMO_PARENT.demoId}</strong></div><div class="profile-family">${CHILDREN.map(student => `<button type="button" data-action="choose-child-progress" data-child="${student.id}">${avatar(student)}<span><strong>${esc(student.name)}</strong><small>${student.grade} класс</small></span>${icon('chevron')}</button>`).join('')}</div></section><div class="profile-main"><section class="panel connection-card"><div class="panel-heading"><span class="connection-icon tint-orange">${icon('link')}</span><span class="subtle-pill">Демо-привязка</span></div><h2>Один вход —<br>своя учебная история</h2><p>Так может выглядеть профиль Фоксфорда внутри MAX. Сейчас показаны вымышленные ученики и учебные результаты.</p><div class="connection-state"><span class="state-dot"></span><div><strong>Фоксфорд: демонстрационный профиль</strong><small>Реальный аккаунт не подключён</small></div>${icon('shield')}</div><div class="max-identity-state"><span class="max-glyph">M</span><div><strong>${esc(maxStatusLabel())}</strong><small>${state.max.identityVerified ? 'Подтверждение MAX не связывает аккаунт Фоксфорда' : 'Для просмотра демо вход не нужен'}</small></div></div>${button('Как связать профиль в будущем', 'info-linking', 'button-outline', '', 'arrow')}</section><section class="panel profile-options"><div class="option-row"><span class="option-icon">${icon('sparkles')}</span><div><h3>Сценарий приложения</h3><p>${state.scenario === 'expanded' ? 'Семейная миссия, дополнительные задания и подборки' : 'Прогресс, задания, награды и профили детей'}</p></div><button type="button" class="text-button" data-action="scenario" data-scenario="${state.scenario === 'base' ? 'expanded' : 'base'}">${state.scenario === 'base' ? 'Расширить' : 'Базовый'}${icon('arrow')}</button></div><div class="option-row"><span class="option-icon">${icon('refresh')}</span><div><h3>Начать демонстрацию заново</h3><p>Сбросить только выполненные здесь задания</p></div><button type="button" class="text-button" data-action="confirm-reset">Сбросить</button></div></section></div></div>`;
}

function openModal(kind, payload = {}) {
  state.returnFocus = document.activeElement;
  state.modal = { kind, ...payload };
  document.body.classList.add('modal-open');
  renderModal();
  requestAnimationFrame(() => dialogRoot.querySelector('[data-dialog-initial]')?.focus());
}
function closeModal() {
  state.modal = null;
  dialogRoot.innerHTML = '';
  document.body.classList.remove('modal-open');
  const oldFocus = state.returnFocus;
  state.returnFocus = null;
  if (oldFocus?.isConnected) oldFocus.focus();
  else app.querySelector('h1')?.focus({ preventScroll: true });
}
function renderModal() {
  if (!state.modal) return;
  const modal = state.modal;
  let content = '', title = '', type = 'info';
  if (modal.kind === 'task') {
    const task = child().tasks.find(item => item.id === modal.taskId);
    if (!task) return closeModal();
    const subject = subjectFor(task.subject);
    title = task.title; type = 'exercise';
    content = `<span class="dialog-eyebrow"><span class="subject-icon tint-${subject.color}">${icon(subject.icon)}</span>${esc(subject.name)} · ${task.minutes} мин · демо-задание</span><h2 id="dialog-title">${esc(task.title)}</h2><p class="exercise-question">${esc(task.question)}</p><div class="answer-options" role="group" aria-label="Варианты ответа">${task.options.map((answer, index) => `<button type="button" class="answer-option ${modal.answerIndex === index ? modal.correct ? 'correct' : 'incorrect' : ''} ${modal.correct && index === task.answer ? 'correct' : ''}" data-action="answer" data-index="${index}" ${modal.correct ? 'disabled' : ''}><span>${String.fromCharCode(1040 + index)}</span>${esc(answer)}${modal.correct && index === task.answer ? icon('check') : ''}</button>`).join('')}</div>${modal.answerIndex !== undefined ? `<div class="answer-feedback ${modal.correct ? 'success' : 'retry'}" role="status"><strong>${modal.correct ? 'Получилось! Отличный шаг вперёд.' : 'Почти. Давайте попробуем ещё раз.'}</strong><p>${modal.correct ? esc(task.explanation) : 'Не торопитесь: перечитайте вопрос и выберите другой вариант. Ошибаться в тренировке — нормально.'}</p></div>` : `<p class="exercise-hint">Выберите ответ. Если ошибётесь, можно попробовать ещё раз.</p>`}${modal.correct ? button('К заданиям', 'finish-exercise', 'button-dark dialog-wide', '', 'arrow') : ''}`;
  } else if (modal.kind === 'course') {
    const course = COURSES.find(item => item.id === modal.courseId);
    if (!course) return closeModal();
    title = course.title;
    content = `<span class="dialog-feature-icon tint-${course.color}">${icon(course.icon)}</span><p class="eyebrow">ДЕМОНСТРАЦИОННАЯ ПРОГРАММА</p><h2 id="dialog-title">${esc(course.title)}</h2><p class="dialog-lead">${esc(course.details)}</p><div class="dialog-note">${icon('book')}<span>${esc(course.format)}</span></div><p class="muted">Это пример карточки курса. Записи на занятия и оплаты в прототипе нет.</p>${button('Попробовать учебное задание', 'course-to-tasks', 'button-dark dialog-wide', '', 'arrow')}`;
  } else {
    const descriptions = {
      help: ['Пространство для маленьких открытий', 'Foxel — демонстрация семейного кабинета Фоксфорда для MAX. Здесь можно переключаться между учениками, смотреть три учебные недели, решать задания и скачивать образцы наград.', 'Все люди и результаты вымышлены. Прогресс тренировочных заданий сохраняется только в этом браузере. Реальный профиль Фоксфорда не подключён.'],
      scenario: ['Два сценария одного кабинета', 'Базовый показывает основное: учеников, прогресс, тренировочные задания, награды и профиль.', 'Расширенный добавляет семейную миссию, дополнительное задание и тематические подборки. Переключение помогает увидеть, как кабинет может меняться для разных пользователей.'],
      regularity: ['Важен удобный ритм', 'Здесь считается число дней с занятиями в выбранной учебной неделе. Короткие регулярные подходы часто удобнее одного длинного занятия.', 'Это вымышленные результаты. Правильные ответы и время занятий также используются только для демонстрации интерфейса.'],
      children: ['У каждого свой профиль', 'В демонстрации два вымышленных ученика: Лев из 3 класса и Софья из 7 класса. У них разные предметы, задания, результаты и награды.', 'Выбранный ученик сохраняется при переходах между разделами. Настоящие дети появились бы здесь после безопасного подключения родительского аккаунта.'],
      linking: ['Как работала бы настоящая привязка', 'Сначала приложение подтверждает, что пользователь пришёл из MAX. Затем родитель отдельно входит в свой аккаунт Фоксфорда и разрешает его связать.', 'Только после этого можно показывать доступные ему профили детей. В прототипе реальной привязки нет: данные MAX не превращаются в профиль Фоксфорда автоматически.'],
      conversation: ['«Какое открытие тебя удивило?»', 'Попробуйте начать с одного вопроса: «Что сегодня стало понятнее?» Не обязательно разбирать весь учебный день — достаточно одной небольшой истории.', 'Можно рассказать и о своём открытии. Так разговор об учёбе становится общей привычкой, а не проверкой.'],
      reset: ['Начать с чистого листа?', 'Сбросятся только отметки о выполнении тренировочных заданий в этой демонстрации. Учебная статистика вернётся к исходным вымышленным значениям.', 'Реальные аккаунты и данные Фоксфорда это действие не затрагивает.'],
    };
    const data = descriptions[modal.kind] || descriptions.help;
    title = data[0];
    content = `<span class="dialog-feature-icon tint-${modal.kind === 'reset' ? 'orange' : 'green'}">${icon(modal.kind === 'reset' ? 'refresh' : modal.kind === 'linking' ? 'shield' : 'sparkles')}</span><h2 id="dialog-title">${esc(data[0])}</h2><p class="dialog-lead">${esc(data[1])}</p><p class="muted">${esc(data[2])}</p><div class="dialog-actions">${modal.kind === 'reset' ? button('Сбросить демо-прогресс', 'reset-progress', 'button-dark') + button('Оставить как есть', 'close-modal', 'button-outline') : button('Понятно', 'close-modal', 'button-dark')}</div>`;
  }
  dialogRoot.innerHTML = `<div class="dialog-backdrop" data-action="dismiss-backdrop"><section class="dialog dialog-${type}" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1" aria-label="${esc(title)}"><button class="icon-button dialog-close" type="button" data-action="close-modal" data-dialog-initial aria-label="Закрыть окно">${icon('close')}</button>${content}</section></div>`;
}
function toast(message) {
  const element = document.querySelector('#toast');
  window.clearTimeout(toastTimer);
  element.textContent = message;
  element.classList.add('visible');
  toastTimer = window.setTimeout(() => element.classList.remove('visible'), 3600);
}
function navigate(view, focus = true) {
  state.view = navItems.some(item => item[0] === view) ? view : 'home';
  render();
  if (focus) {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    app.querySelector('h1')?.focus({ preventScroll: true });
  }
}
function downloadReward(id) {
  const reward = achievements().find(item => item.id === id);
  if (!reward) return;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#fcf8ef"/><rect x="28" y="28" width="1144" height="794" rx="24" fill="none" stroke="#eadbc5" stroke-width="2"/><path d="m535 97 42 21h46l42-21-9 64-56 44-56-44z" fill="#f47732"/><path d="m547 143 53 32 53-32-9 20-44 34-44-34z" fill="#fff5e7"/><text x="600" y="255" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" letter-spacing="4" fill="#817b6d">FOXEL · ДЕМОНСТРАЦИОННЫЙ ОБРАЗЕЦ</text><text x="600" y="345" text-anchor="middle" font-family="Arial,sans-serif" font-size="62" font-weight="700" fill="#2c302c">${esc(reward.category === 'olympiad' ? 'ДИПЛОМ УЧАСТНИКА' : 'ГРАМОТА')}</text><text x="600" y="418" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#76796e">Награждается</text><text x="600" y="478" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#2c302c">${esc(child().fullName)}</text><text x="600" y="541" text-anchor="middle" font-family="Arial,sans-serif" font-size="29" fill="#b75c2d">${esc(reward.title)}</text><text x="600" y="597" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#76796e">${esc(reward.date)}</text><path d="M390 660h420" stroke="#decfb9" stroke-width="2"/><text x="600" y="709" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#817b6d">Все имена и достижения вымышлены.</text><text x="600" y="743" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#817b6d">Не является официальным документом Фоксфорда.</text></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = `foxel-demo-${state.childId}-${reward.id}.svg`;
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Образец диплома скачивается в формате SVG.');
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  const action = target.dataset.action;
  if (action === 'dismiss-backdrop' && event.target !== target) return;
  switch (action) {
    case 'nav': navigate(target.dataset.view); break;
    case 'child':
      state.childId = target.dataset.child; state.subject = 'all'; state.query = ''; state.achievementFilter = 'all'; render();
      toast(`Теперь смотрим профиль: ${child().name}`); break;
    case 'choose-child-progress':
      state.childId = target.dataset.child; state.subject = 'all'; state.query = ''; navigate('statistics'); break;
    case 'scenario':
      state.scenario = target.dataset.scenario; render();
      toast(state.scenario === 'expanded' ? 'Открыт расширенный сценарий.' : 'Открыт базовый сценарий.'); break;
    case 'week':
      state.week = Math.max(0, Math.min(WEEKS.length - 1, state.week + (target.dataset.direction === 'previous' ? 1 : -1))); render(); break;
    case 'subject-tasks': state.subject = target.dataset.subject; state.taskStatus = 'all'; state.query = ''; navigate('tasks'); break;
    case 'task-status': state.taskStatus = target.dataset.status; render(); break;
    case 'reset-task-filters': state.query = ''; state.subject = 'all'; state.taskStatus = 'all'; render(); break;
    case 'toggle-task': {
      const task = child().tasks.find(item => item.id === target.dataset.task);
      if (!task) return;
      const done = !isDone(task); state.done[`${state.childId}:${task.id}`] = done; saveProgress(); render();
      app.querySelector(`[data-action="toggle-task"][data-task="${task.id}"]`)?.focus({ preventScroll: true });
      toast(done ? 'Готово! Маленький шаг добавлен к прогрессу.' : 'Задание снова ждёт своего открытия.'); break;
    }
    case 'open-task': openModal('task', { taskId: target.dataset.task }); break;
    case 'answer': {
      if (state.modal?.kind !== 'task') return;
      const task = child().tasks.find(item => item.id === state.modal.taskId);
      if (!task || state.modal.correct) return;
      state.modal.answerIndex = Number(target.dataset.index);
      state.modal.correct = state.modal.answerIndex === task.answer;
      if (state.modal.correct) { state.done[`${state.childId}:${task.id}`] = true; saveProgress(); render(); }
      else renderModal();
      dialogRoot.querySelector(state.modal.correct ? '[data-action="finish-exercise"]' : `[data-action="answer"][data-index="${state.modal.answerIndex}"]`)?.focus({ preventScroll: true });
      break;
    }
    case 'finish-exercise': closeModal(); navigate('tasks'); break;
    case 'achievement-filter': state.achievementFilter = target.dataset.filter; render(); break;
    case 'download-reward': downloadReward(target.dataset.reward); break;
    case 'course': openModal('course', { courseId: target.dataset.course }); break;
    case 'course-to-tasks': closeModal(); state.subject = 'all'; state.taskStatus = 'all'; state.query = ''; navigate('tasks'); break;
    case 'help': openModal('help'); break;
    case 'info-scenario': openModal('scenario'); break;
    case 'info-regularity': openModal('regularity'); break;
    case 'info-children': openModal('children'); break;
    case 'info-linking': openModal('linking'); break;
    case 'conversation': openModal('conversation'); break;
    case 'confirm-reset': openModal('reset'); break;
    case 'reset-progress': state.done = {}; saveProgress(); closeModal(); render(); toast('Демонстрационный прогресс сброшен.'); break;
    case 'close-modal': case 'dismiss-backdrop': closeModal(); break;
  }
});
document.addEventListener('input', event => {
  if (event.target.dataset.input === 'task-search') {
    state.query = event.target.value;
    document.querySelector('#task-results').innerHTML = taskResults();
  }
});
document.addEventListener('change', event => {
  if (event.target.dataset.input === 'task-subject') {
    state.subject = event.target.value;
    document.querySelector('#task-results').innerHTML = taskResults();
  }
});
document.addEventListener('keydown', event => {
  if (!state.modal) return;
  if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
  if (event.key !== 'Tab') return;
  const elements = [...dialogRoot.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]')];
  const first = elements[0], last = elements.at(-1);
  if (!first) return;
  if (event.shiftKey && (document.activeElement === first || !dialogRoot.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !dialogRoot.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
});

render();
initMaxBridge(context => { state.max = context; if (state.view === 'profile') render(); }).then(context => {
  state.max = context;
  if (state.view === 'profile') render();
});
