'use strict';
/**
 * 學習島 NAS Docker 版 — Node.js + Express + SQLite（單一容器）
 * 題目與講義只存在 data/questions.json；學生作答紀錄只存在 SQLite。
 * 啟動時匯入題庫不會清除任何作答紀錄；題庫更新亦同。
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || process.env.DATA_PATH || '/data';
const QUESTIONS_PATH = process.env.QUESTIONS_PATH || path.join(__dirname, 'data', 'questions.json');
const QUESTIONS_URL = (process.env.QUESTIONS_URL || '').trim();
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_DAYS = 30;

function ensureDataDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); return DATA_DIR; }
  catch (e) {
    const fallback = path.join(__dirname, '.local-data');
    fs.mkdirSync(fallback, { recursive: true });
    console.warn(`[warn] 無法建立 ${DATA_DIR}，改用 ${fallback}：${e.message}`);
    return fallback;
  }
}
const dataDir = ensureDataDir();
const DB_PATH = path.join(dataDir, 'app.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','student')),
  display_name TEXT NOT NULL DEFAULT '',
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  stem TEXT NOT NULL,
  options TEXT NOT NULL,
  answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  concept TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'basic',
  exam_focus INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  concept TEXT NOT NULL DEFAULT '',
  is_correct INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_user_time ON attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_user_chapter ON attempts(user_id, chapter_id);
CREATE TABLE IF NOT EXISTS papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT NOT NULL,
  question_ids TEXT NOT NULL,
  breakdown TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

const nowIso = () => new Date().toISOString();
const daysAgoIso = (n) => new Date(Date.now() - n * 86400000).toISOString();
const getMeta = (k) => { const r = db.prepare('SELECT value FROM meta WHERE key=?').get(k); return r ? r.value : null; };
const setMeta = (k, v) => db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, String(v));

// ---------- 題庫匯入（只新增／更新題目，絕不刪除 attempts） ----------
function validateQuestionsDoc(doc) {
  if (!doc || typeof doc !== 'object') throw new Error('題庫不是 JSON 物件');
  if (!Array.isArray(doc.subjects) || !Array.isArray(doc.chapters) || !Array.isArray(doc.questions)) {
    throw new Error('題庫缺少 subjects / chapters / questions 陣列');
  }
  for (const q of doc.questions) {
    if (!q.id || !q.subject_id || !q.chapter_id || !q.stem || !Array.isArray(q.options) || q.options.length !== 4
      || typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3 || !q.explanation) {
      throw new Error(`題目格式錯誤：${JSON.stringify(q && q.id)}`);
    }
  }
  if (doc.video_resources !== undefined) {
    if (!Array.isArray(doc.video_resources)) throw new Error('video_resources 應為陣列');
    for (const g of doc.video_resources) {
      if (!g.id || !g.title || !Array.isArray(g.items)) throw new Error(`影音資源群組格式錯誤：${JSON.stringify(g && g.id)}`);
      for (const it of g.items) {
        if (!it.name || typeof it.url !== 'string' || !it.url.startsWith('https://')) {
          throw new Error(`影音資源格式錯誤：${JSON.stringify(it && it.name)}`);
        }
      }
    }
  }
  return doc;
}
function importQuestionsDoc(doc) {
  validateQuestionsDoc(doc);
  const upsert = db.prepare(`INSERT INTO questions(id,subject_id,chapter_id,stem,options,answer,explanation,concept,difficulty,exam_focus,version)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET subject_id=excluded.subject_id, chapter_id=excluded.chapter_id,
    stem=excluded.stem, options=excluded.options, answer=excluded.answer, explanation=excluded.explanation,
    concept=excluded.concept, difficulty=excluded.difficulty, exam_focus=excluded.exam_focus, version=excluded.version`);
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM questions').run();
    for (const q of doc.questions) {
      upsert.run(q.id, q.subject_id, q.chapter_id, q.stem, JSON.stringify(q.options), q.answer, q.explanation,
        q.concept || '', q.difficulty || 'basic', q.exam_focus ? 1 : 0, doc.version || 1);
    }
    setMeta('questions_version', String(doc.version || 1));
    setMeta('questions_doc', JSON.stringify({ subjects: doc.subjects, chapters: doc.chapters, resources: doc.resources || [], video_resources: doc.video_resources || [] }));
    setMeta('questions_imported_at', nowIso());
  });
  tx();
  return { version: doc.version || 1, subjects: doc.subjects.length, chapters: doc.chapters.length, questions: doc.questions.length };
}
function loadQuestionsFile() {
  const raw = fs.readFileSync(QUESTIONS_PATH, 'utf8');
  return importQuestionsDoc(JSON.parse(raw));
}
function getQuestionsDoc() {
  const raw = getMeta('questions_doc');
  if (raw) return JSON.parse(raw);
  return { subjects: [], chapters: [], resources: [], video_resources: [] };
}
function allQuestions() {
  return db.prepare('SELECT * FROM questions ORDER BY subject_id, chapter_id, id').all()
    .map((q) => ({ ...q, options: JSON.parse(q.options), exam_focus: !!q.exam_focus }));
}
function publicQuestion(q) {
  const { answer, explanation, ...rest } = q;
  return { ...rest, options: q.options };
}

// ---------- 帳號 ----------
function ensureAdmin() {
  const existing = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
  if (existing) return;
  const password = ADMIN_PASSWORD || 'changeme123';
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO users(username,password_hash,role,display_name,must_change_password,created_at) VALUES(?,?,?,?,1,?)")
    .run(ADMIN_USERNAME, hash, 'admin', '家長（管理員）', nowIso());
  if (!ADMIN_PASSWORD) {
    console.warn(`[warn] 已建立預設管理員 ${ADMIN_USERNAME}，密碼為 changeme123，請第一次登入後立即更改！`);
  } else {
    console.log(`[info] 已建立管理員 ${ADMIN_USERNAME}，請登入後更改密碼。`);
  }
}

// ---------- 驗證 ----------
function hashToken(t) { return crypto.createHash('sha256').update(t).digest('hex'); }
function authUser(req) {
  const raw = req.headers.cookie || '';
  const m = raw.match(/(?:^|;\s*)li_session=([^;]+)/);
  if (!m) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token_hash=?').get(hashToken(decodeURIComponent(m[1])));
  if (!s || new Date(s.expires_at) < new Date()) return null;
  const u = db.prepare('SELECT id, username, role, display_name, must_change_password FROM users WHERE id=?').get(s.user_id);
  return u || null;
}
function requireAuth(req, res, next) { const u = authUser(req); if (!u) return res.status(401).json({ error: '請先登入' }); req.user = u; next(); }
function requireAdmin(req, res, next) { if (req.user.role !== 'admin') return res.status(403).json({ error: '需要管理員權限' }); next(); }
function setSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').run(hashToken(token), userId, expires, nowIso());
  res.setHeader('Set-Cookie', `li_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`);
}
function clearSession(req, res) {
  const raw = req.headers.cookie || '';
  const m = raw.match(/(?:^|;\s*)li_session=([^;]+)/);
  if (m) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(decodeURIComponent(m[1])));
  res.setHeader('Set-Cookie', 'li_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}

// ---------- 弱點引擎（用真實日期） ----------
function weaknessFor(userId) {
  const since7 = daysAgoIso(7), since30 = daysAgoIso(30);
  const wrong7 = db.prepare(`SELECT question_id, chapter_id, subject_id, concept, MAX(created_at) AS last_at, COUNT(*) AS n
    FROM attempts WHERE user_id=? AND is_correct=0 AND created_at>=? GROUP BY question_id ORDER BY last_at DESC`).all(userId, since7);
  const ch30 = db.prepare(`SELECT chapter_id, subject_id, COUNT(*) AS total, SUM(CASE WHEN is_correct=0 THEN 1 ELSE 0 END) AS wrong
    FROM attempts WHERE user_id=? AND created_at>=? GROUP BY chapter_id HAVING total>=3 ORDER BY CAST(wrong AS REAL)/total DESC`).all(userId, since30)
    .map((r) => ({ ...r, rate: r.total ? r.wrong / r.total : 0 }));
  const concepts = db.prepare(`SELECT concept, COUNT(*) AS wrong, MAX(created_at) AS last_at
    FROM attempts WHERE user_id=? AND is_correct=0 AND created_at>=? AND concept!='' GROUP BY concept HAVING wrong>=2 ORDER BY wrong DESC, last_at DESC`).all(userId, since30);
  const examChapters = getQuestionsDoc().chapters.filter((c) => c.exam_focus).map((c) => c.id);
  return { wrong7, ch30, concepts, examChapters, since7, since30 };
}
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function buildPaper(userId, count, mode, subjectId) {
  // 本科試卷：先把題庫縮到該科，再挑題，絕不混科
  const all = allQuestions().filter((q) => q.subject_id === subjectId);
  const byId = new Map(all.map((q) => [q.id, q]));
  const w = weaknessFor(userId);
  // 弱點統計也只看本科：錯題、章節錯誤率、重複觀念都先過濾
  const wrong7 = w.wrong7.filter((r) => byId.has(r.question_id));
  const ch30 = w.ch30.filter((c) => all.some((q) => q.chapter_id === c.chapter_id));
  const concepts = w.concepts.filter((c) => all.some((q) => q.concept === c.concept));
  const picked = [], used = new Set();
  // 明確的桶標記流程：弱點 70%、基礎 20%、挑戰 10%
  const buckets = { weakness: [], basic: [], challenge: [] };
  if (mode === 'weakness') {
    const weakIds = [];
    for (const r of wrong7) weakIds.push(r.question_id);
    for (const c of concepts) for (const q of all) if (q.concept === c.concept && !weakIds.includes(q.id)) weakIds.push(q.id);
    for (const c of ch30) for (const q of all) if (q.chapter_id === c.chapter_id && !weakIds.includes(q.id)) weakIds.push(q.id);
    for (const q of all) if (q.exam_focus && !weakIds.includes(q.id)) weakIds.push(q.id);
    const weakPool = weakIds.map((id) => byId.get(id)).filter(Boolean);
    const basicPool = all.filter((q) => q.difficulty === 'basic' && !weakIds.includes(q.id));
    const chalPool = all.filter((q) => q.difficulty === 'challenge' && !weakIds.includes(q.id));
    const nWeak = Math.round(count * 0.7), nBasic = Math.round(count * 0.2), nChal = count - nWeak - nBasic;
    const fill = (pool, n, bucket) => { let got = 0; for (const q of shuffle(pool)) { if (got >= n || picked.length >= count) break; if (used.has(q.id)) continue; used.add(q.id); buckets[bucket].push(q); picked.push(q); got++; } return got; };
    fill(weakPool, nWeak, 'weakness');
    fill(basicPool, nBasic, 'basic');
    fill(chalPool, nChal, 'challenge');
    // 弱點題不夠時，用基礎題補齊（保持總題數），並在 breakdown 說明
    if (picked.length < count) fill(basicPool, count - picked.length, 'basic');
    if (picked.length < count) fill(chalPool, count - picked.length, 'challenge');
    if (picked.length < count) fill(all, count - picked.length, 'basic');
  } else {
    for (const q of shuffle(all)) { if (picked.length >= count) break; buckets.basic.push(q); picked.push(q); }
  }
  const breakdown = {
    mode,
    subject_id: subjectId,
    weakness: buckets.weakness.length, basic: buckets.basic.length, challenge: buckets.challenge.length,
    wrong7_count: wrong7.length,
    top_error_chapters: ch30.slice(0, 3).map((c) => ({ chapter_id: c.chapter_id, rate: Math.round(c.rate * 100), wrong: c.wrong, total: c.total })),
    repeated_concepts: concepts.slice(0, 5).map((c) => ({ concept: c.concept, wrong: c.wrong })),
    note: mode === 'weakness'
      ? (wrong7.length === 0 && ch30.length === 0 ? '最近 7／30 天還沒有足夠的錯題紀錄，所以先用基礎題和段考重點題組卷；練幾回之後弱點題會自動變多。' : '弱點題優先取：最近 7 天錯過的題目 → 重複錯的觀念 → 最近 30 天錯誤率最高的章節 → 段考重點章節。')
      : '均衡模式：不依弱點加權，隨機抽題。',
  };
  return { questions: shuffle(picked).map(publicQuestion), breakdown };
}
function chapterStats(userId) {
  const doc = getQuestionsDoc();
  const rows = db.prepare(`SELECT chapter_id, COUNT(*) AS total, SUM(is_correct) AS correct FROM attempts WHERE user_id=? GROUP BY chapter_id`).all(userId);
  const byCh = new Map(rows.map((r) => [r.chapter_id, r]));
  return doc.chapters.map((c) => {
    const qs = db.prepare('SELECT id FROM questions WHERE chapter_id=?').all(c.id).map((r) => r.id);
    const mastered = db.prepare(`SELECT COUNT(DISTINCT question_id) AS n FROM attempts WHERE user_id=? AND chapter_id=? AND is_correct=1`).get(userId, c.id).n;
    const r = byCh.get(c.id) || { total: 0, correct: 0 };
    const totalQ = qs.length || 12;
    const ratio = totalQ > 0 ? mastered / totalQ : 0;
    const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.25 ? 1 : 0;
    return { ...c, total_questions: qs.length, mastered, attempts: r.total, accuracy: r.total ? Math.round((r.correct / r.total) * 100) : null, stars };
  });
}

module.exports = { db, importQuestionsDoc, loadQuestionsFile, getQuestionsDoc, allQuestions, weaknessFor, buildPaper, chapterStats };

// ---------- Express app ----------
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.html') || req.path.endsWith('.css') || req.path === '/') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true, version: getMeta('questions_version') || '0' }));
app.get('/api/content', (req, res) => {
  const doc = getQuestionsDoc();
  const qCount = db.prepare('SELECT COUNT(*) n FROM questions').get().n;
  res.json({
    subjects: doc.subjects,
    chapters: doc.chapters,
    resources: doc.resources || [],
    video_resources: doc.video_resources || [],
    version: getMeta('questions_version') || '0',
    questions_count: qCount
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: '請輸入帳號與密碼' });
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(String(username).trim());
  if (!u || !bcrypt.compareSync(String(password), u.password_hash)) return res.status(401).json({ error: '帳號或密碼錯誤' });
  setSession(res, u.id);
  res.json({ id: u.id, username: u.username, role: u.role, display_name: u.display_name, must_change_password: !!u.must_change_password });
});
app.post('/api/auth/logout', (req, res) => { clearSession(req, res); res.json({ ok: true }); });
app.get('/api/auth/me', (req, res) => { const u = authUser(req); if (!u) return res.status(401).json({ error: '請先登入' }); res.json(u); });
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { old_password, new_password } = req.body || {};
  if (!new_password || String(new_password).length < 6) return res.status(400).json({ error: '新密碼至少 6 個字元' });
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!bcrypt.compareSync(String(old_password || ''), u.password_hash)) return res.status(401).json({ error: '舊密碼錯誤' });
  db.prepare('UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?').run(bcrypt.hashSync(String(new_password), 10), req.user.id);
  res.json({ ok: true });
});

app.get('/api/me/stats', requireAuth, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) n, SUM(is_correct) c FROM attempts WHERE user_id=?').get(req.user.id);
  res.json({ chapters: chapterStats(req.user.id), total_attempts: total.n || 0, total_correct: total.c || 0, weakness: weaknessFor(req.user.id) });
});
app.get('/api/me/weakness', requireAuth, (req, res) => res.json(weaknessFor(req.user.id)));
app.get('/api/me/wrong', requireAuth, (req, res) => {
  const rows = db.prepare(`SELECT a.question_id, a.chapter_id, a.subject_id, a.concept, a.created_at, q.stem, q.options, q.answer, q.explanation
    FROM attempts a JOIN questions q ON q.id=a.question_id
    WHERE a.user_id=? AND a.is_correct=0 ORDER BY a.created_at DESC LIMIT 50`).all(req.user.id);
  res.json(rows.map((r) => ({ ...r, options: JSON.parse(r.options) })));
});
app.get('/api/quiz/:chapterId', requireAuth, (req, res) => {
  const qs = db.prepare('SELECT * FROM questions WHERE chapter_id=? ORDER BY id').all(req.params.chapterId)
    .map((q) => publicQuestion({ ...q, options: JSON.parse(q.options) }));
  if (!qs.length) return res.status(404).json({ error: '找不到這個章節' });
  res.json(shuffle(qs));
});
app.post('/api/attempts', requireAuth, (req, res) => {
  const { question_id, selected } = req.body || {};
  const q = db.prepare('SELECT * FROM questions WHERE id=?').get(question_id);
  if (!q || typeof selected !== 'number') return res.status(400).json({ error: '題目或選項錯誤' });
  const correct = selected === q.answer;
  db.prepare('INSERT INTO attempts(user_id,question_id,chapter_id,subject_id,concept,is_correct,created_at) VALUES(?,?,?,?,?,?,?)')
    .run(req.user.id, q.id, q.chapter_id, q.subject_id, q.concept || '', correct ? 1 : 0, nowIso());
  res.json({ correct, correct_index: q.answer, explanation: q.explanation });
});

app.post('/api/papers', requireAuth, (req, res) => {
  const subject = (req.body || {}).subject_id || null;
  const subjectDoc = getQuestionsDoc().subjects.find((s) => s.id === subject);
  if (!subjectDoc) return res.status(400).json({ error: '請選擇科目，試卷一次只考一科' });
  // 題數不能超過該科現有題數（國文／英文／數學／生物 32 題，歷史／地理／公民 24 題）
  const total = db.prepare('SELECT COUNT(*) n FROM questions WHERE subject_id=?').get(subject).n;
  const count = Math.min(Math.max(Number((req.body || {}).count) || 20, 5), total);
  const mode = (req.body || {}).mode === 'balanced' ? 'balanced' : 'weakness';
  const built = buildPaper(req.user.id, count, mode, subject);
  const id = db.prepare('INSERT INTO papers(user_id,title,mode,question_ids,breakdown,created_at) VALUES(?,?,?,?,?,?)')
    .run(req.user.id, `${subjectDoc.title}${mode === 'weakness' ? '弱點補強' : '均衡'}複習卷`, mode, JSON.stringify(built.questions.map((q) => q.id)), JSON.stringify(built.breakdown), nowIso()).lastInsertRowid;
  res.json({ id, ...built });
});
app.post('/api/papers/:id/submit', requireAuth, (req, res) => {
  const paper = db.prepare('SELECT * FROM papers WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!paper) return res.status(404).json({ error: '找不到這份試卷' });
  const answers = (req.body || {}).answers || {};
  const results = [];
  for (const qid of JSON.parse(paper.question_ids)) {
    const q = db.prepare('SELECT * FROM questions WHERE id=?').get(qid);
    if (!q) continue;
    const selected = typeof answers[qid] === 'number' ? answers[qid] : -1;
    const correct = selected === q.answer;
    db.prepare('INSERT INTO attempts(user_id,question_id,chapter_id,subject_id,concept,is_correct,created_at) VALUES(?,?,?,?,?,?,?)')
      .run(req.user.id, q.id, q.chapter_id, q.subject_id, q.concept || '', correct ? 1 : 0, nowIso());
    results.push({ question_id: q.id, stem: q.stem, options: JSON.parse(q.options), selected, correct_index: q.answer, correct, explanation: q.explanation });
  }
  const score = results.filter((r) => r.correct).length;
  res.json({ score, total: results.length, results });
});
app.get('/api/papers/:id/print', requireAuth, (req, res) => {
  const paper = db.prepare('SELECT * FROM papers WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!paper) return res.status(404).send('找不到這份試卷');
  const qs = JSON.parse(paper.question_ids).map((id) => db.prepare('SELECT * FROM questions WHERE id=?').get(id)).filter(Boolean);
  const doc = getQuestionsDoc();
  const chName = (id) => (doc.chapters.find((c) => c.id === id) || {}).title || id;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const letters = ['A', 'B', 'C', 'D'];
  const body = qs.map((q, i) => `<div class="q"><p><b>${i + 1}. ${esc(q.stem)}</b>（${esc(chName(q.chapter_id))}）</p>${JSON.parse(q.options).map((o, j) => `<p>（${letters[j]}）${esc(o)}</p>`).join('')}<p class="blank">答案：______</p></div>`).join('');
  const key = qs.map((q, i) => `<p>${i + 1}. ${letters[q.answer]} — ${esc(q.explanation)}</p>`).join('');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><title>學習島複習卷</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:24px;line-height:1.7} .q{margin-bottom:20px} .blank{color:#666} @media print{.key{page-break-before:always}}</style></head><body><h1>學習島複習卷</h1><p>姓名：__________　日期：__________　分數：______ / ${qs.length}</p>${body}<div class="key"><h2>答案與解析（請寫完再看）</h2>${key}</div></body></html>`);
});

// ---------- 管理員 ----------
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, username, role, display_name, must_change_password, created_at FROM users ORDER BY role, username').all());
});
app.post('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const { username, password, display_name } = req.body || {};
  if (!username || !password || String(password).length < 6) return res.status(400).json({ error: '帳號與至少 6 個字元的密碼必填' });
  try {
    const id = db.prepare("INSERT INTO users(username,password_hash,role,display_name,created_at) VALUES(?,?,'student',?,?)")
      .run(String(username).trim(), bcrypt.hashSync(String(password), 10), String(display_name || username).trim(), nowIso()).lastInsertRowid;
    res.json({ id, ok: true });
  } catch (e) { res.status(400).json({ error: `建立帳號失敗：${e.message}` }); }
});
app.post('/api/admin/users/:id/reset-password', requireAuth, requireAdmin, (req, res) => {
  const { password } = req.body || {};
  if (!password || String(password).length < 6) return res.status(400).json({ error: '新密碼至少 6 個字元' });
  db.prepare('UPDATE users SET password_hash=?, must_change_password=1 WHERE id=?').run(bcrypt.hashSync(String(password), 10), req.params.id);
  res.json({ ok: true });
});
app.post('/api/admin/users/:id/delete', requireAuth, requireAdmin, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: '找不到帳號' });
  if (u.role === 'admin') return res.status(400).json({ error: '不能刪除管理員帳號' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
app.get('/api/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
  const students = db.prepare("SELECT id, username, display_name FROM users WHERE role='student' ORDER BY username").all();
  const out = students.map((s) => {
    const w = weaknessFor(s.id);
    const total = db.prepare('SELECT COUNT(*) n, SUM(is_correct) c FROM attempts WHERE user_id=?').get(s.id);
    const recent = db.prepare(`SELECT a.question_id, a.chapter_id, a.concept, a.created_at, q.stem FROM attempts a JOIN questions q ON q.id=a.question_id WHERE a.user_id=? AND a.is_correct=0 ORDER BY a.created_at DESC LIMIT 10`).all(s.id);
    const ch30 = w.ch30.slice(0, 3);
    const chStats = chapterStats(s.id);
    const totalStars = chStats.reduce((a, c) => a + c.stars, 0);
    return { ...s, total_attempts: total.n || 0, accuracy: total.n ? Math.round(((total.c || 0) / total.n) * 100) : null, total_stars: totalStars, wrong7: w.wrong7.length, top_error_chapters: ch30, repeated_concepts: w.concepts.slice(0, 5), recent_mistakes: recent };
  });
  res.json(out);
});

app.get('/api/admin/users/:id/detail', requireAuth, requireAdmin, (req, res) => {
  const student = db.prepare("SELECT id, username, display_name, created_at FROM users WHERE id=? AND role='student'").get(req.params.id);
  if (!student) return res.status(404).json({ error: '找不到學生帳號' });

  const w = weaknessFor(student.id);
  const total = db.prepare('SELECT COUNT(*) n, SUM(is_correct) c FROM attempts WHERE user_id=?').get(student.id);
  const totalAttempts = total.n || 0;
  const totalCorrect = total.c || 0;
  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : null;

  const rawAttempts = db.prepare(`
    SELECT a.id, a.question_id, a.chapter_id, a.subject_id, a.concept, a.is_correct, a.created_at,
           q.stem, q.options, q.answer, q.explanation
    FROM attempts a
    LEFT JOIN questions q ON q.id = a.question_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC, a.id DESC
    LIMIT 100
  `).all(student.id);

  const safeParse = (str) => {
    if (!str) return [];
    try { return JSON.parse(str); } catch { return []; }
  };

  const attempts = rawAttempts.map((r) => ({
    ...r,
    options: safeParse(r.options)
  }));

  const rawMistakes = db.prepare(`
    SELECT a.question_id, a.chapter_id, a.subject_id, a.concept,
           COUNT(*) as wrong_count,
           MAX(a.created_at) as last_wrong_at,
           q.stem, q.options, q.answer, q.explanation
    FROM attempts a
    LEFT JOIN questions q ON q.id = a.question_id
    WHERE a.user_id = ? AND a.is_correct = 0
    GROUP BY a.question_id
    ORDER BY wrong_count DESC, last_wrong_at DESC
  `).all(student.id);

  const mistakes = rawMistakes.map((r) => ({
    ...r,
    options: safeParse(r.options)
  }));

  const chStats = chapterStats(student.id);
  const totalStars = chStats.reduce((a, c) => a + c.stars, 0);

  res.json({
    student,
    stats: {
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      accuracy,
      total_stars: totalStars,
      wrong7: w.wrong7.length,
      repeated_concepts: w.concepts.slice(0, 8),
      top_error_chapters: w.ch30.slice(0, 5),
      chapters: chStats
    },
    attempts,
    mistakes
  });
});
app.post('/api/admin/check-updates', requireAuth, requireAdmin, async (req, res) => {
  const url = ((req.body || {}).url || QUESTIONS_URL).trim();
  if (!url) return res.status(400).json({ error: '尚未設定題庫網址（QUESTIONS_URL）。請在 .env 或 docker-compose 填入 GitHub questions.json 的 Raw 網址。' });
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'learning-island/1.0' } });
    if (!r.ok) throw new Error(`下載失敗：HTTP ${r.status}`);
    const doc = await r.json();
    const before = db.prepare('SELECT COUNT(*) n FROM attempts').get().n;
    const result = importQuestionsDoc(doc);
    fs.writeFileSync(QUESTIONS_PATH, JSON.stringify(doc, null, 2) + '\n');
    setMeta('questions_source_url', url);
    res.json({ ...result, attempts_preserved: before });
  } catch (e) { res.status(400).json({ error: `題庫更新失敗：${e.message}（學生作答紀錄未更動）` }); }
});
app.get('/api/admin/questions-info', requireAuth, requireAdmin, (req, res) => {
  res.json({ version: getMeta('questions_version'), imported_at: getMeta('questions_imported_at'), source_url: getMeta('questions_source_url') || QUESTIONS_URL || '', configured_url: QUESTIONS_URL || '' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  ensureAdmin();
  try { const r = loadQuestionsFile(); console.log(`[info] 題庫已匯入：${r.subjects} 科、${r.chapters} 章、${r.questions} 題（版本 ${r.version}）`); }
  catch (e) { console.error(`[error] 題庫匯入失敗：${e.message}（檔案：${QUESTIONS_PATH}）`); process.exit(1); }
  app.listen(PORT, '0.0.0.0', () => console.log(`[info] 學習島已啟動：http://0.0.0.0:${PORT}，資料庫：${DB_PATH}`));
}
