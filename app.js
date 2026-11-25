'use strict';

const copy = {
  zh: {
    brand: '项目工作台', heading: '项目总览', subtitle: '在一个工作台跟进个人项目、待办和风险。',
    add: '＋ 新增项目', projects: '项目进度', tasks: '待办事项', risks: '风险管理', updates: '更新记录',
    search: '关键词搜索', placeholder: '搜索项目、说明或条目', status: '状态', priority: '优先级',
    all: '全部', planned: '未开始', active: '进行中', done: '已完成', low: '低', normal: '中', high: '高',
    open: '待处理', resolved: '已解决', created: '新增项目', edited: '编辑项目', deleted: '删除项目',
    total: '项目总数', pending: '待办未完成', exposed: '未解决风险', name: '项目名称', description: '项目说明',
    progress: '进度 (%)', due: '截止日期', taskInput: '待办（每行一项）', riskInput: '风险（每行一项）',
    cancel: '取消', save: '保存项目', edit: '编辑项目', delete: '删除项目', empty: '没有符合条件的记录。',
    count: n => n + ' 条记录', remove: name => '确定删除「' + name + '」及其待办和风险？更新记录将保留。',
    unnamed: '请输入项目名称。', storage: '浏览器无法保存数据，修改仅在本次页面打开期间有效。',
    saved: '项目已保存。', removed: '项目已删除。', completed: '标记完成', reopen: '重新打开', resolve: '标记解决',
    changed: '状态已更新。', seeded: '建立示例项目'
  },
  ja: {
    brand: 'プロジェクト管理', heading: 'プロジェクト概要', subtitle: '個人のプロジェクト、タスク、リスクをまとめて管理。',
    add: '＋ プロジェクトを追加', projects: '進捗管理', tasks: 'タスク', risks: 'リスク管理', updates: '更新履歴',
    search: 'キーワード検索', placeholder: 'プロジェクト名・説明・項目を検索', status: 'ステータス', priority: '優先度',
    all: 'すべて', planned: '未着手', active: '進行中', done: '完了', low: '低', normal: '中', high: '高',
    open: '未対応', resolved: '解決済み', created: 'プロジェクト追加', edited: 'プロジェクト編集', deleted: 'プロジェクト削除',
    total: 'プロジェクト総数', pending: '未完了タスク', exposed: '未解決リスク', name: 'プロジェクト名', description: '説明',
    progress: '進捗 (%)', due: '期限', taskInput: 'タスク（1 行につき 1 件）', riskInput: 'リスク（1 行につき 1 件）',
    cancel: 'キャンセル', save: '保存', edit: '編集', delete: '削除', empty: '条件に一致する項目がありません。',
    count: n => n + ' 件', remove: name => '「' + name + '」と関連するタスク・リスクを削除しますか？更新履歴は残ります。',
    unnamed: 'プロジェクト名を入力してください。', storage: 'ブラウザーに保存できません。変更はこのページを開いている間だけ有効です。',
    saved: 'プロジェクトを保存しました。', removed: 'プロジェクトを削除しました。', completed: '完了にする', reopen: '再開する', resolve: '解決済みにする',
    changed: 'ステータスを更新しました。', seeded: 'サンプルプロジェクト作成'
  }
};

const sample = [
  { id: 'atlas', name: { zh: '个人作品集改版', ja: 'ポートフォリオ刷新' },
    description: { zh: '整理项目案例，优化移动端作品展示。', ja: '制作事例を整理し、モバイルでの表示を改善する。' },
    status: 'active', priority: 'high', progress: 65, due: '2026-12-10',
    tasks: [{ text: { zh: '整理案例截图', ja: '制作事例の画像を整理' }, done: true }, { text: { zh: '检查移动端布局', ja: 'モバイル表示を確認' }, done: false }],
    risks: [{ text: { zh: '历史截图可能缺失', ja: '過去のスクリーンショットが不足する可能性' }, done: false }] },
  { id: 'notes', name: { zh: '双语阅读笔记', ja: 'バイリンガル読書ノート' },
    description: { zh: '搭建中日双语的阅读笔记模板。', ja: '中国語と日本語の読書ノート用テンプレートを作る。' },
    status: 'planned', priority: 'normal', progress: 15, due: '2026-12-18',
    tasks: [{ text: { zh: '确定笔记分类', ja: 'ノートの分類を決める' }, done: false }],
    risks: [{ text: { zh: '术语译法可能不统一', ja: '用語の訳し方が統一されない可能性' }, done: false }] },
  { id: 'photos', name: { zh: '旅行照片归档', ja: '旅行写真の整理' },
    description: { zh: '按日期和地点整理练习用照片。', ja: '練習用の写真を日付と場所で整理する。' },
    status: 'done', priority: 'low', progress: 100, due: '2026-11-20',
    tasks: [{ text: { zh: '备份精选照片', ja: '選んだ写真をバックアップ' }, done: true }], risks: [] }
];

