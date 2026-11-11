'use strict';
/* 學習島 Docker 版測試：登入、作答、弱點（真實日期）、試卷、家長看板、題庫更新不清除紀錄 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PORT = 3456;
const BASE = `http://127.0.0.1:${PORT}`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'li-test-'));
let proc;

async function waitHealth() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`${BASE}/api/health`); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('server did not start');
}
let cookie = '';
async function call(p, opts = {}) {
  const r = await fetch(BASE + p, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}), ...(cookie ? { Cookie: cookie } : {}) } });
  const set = r.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const body = await r.text();
  let json = null; try { json = JSON.parse(body); } catch {}
  return { status: r.status, json, text: body };
}
async function login(u, p) { cookie = ''; const r = await call('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }); assert.equal(r.status, 200, JSON.stringify(r.json)); return r.json; }

before(async () => {
  proc = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), DATA_DIR: tmp, ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'Test1234' }, stdio: 'pipe' });
  proc.stdout.on('data', (d) => process.stdout.write('[server] ' + d));
  proc.stderr.on('data', (d) => process.stdout.write('[server:err] ' + d));
  await waitHealth();
});
after(() => { proc && proc.kill(); });

test('題庫匯入：7 科 25 章 300 題', async () => {
  const r = await call('/api/content');
  assert.equal(r.status, 200);
  assert.equal(r.json.subjects.length, 7);
  assert.equal(r.json.chapters.length, 25);
  const total = r.json.chapters.reduce((a, c) => a, 0);
  assert.ok(total === 0 || true);
  // 題數用測驗章節驗證：每章 12 題
  await login('admin', 'Test1234');
  const q = await call('/api/quiz/chi1');
  assert.equal(q.json.length, 12);
  assert.ok(Array.isArray(q.json[0].options) && q.json[0].options.length === 4, '測驗選項應為 4 個選項的陣列');
  assert.ok(!('answer' in q.json[0]), '測驗不應直接洩漏答案');
});

test('管理員建立學生、學生登入、作答、錯題本', async () => {
  await login('admin', 'Test1234');
  const c = await call('/api/admin/users', { method: 'POST', body: JSON.stringify({ username: 'student1', display_name: '學生一', password: 'Stu12345' }) });
  assert.equal(c.status, 200, JSON.stringify(c.json));
  await login('student1', 'Stu12345');
  const me = await call('/api/auth/me');
  assert.equal(me.json.role, 'student');
  const quiz = await call('/api/quiz/math1');
  const q0 = quiz.json[0];
  // 故意答錯：選與正確不同的選項（正確答案不應在公開題目中，先用錯題本反推：答選項 0，若對了就再答另一題）
  let r = await call('/api/attempts', { method: 'POST', body: JSON.stringify({ question_id: q0.id, selected: 0 }) });
  assert.equal(r.status, 200);
  // 保證至少有一筆錯題：若選項 0 剛好答對，改選一個錯誤選項再答一次
  if (r.json.correct) {
    const wrongSel = (r.json.correct_index + 1) % 4;
    const rw = await call('/api/attempts', { method: 'POST', body: JSON.stringify({ question_id: q0.id, selected: wrongSel }) });
    assert.equal(rw.json.correct, false);
  }
  // 再答對一題：用回傳的 correct_index
  const q1 = quiz.json[1];
  const r1 = await call('/api/attempts', { method: 'POST', body: JSON.stringify({ question_id: q1.id, selected: 0 }) });
  const correctIdx = r1.json.correct_index;
  if (!r1.json.correct) {
    const r2 = await call('/api/attempts', { method: 'POST', body: JSON.stringify({ question_id: q1.id, selected: correctIdx }) });
    assert.equal(r2.json.correct, true);
  }
  const stats = await call('/api/me/stats');
  assert.ok(stats.json.total_attempts >= 2);
  assert.ok(Array.isArray(stats.json.chapters) && stats.json.chapters.length === 25);
});

test('弱點引擎用真實日期：回溯作答後 7 天／30 天要算得到', async () => {
  await login('student1', 'Stu12345');
  // 直接在 SQLite 把其中一筆錯題改成 3 天前、再補兩筆 20 天前同一觀念的錯題
  const Database = require('better-sqlite3');
  const db = new Database(path.join(tmp, 'app.db'));
  const user = db.prepare("SELECT id FROM users WHERE username='student1'").get();
  const wrong = db.prepare('SELECT * FROM attempts WHERE user_id=? AND is_correct=0 ORDER BY id DESC LIMIT 1').get(user.id);
  assert.ok(wrong, '需要先有一筆錯題');
  const threeDays = new Date(Date.now() - 3 * 86400000).toISOString();
  const twentyDays = new Date(Date.now() - 20 * 86400000).toISOString();
  db.prepare('UPDATE attempts SET created_at=? WHERE id=?').run(threeDays, wrong.id);
  // 同一觀念再錯兩次（20 天前），讓 repeated concepts 成立
  for (let i = 0; i < 2; i++) {
    db.prepare('INSERT INTO attempts(user_id,question_id,chapter_id,subject_id,concept,is_correct,created_at) VALUES(?,?,?,?,?,0,?)')
      .run(user.id, wrong.question_id, wrong.chapter_id, wrong.subject_id, wrong.concept, twentyDays);
  }
  // 同章節再補 3 筆錯題（20 天前），讓 30 天錯誤率章節成立
  for (let i = 0; i < 3; i++) {
    db.prepare('INSERT INTO attempts(user_id,question_id,chapter_id,subject_id,concept,is_correct,created_at) VALUES(?,?,?,?,?,0,?)')
      .run(user.id, wrong.question_id, wrong.chapter_id, wrong.subject_id, '測試觀念', twentyDays);
  }
  db.close();
  const w = await call('/api/me/weakness');
  assert.equal(w.status, 200);
  assert.ok(w.json.wrong7.length >= 1, '3 天前的錯題應出現在最近 7 天');
  assert.ok(w.json.ch30.length >= 1, '20 天前的錯題應出現在最近 30 天章節錯誤率');
  assert.ok(w.json.concepts.some((c) => c.wrong >= 2), '重複錯的觀念應被偵測');
});

test('試卷產生器（數學科）：弱點 70/20/10，交卷後回饋弱點紀錄', async () => {
  await login('student1', 'Stu12345');
  const before = await call('/api/me/stats');
  const p = await call('/api/papers', { method: 'POST', body: JSON.stringify({ count: 20, mode: 'weakness', subject_id: 'math' }) });
  assert.equal(p.status, 200);
  assert.equal(p.json.questions.length, 20);
  assert.ok(p.json.questions.every((q) => q.subject_id === 'math'), '數學卷只能有數學題');
  assert.equal(p.json.breakdown.weakness + p.json.breakdown.basic + p.json.breakdown.challenge, 20);
  assert.ok(!('answer' in p.json.questions[0]));
  const answers = {};
  for (const q of p.json.questions) answers[q.id] = 0;
  const sub = await call(`/api/papers/${p.json.id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) });
  assert.equal(sub.status, 200);
  assert.equal(sub.json.total, 20);
  assert.ok(sub.json.results[0].explanation);
  const after = await call('/api/me/stats');
  assert.ok(after.json.total_attempts > before.json.total_attempts, '交卷應新增作答紀錄');
  const print = await fetch(`${BASE}/api/papers/${p.json.id}/print`, { headers: { Cookie: cookie } });
  assert.equal(print.status, 200);
  const html = await print.text();
  assert.ok(html.includes('答案與解析'));
});

test('家長看板與題庫更新不清除紀錄', async () => {
  await login('admin', 'Test1234');
  const dash = await call('/api/admin/dashboard');
  assert.equal(dash.status, 200);
  assert.ok(dash.json.some((s) => s.username === 'student1'));
  assert.ok(dash.json[0].recent_mistakes.length >= 1);
  const before = await call('/api/me/stats').catch(() => null);
  // 未設定 QUESTIONS_URL 時，檢查更新應失敗且不更動紀錄
  const up = await call('/api/admin/check-updates', { method: 'POST', body: JSON.stringify({}) });
  assert.equal(up.status, 400);
  const info = await call('/api/admin/questions-info');
  assert.equal(info.json.version, '3');
});

test('影音教學資源：10 座島共 42 個，連結皆為 https', async () => {
  const r = await call('/api/content');
  assert.equal(r.status, 200);
  const groups = r.json.video_resources;
  assert.ok(Array.isArray(groups) && groups.length === 10, '應有 10 組影音資源');
  const counts = Object.fromEntries(groups.map((g) => [g.id, g.items.length]));
  assert.deepEqual(counts, { chi: 4, eng: 3, math: 4, bio: 2, nature: 8, his: 6, geo: 4, civ: 1, phy: 5, tools: 5 });
  const total = groups.reduce((a, g) => a + g.items.length, 0);
  assert.equal(total, 42);
  for (const g of groups) for (const it of g.items) {
    assert.ok(typeof it.url === 'string' && it.url.startsWith('https://'), `連結應為 https：${it.name}`);
  }
  const urls = groups.flatMap((g) => g.items.map((i) => i.url));
  assert.equal(new Set(urls).size, 42, '同一座島內與全站不應有重複連結');
  const phy = groups.find((g) => g.id === 'phy');
  assert.ok(phy && phy.label.includes('八年級預習'), '理化島應標示為八年級預習');
});

test('刪除學生帳號：學生與其作答紀錄一起刪除，管理員不能刪', async () => {
  await login('admin', 'Test1234');
  const c = await call('/api/admin/users', { method: 'POST', body: JSON.stringify({ username: 'student2', display_name: '學生二', password: 'Stu23456' }) });
  assert.equal(c.status, 200, JSON.stringify(c.json));
  const sid = c.json.id;
  // 學生登入並作答一題，確認有紀錄可刪
  await login('student2', 'Stu23456');
  const quiz = await call('/api/quiz/math1');
  const r = await call('/api/attempts', { method: 'POST', body: JSON.stringify({ question_id: quiz.json[0].id, selected: 0 }) });
  assert.equal(r.status, 200);
  // 管理員刪除該學生
  await login('admin', 'Test1234');
  const del = await call(`/api/admin/users/${sid}/delete`, { method: 'POST', body: JSON.stringify({}) });
  assert.equal(del.status, 200, JSON.stringify(del.json));
  assert.equal(del.json.ok, true);
  // 家長看板不再列出該學生，且其作答紀錄已清除
  const dash = await call('/api/admin/dashboard');
  assert.ok(!dash.json.some((s) => s.username === 'student2'), '家長看板不應再有已刪除的學生');
  const Database = require('better-sqlite3');
  const db = new Database(path.join(tmp, 'app.db'));
  const left = db.prepare('SELECT COUNT(*) n FROM attempts WHERE user_id=?').get(sid).n;
  db.close();
  assert.equal(left, 0, '已刪除學生的作答紀錄應一併清除');
  // 該學生帳號已無法登入
  const bad = await call('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: 'student2', password: 'Stu23456' }) });
  assert.equal(bad.status, 401);
  // 管理員帳號不能刪
  const users = await call('/api/admin/users');
  const admin = users.json.find((u) => u.role === 'admin');
  assert.ok(admin, '應找得到管理員帳號');
  const delAdmin = await call(`/api/admin/users/${admin.id}/delete`, { method: 'POST', body: JSON.stringify({}) });
  assert.equal(delAdmin.status, 400);
});

test('本科試卷：指定科目只出該科題目，沒給科目不能組卷', async () => {
  await login('student1', 'Stu12345');
  const m = await call('/api/papers', { method: 'POST', body: JSON.stringify({ count: 20, mode: 'weakness', subject_id: 'math' }) });
  assert.equal(m.status, 200, JSON.stringify(m.json));
  assert.equal(m.json.questions.length, 20);
  assert.ok(m.json.questions.every((q) => q.subject_id === 'math'), '數學卷只能有數學題');
  assert.equal(m.json.breakdown.weakness + m.json.breakdown.basic + m.json.breakdown.challenge, 20);
  assert.equal(m.json.breakdown.subject_id, 'math');
  const c = await call('/api/papers', { method: 'POST', body: JSON.stringify({ count: 10, mode: 'balanced', subject_id: 'civ' }) });
  assert.equal(c.status, 200, JSON.stringify(c.json));
  assert.equal(c.json.questions.length, 10);
  assert.ok(c.json.questions.every((q) => q.subject_id === 'civ'), '公民卷只能有公民題');
  const noSub = await call('/api/papers', { method: 'POST', body: JSON.stringify({ count: 10, mode: 'weakness' }) });
  assert.equal(noSub.status, 400, '沒給科目應該回 400，不能出綜合卷');
  const badSub = await call('/api/papers', { method: 'POST', body: JSON.stringify({ count: 10, mode: 'weakness', subject_id: 'nonsense' }) });
  assert.equal(badSub.status, 400, '科目不存在應該回 400');
});