const key = 'personal-project-desk-v1';
const statuses = {
  projects: ['planned', 'active', 'done'],
  tasks: ['open', 'done'],
  risks: ['open', 'resolved'],
  updates: ['created', 'edited', 'deleted']
};
const priorities = ['high', 'normal', 'low'];
const get = id => document.getElementById(id);
const editor = get('editor');
const form = get('project-form');
const remove = get('remove');
const controls = form.elements;
let storageFailed = false;
let state = {
  lang: 'zh',
  projects: sample,
  updates: sample.map(project => ({
    name: project.name, priority: project.priority, status: 'created',
    detail: 'seeded', date: '2026-11-18T00:00:00.000Z'
  }))
};
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && Array.isArray(saved.projects) && Array.isArray(saved.updates) && Object.hasOwn(copy, saved.lang)) {
    state = saved;
  }
} catch {
  storageFailed = true;
}
let view = 'projects';
let editingId = null;
let deletingId = null;
let notice = '';

const t = key => copy[state.lang][key];
const local = value => typeof value === 'string' ? value : value[state.lang];
const locale = () => state.lang === 'zh' ? 'zh-CN' : 'ja-JP';
const date = value => new Intl.DateTimeFormat(locale(), { timeZone: 'Asia/Tokyo' }).format(
  new Date(value.length === 10 ? value + 'T00:00:00+09:00' : value)
);

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function options(select, values, includeAll = false) {
  const previous = select.value;
  select.replaceChildren(...(includeAll ? ['all', ...values] : values).map(value => {
    const option = node('option', t(value));
    option.value = value;
    return option;
  }));
  if (Array.from(select.options).some(option => option.value === previous)) select.value = previous;
}

function persist(message = '') {
  notice = message;
  try {
    localStorage.setItem(key, JSON.stringify(state));
    storageFailed = false;
  } catch {
    storageFailed = true;
  }
  render();
}

function items() {
  if (view === 'projects' || view === 'updates') return state[view];
  return state.projects.flatMap(project => project[view].map((item, index) => ({
    name: item.text, project, index, priority: project.priority,
    status: item.done ? (view === 'tasks' ? 'done' : 'resolved') : 'open'
  })));
}

function matches(item) {
  const statusFilter = get('status').value;
  const priorityFilter = get('priority').value;
  const query = get('search').value.trim().normalize('NFKC').toLocaleLowerCase(locale());
  const fields = [item.name, item.description, item.project?.name, item.detail && t(item.detail), t(item.status), t(item.priority)];
  const haystack = fields.filter(Boolean).flatMap(value =>
    typeof value === 'string' ? [value] : Object.values(value)
  ).join(' ').normalize('NFKC').toLocaleLowerCase(locale());
  return (statusFilter === 'all' || item.status === statusFilter) &&
    (priorityFilter === 'all' || item.priority === priorityFilter) &&
    query.split(/\s+/).every(word => haystack.includes(word));
}

function button(label, handler, className) {
  const control = node('button', t(label), className);
  control.type = 'button';
  control.addEventListener('click', handler);
  return control;
}

function log(project, status, detail) {
  state.updates.unshift({ name: project.name, priority: project.priority, status, detail, date: new Date().toISOString() });
}

function cardFor(item) {
  const card = node('article', undefined, 'card');
  const badges = node('div', undefined, 'badges');
  badges.append(node('span', t(item.status), 'badge ' + item.status), node('span', t('priority') + ' · ' + t(item.priority), 'badge ' + item.priority));
  card.append(badges, node('h3', local(item.name)));
  if (view === 'projects') {
    if (item.description) card.append(node('p', local(item.description), 'muted'));
    const progress = node('progress');
    progress.max = 100;
    progress.value = item.progress;
    progress.setAttribute('aria-label', t('progress'));
    card.append(node('p', item.progress + '%' + (item.due ? ' · ' + t('due') + ' ' + date(item.due) : ''), 'muted'), progress);
    const actions = node('div', undefined, 'actions');
    actions.append(button('edit', () => openEditor(item)), button('delete', () => {
      deletingId = item.id;
      get('remove-message').textContent = t('remove')(local(item.name));
      remove.showModal();
    }, 'delete'));
    card.append(actions);
  } else if (view === 'updates') {
    card.append(node('p', date(item.date) + (item.detail ? ' · ' + t(item.detail) : ''), 'muted'));
  } else {
    card.append(node('p', local(item.project.name), 'muted'));
    const actions = node('div', undefined, 'actions');
    const group = view;
    actions.append(button(item.status === 'open' ? (group === 'tasks' ? 'completed' : 'resolve') : 'reopen', () => {
      const entry = item.project[group][item.index];
      entry.done = !entry.done;
      log(item.project, 'edited', group);
      persist('changed');
    }));
    card.append(actions);
  }
  return card;
}

function render() {
  document.documentElement.lang = locale();
  document.title = t('brand');
  document.querySelectorAll('[data-i]').forEach(element => { element.textContent = t(element.dataset.i); });
  document.querySelectorAll('[data-lang]').forEach(element => element.setAttribute('aria-pressed', element.dataset.lang === state.lang));
  document.querySelectorAll('[data-view]').forEach(element => element.setAttribute('aria-current', element.dataset.view === view));
  get('search').placeholder = t('placeholder');
  options(get('status'), statuses[view], true);
  options(get('priority'), priorities, true);
  const stats = [
    ['total', state.projects.length],
    ['active', state.projects.filter(project => project.status === 'active').length],
    ['pending', state.projects.reduce((sum, project) => sum + project.tasks.filter(item => !item.done).length, 0)],
    ['exposed', state.projects.reduce((sum, project) => sum + project.risks.filter(item => !item.done).length, 0)]
  ];
  get('stats').replaceChildren(...stats.map(([label, count]) => {
    const stat = node('div', undefined, 'stat');
    stat.append(node('span', t(label)), node('strong', count));
    return stat;
  }));
  get('section-title').textContent = t(view);
  const filtered = items().filter(matches);
  get('count').textContent = t('count')(filtered.length);
  const results = get('results');
  results.classList.toggle('project-grid', view === 'projects');
  results.replaceChildren(...(filtered.length ? filtered.map(cardFor) : [node('p', t('empty'), 'empty')]));
  get('notice').textContent = storageFailed ? t('storage') : (notice && t(notice));
}

function openEditor(project) {
  editingId = project?.id ?? null;
  get('editor-title').textContent = t(project ? 'edit' : 'add');
  options(controls.status, statuses.projects);
  options(controls.priority, priorities);
  controls.name.setCustomValidity('');
  controls.name.value = project ? local(project.name) : '';
  controls.description.value = project ? local(project.description) : '';
  controls.status.value = project?.status ?? 'planned';
  controls.priority.value = project?.priority ?? 'normal';
  controls.progress.value = project?.progress ?? 0;
  controls.due.value = project?.due ?? '';
  for (const group of ['tasks', 'risks']) {
    controls[group].value = project ? project[group].map(item => local(item.text)).join('\n') : '';
  }
  editor.showModal();
  controls.name.focus();
}

function keepTranslation(value, previous) {
  return previous && value === local(previous) ? previous : value;
}

function readLines(value, existing) {
  const remaining = [...existing];
  return value.split('\n').map(line => line.trim()).filter(Boolean).map(text => {
    const index = remaining.findIndex(item => local(item.text) === text);
    return index < 0 ? { text, done: false } : remaining.splice(index, 1)[0];
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = controls.name.value.trim();
  if (!name) {
    controls.name.setCustomValidity(t('unnamed'));
    controls.name.reportValidity();
    return;
  }
  const index = state.projects.findIndex(project => project.id === editingId);
  const previous = state.projects[index];
  const project = {
    id: previous?.id ?? (crypto.randomUUID?.() ?? Date.now() + '-' + Math.random()),
    name: keepTranslation(name, previous?.name),
    description: keepTranslation(controls.description.value.trim(), previous?.description),
    status: controls.status.value,
    priority: controls.priority.value,
    progress: controls.progress.valueAsNumber,
    due: controls.due.value,
    tasks: readLines(controls.tasks.value, previous?.tasks ?? []),
    risks: readLines(controls.risks.value, previous?.risks ?? [])
  };
  if (previous) state.projects[index] = project;
  else {
    state.projects.unshift(project);
    view = 'projects';
    for (const id of ['search', 'status', 'priority']) get(id).value = id === 'search' ? '' : 'all';
  }
  log(project, previous ? 'edited' : 'created');
  editor.close();
  persist('saved');
});
controls.name.addEventListener('input', () => controls.name.setCustomValidity(''));
get('add').addEventListener('click', () => openEditor());
get('confirm-remove').addEventListener('click', () => {
  const project = state.projects.find(item => item.id === deletingId);
  if (!project) return;
  state.projects = state.projects.filter(item => item !== project);
  log(project, 'deleted');
  remove.close();
  persist('removed');
});
document.querySelectorAll('[data-close]').forEach(control => control.addEventListener('click', () => control.closest('dialog').close()));
document.querySelectorAll('[data-lang]').forEach(control => control.addEventListener('click', () => {
  state.lang = control.dataset.lang;
  persist(notice);
}));
document.querySelectorAll('[data-view]').forEach(control => control.addEventListener('click', () => {
  if (view !== control.dataset.view) get('status').value = 'all';
  view = control.dataset.view;
  render();
}));
get('search').addEventListener('input', render);
get('status').addEventListener('change', render);
get('priority').addEventListener('change', render);
render();
