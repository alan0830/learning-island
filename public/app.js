'use strict';
/* 學習島前端：登入 / 群島 / 章節複習 / 測驗 / 弱點試卷 / 錯題本 / 家長看板 / 管理 */
const app = document.getElementById('app');
const userbar = document.getElementById('userbar');
let me = null, content = null, stats = null, adminStudents = [];
let currentSubject = null, subjectGrade = {};
const GRADES = [{ id: 'g7a', label: '七上' }, { id: 'g7b', label: '七下' }, { id: 'g8a', label: '八上' }, { id: 'g8b', label: '八下' }, { id: 'g9a', label: '九上' }, { id: 'g9b', label: '九下' }];
const gradeLabel = (g) => (GRADES.find((x) => x.id === g) || {}).label || g;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const api = async (p, o) => {
  const r = await fetch(p, { headers: { 'Content-Type': 'application/json' }, ...o });
  const t = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(t.error || `請求失敗（${r.status}）`);
  return t;
};
const stars = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
const VIDEO_NOTE = '這些連結大多會開啟 YouTube 搜尋結果，請確認頻道名稱後再訂閱；資料來源為網友分享的學習資源整理（https://iridescent-lolly-a19324.netlify.app/），外部連結未逐一驗證是否仍可開啟、是否對應正確頻道。';
const VIDEO_SOURCE_URL = 'https://iridescent-lolly-a19324.netlify.app/';
const videoGroupsFor = (sid) => (content.video_resources || []).filter((g) => g.subject_id === sid);
const videoGroupsAll = () => content.video_resources || [];
const kindTag = (it) => it.kind === 'website' ? '🌐 網站' : it.kind === 'youtube_channel' ? '▶️ YouTube 頻道' : '🔍 YouTube 搜尋';
function videoListHtml(groups) {
  return groups.map((g) => `<div class="vids"><h3>${esc(g.title)} <span class="pill">${esc(g.label || '')}</span></h3><p class="muted">${esc(g.note || '')}</p>` +
    g.items.map((it) => `<p>${kindTag(it)} <a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.name)}</a></p>`).join('') + `</div>`).join('');
}
function renderVideos() {
  app.innerHTML = `<div class="card"><button class="btn ghost" onclick="renderHome()">← 回群島</button><h2>🎬 影音教學資源</h2>
  <p class="muted">${esc(VIDEO_NOTE)}</p>
  <p>資料來源：<a href="${VIDEO_SOURCE_URL}" target="_blank" rel="noopener">國中生學習島（網友分享的學習資源整理）</a></p>
  ${videoListHtml(videoGroupsAll())}</div>
  <div class="card"><h3>📚 延伸學習資源</h3>${content.resources.map((r) => `<p>🔗 <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a> — ${esc(r.note)}</p>`).join('')}
  <p class="muted">題目依翰林七上課綱重點自編，非課本原文；段考範圍以學校課本與老師公告為準。</p></div>`;
}

async function boot() {
  try { content = await api('/api/content'); } catch (e) { app.innerHTML = `<div class="card"><h2>伺服器還沒準備好</h2><p>${esc(e.message)}</p></div>`; return; }
  try { me = await api('/api/auth/me'); } catch { me = null; }
  renderUserbar();
  if (!me) return renderLogin();
  if (me.must_change_password) return renderChangePassword(true);
  renderHome();
}
function renderUserbar() {
  userbar.innerHTML = me
    ? `${esc(me.display_name || me.username)}（${me.role === 'admin' ? '家長' : '學生'}） <button onclick="logout()">登出</button>`
    : '';
}
async function logout() { await api('/api/auth/logout', { method: 'POST' }); location.reload(); }

function renderLogin() {
  app.innerHTML = `<div class="card" style="max-width:480px;margin:40px auto">
    <h2>登入學習島</h2><p class="muted">每個小朋友用自己的帳號登入，進度分開記，iPad 和筆電登入同一個帳號就會同步。</p>
    <p class="muted">第一次使用：請用管理員帳號登入（見 NAS 上的 .env 設定），再由家長建立學生帳號。</p>
    <label>帳號<input id="u" autocomplete="username"></label>
    <label>密碼<input id="p" type="password" autocomplete="current-password"></label>
    <p id="err" style="color:#dc2626"></p>
    <button class="btn" onclick="doLogin()">登入</button></div>`;
}
async function doLogin() {
  try { me = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: document.getElementById('u').value, password: document.getElementById('p').value }) }); renderUserbar(); boot(); }
  catch (e) { document.getElementById('err').textContent = e.message; }
}
function renderChangePassword(first) {
  app.innerHTML = `<div class="card" style="max-width:480px;margin:40px auto">
    <div class="warn">⚠️ ${first ? '第一次登入，請先更改密碼。' : '更改密碼'}</div>
    <label>舊密碼<input id="op" type="password"></label>
    <label>新密碼（至少 6 個字元）<input id="np" type="password"></label>
    <p id="err" style="color:#dc2626"></p>
    <button class="btn" onclick="doChangePw()">更改密碼</button>
    ${first ? '' : '<button class="btn ghost" onclick="renderHome()">取消</button>'}</div>`;
}
async function doChangePw() {
  try { await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ old_password: document.getElementById('op').value, new_password: document.getElementById('np').value }) }); alert('密碼已更改'); location.reload(); }
  catch (e) { document.getElementById('err').textContent = e.message; }
}

async function renderHome() {
  stats = await api('/api/me/stats');
  const chBySub = {};
  for (const c of stats.chapters) (chBySub[c.subject_id] ||= []).push(c);
  const totalStars = stats.chapters.reduce((a, c) => a + c.stars, 0);
  const mastered = stats.chapters.reduce((a, c) => a + c.mastered, 0);
  app.innerHTML = `
    <div class="card home-summary">
      <div class="hs-main">
        <span class="hs-hello">你好，${esc(me.display_name || me.username)} 👋</span>
        <span class="muted hs-stats">已作答 ${stats.total_attempts} 題 · 答對 ${stats.total_correct} 題 · 已掌握 ${mastered} / 200 題 · ⭐ ${totalStars} / ${stats.chapters.length * 3}</span>
        <span class="muted hs-weak">🔍 我的弱點：最近 7 天錯題 ${stats.weakness.wrong7.length} 題；最近 30 天錯誤率最高：${stats.weakness.ch30.slice(0, 3).map((c) => `${esc(chapterTitle(c.chapter_id))} ${Math.round(c.rate * 100)}%`).join('、') || '還沒有足夠紀錄'}；重複錯的觀念：${stats.weakness.concepts.slice(0, 5).map((c) => `${esc(c.concept)}（${c.wrong} 次）`).join('、') || '無'}</span>
      </div>
      <div class="toolbar">
        <button class="btn green" onclick="renderWrong()">📕 錯題本</button>
        <button class="btn" onclick="renderVideos()">🎬 影音教學</button>
        ${me.role === 'admin' ? '<button class="btn" onclick="renderAdmin()">👨‍👩‍👧 家長看板與管理</button>' : ''}
        <button class="btn ghost" onclick="renderChangePassword(false)">更改密碼</button>
      </div>
    </div>
    <div class="map-sea">
      <div class="map-title">🗺️ 選擇一座島，開始闖關！</div>
      <div class="island-map">
        ${content.subjects.map((s) => {
          const chs = chBySub[s.id] || [];
          const st = chs.reduce((a, c) => a + c.stars, 0);
          const ms = chs.reduce((a, c) => a + c.mastered, 0);
          const tq = chs.reduce((a, c) => a + c.total_questions, 0);
          const pct = tq ? Math.round((ms / tq) * 100) : 0;
          return `<div class="isle" style="--island-color:${s.color}" onclick="renderSubject('${s.id}')">
            <div class="isle-scene"><span class="isle-icon">${s.icon}</span><div class="isle-body"></div></div>
            <div class="isle-card">
              <b>${esc(s.title)}</b>
              <span class="muted isle-desc">${esc(s.desc || '')}</span>
              <span class="muted">${chs.length} 章 · 已掌握 ${ms}/${tq} 題</span>
              <div class="pbar"><div style="width:${pct}%"></div></div>
              <span class="isle-stars">★ ${st}/${chs.length * 3}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <p class="map-note muted">點一座島進去選年級，再挑章節闖關；每座島都有自己的複習卷喔！</p>
    </div>`;
}
const chapterTitle = (id) => (content.chapters.find((c) => c.id === id) || {}).title || id;
function backToSubject() { if (currentSubject) renderSubject(currentSubject); else renderHome(); }
function gradeTabsHtml(sid, active) {
  return `<div class="grade-tabs">${GRADES.map((g) => `<button class="grade-tab${g.id === active ? ' active' : ''}" onclick="renderSubject('${sid}','${g.id}')">${g.label}</button>`).join('')}</div>`;
}
function paperCountOptions(total) {
  const opts = [10, 20];
  if (total >= 30) opts.push(30);
  return opts.map((n) => `<option${n === 20 ? ' selected' : ''}>${n}</option>`).join('');
}
/* 科目頁島內地圖：章節配色、章節島位置、主島位置 */
const CH_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed'];
const chColor = (i) => CH_COLORS[i % CH_COLORS.length];
const chShortName = (t) => String(t || '').replace(/^第\s*\d+\s*章\s*/, '');
let selectedChapter = {};
const HUB_POS = [50, 52];
const MAP_POS = { 3: [[50, 15], [20, 82], [80, 82]], 4: [[22, 18], [78, 18], [22, 84], [78, 84]] };
function subjectMapHtml(s, chs, selId) {
  const pos = MAP_POS[chs.length] || MAP_POS[4];
  const lines = pos.map(([x, y]) => `<line x1="${HUB_POS[0]}" y1="${HUB_POS[1]}" x2="${x}" y2="${y}"/>`).join('');
  return `<div class="subj-map">
    <span class="map-cloud" style="left:6%;top:5%">☁️</span>
    <span class="map-cloud" style="right:7%;top:11%">☁️</span>
    <svg class="subj-bridges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g stroke="#92400e" stroke-width="9" vector-effect="non-scaling-stroke" stroke-linecap="round">${lines}</g>
      <g stroke="#d97706" stroke-width="2" stroke-dasharray="7 5" vector-effect="non-scaling-stroke" stroke-linecap="round">${lines}</g>
    </svg>
    <div class="map-hub" style="left:${HUB_POS[0]}%;top:${HUB_POS[1]}%">
      <span class="map-hub-icon">${s.icon}</span><div class="isle-body"></div><span class="map-label">${esc(s.title)}島</span>
    </div>
    ${chs.map((c, i) => { const [x, y] = pos[i];
      return `<div class="map-chapter${c.id === selId ? ' selected' : ''}" style="left:${x}%;top:${y}%" onclick="renderSubject('${s.id}','g7a','${c.id}')">
        <span class="map-badge-row"><span class="map-badge" style="background:${chColor(i)}">第 ${i + 1} 章</span><span class="map-stars">★ ${c.stars}/3</span></span>
        <div class="isle-body"></div><span class="map-label">${esc(chShortName(c.title))}</span></div>`; }).join('')}
    <span class="map-boat" style="left:44%;top:90%">⛵</span>
  </div>`;
}
function subjectPanelHtml(s, chs, sel) {
  const st = chs.reduce((a, c) => a + c.stars, 0);
  const ms = chs.reduce((a, c) => a + c.mastered, 0);
  const tq = chs.reduce((a, c) => a + c.total_questions, 0);
  const starMax = chs.length * 3;
  const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
  return `<div class="subj-panel">
    <div class="idx-eyebrow">THE ISLAND INDEX</div>
    <h2>把重點，連成島。</h2>
    <p class="panel-sub">${s.icon} ${esc(s.title)}島 · ${chs.length} 章 · ${tq} 題 · ${esc(s.desc || '')}</p>
    <div class="subj-progress">
      <div class="prog-card"><div class="prog-label">⭐ 課程進度</div><div class="prog-num">${st} <small>/ ${starMax} 顆星</small></div><div class="prog-bar"><div style="width:${pct(st, starMax)}%"></div></div></div>
      <div class="prog-card"><div class="prog-label">📚 已掌握題數</div><div class="prog-num">${ms} <small>/ ${tq} 題</small></div><div class="prog-bar"><div style="width:${pct(ms, tq)}%"></div></div></div>
    </div>
    <div class="ch-list">${chs.map((c, i) => `<button class="ch-row${c.id === sel.id ? ' selected' : ''}" style="--ch-color:${chColor(i)}" onclick="renderSubject('${s.id}','g7a','${c.id}')">
      <span class="ch-num">第 ${i + 1} 章</span>
      <span class="ch-mid"><b>${esc(c.title)}</b><span>${esc(c.subtitle)}</span></span>
      <span class="ch-stars">★ ${c.stars}/3 →</span></button>`).join('')}</div>
    <div class="ch-detail">
      <h3>${esc(sel.title)}</h3>
      <p class="panel-sub">${esc(sel.subtitle)}</p>
      <p><span class="star">${stars(sel.stars)}</span> <b>${sel.stars}/3 顆星</b><span class="panel-sub"> · 已掌握 ${sel.mastered}/${sel.total_questions} 題${sel.accuracy === null ? '' : ` · 答對率 ${sel.accuracy}%`}</span></p>
      <h3>📖 複習講義</h3><ul>${sel.key_points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <h3>⚠️ 容易錯的地方</h3><ul>${sel.common_mistakes.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <p><b>💭 想一想：</b>${esc(sel.think)}</p>
      <button class="btn amber" onclick="startQuiz('${sel.id}')">開始挑戰・8 題</button>
      <h3>🎬 影音教學</h3>${videoListHtml(videoGroupsFor(s.id))}
      <p class="panel-sub">${esc(VIDEO_NOTE)}</p>
    </div>
  </div>`;
}
async function renderSubject(subjectId, grade, chapterId) {
  currentSubject = subjectId;
  const s = content.subjects.find((x) => x.id === subjectId);
  const g = grade || subjectGrade[subjectId] || 'g7a';
  subjectGrade[subjectId] = g;
  if (g !== 'g7a') {
    app.innerHTML = `<div class="card"><button class="btn ghost" onclick="renderHome()">← 回群島地圖</button>
    <h2>${s.icon} ${esc(s.title)}</h2>
    ${gradeTabsHtml(s.id, g)}
    <div class="card coming"><h3>🏗️ ${gradeLabel(g)}即將推出，敬請期待！</h3>
    <p class="muted">${esc(s.title)}${gradeLabel(g)}的題目和講義還在準備中，現在可以先玩七上的內容喔。</p>
    <button class="btn" onclick="renderSubject('${s.id}','g7a')">先去七上闖關</button></div></div>`;
    return;
  }
  stats = await api('/api/me/stats');
  const chs = stats.chapters.filter((c) => c.subject_id === subjectId);
  const total = chs.reduce((a, c) => a + c.total_questions, 0);
  const selId = chapterId || selectedChapter[subjectId] || (chs[0] && chs[0].id);
  selectedChapter[subjectId] = selId;
  const sel = chs.find((c) => c.id === selId) || chs[0];
  app.innerHTML = `<div class="card"><button class="btn ghost" onclick="renderHome()">← 回群島地圖</button>
    <h2>${s.icon} ${esc(s.title)}島</h2><p class="muted">${esc(s.desc)}</p>
    ${gradeTabsHtml(s.id, g)}</div>
  <div class="subj-split">
    ${subjectMapHtml(s, chs, sel.id)}
    ${subjectPanelHtml(s, chs, sel)}
  </div>
  <div class="card"><h3>📝 生成${esc(s.title)}複習卷</h3>
    <p class="muted">弱點模式：弱點補強 70%、基礎複習 20%、挑戰題 10%，只出${esc(s.title)}的題目。弱點題優先取最近 7 天錯題 → 重複錯的觀念 → 最近 30 天錯誤率最高章節 → 段考重點章節。</p>
    <label>題數<select id="pc">${paperCountOptions(total)}</select></label>
    <label>模式<select id="pm"><option value="weakness">弱點補強（70/20/10）</option><option value="balanced">均衡模式</option></select></label>
    <button class="btn amber" onclick="genPaper('${s.id}')">生成試卷</button><div id="pout"></div></div>`;
}

async function renderChapter(chapterId) {
  const ch = content.chapters.find((c) => c.id === chapterId);
  app.innerHTML = `<div class="card"><button class="btn ghost" onclick="backToSubject()">← 回${esc(subjectTitle(ch.subject_id))}島</button>
    <h2>${esc(ch.title)}</h2><p class="muted">${esc(ch.subtitle)}</p>
    <h3>📖 複習講義</h3><ul>${ch.key_points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <h3>⚠️ 容易錯的地方</h3><ul>${ch.common_mistakes.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <p><b>💭 想一想：</b>${esc(ch.think)}</p>
    <h3>🎬 影音教學</h3>${videoListHtml(videoGroupsFor(ch.subject_id))}
    <p class="muted">${esc(VIDEO_NOTE)}</p>
    <button class="btn" onclick="startQuiz('${chapterId}')">開始闖關（8 題）</button></div>`;
}
let quiz = null, qi = 0, qScore = 0;
async function startQuiz(chapterId) {
  quiz = await api(`/api/quiz/${chapterId}`); qi = 0; qScore = 0; renderQuizQ();
}
function renderQuizQ() {
  const q = quiz[qi];
  app.innerHTML = `<div class="card"><p class="muted">第 ${qi + 1} / ${quiz.length} 題 · ${esc(chapterTitle(q.chapter_id))}</p>
    <h3>${esc(q.stem)}</h3>
    ${q.options.map((o, i) => `<button class="opt" onclick="answerQuiz(${i},this)">${'ABCD'[i]}. ${esc(o)}</button>`).join('')}
    <div id="fb"></div></div>`;
}
async function answerQuiz(i, btn) {
  document.querySelectorAll('.opt').forEach((b) => b.disabled = true);
  const q = quiz[qi];
  const r = await api('/api/attempts', { method: 'POST', body: JSON.stringify({ question_id: q.id, selected: i }) });
  if (r.correct) qScore++;
  document.querySelectorAll('.opt')[r.correct_index].classList.add('correct');
  if (!r.correct) btn.classList.add('wrong');
  document.getElementById('fb').innerHTML = `<div class="card" style="background:${r.correct ? '#f0fdf4' : '#fef2f2'}">
    <b>${r.correct ? '✅ 答對了！' : '❌ 答錯了，沒關係，弄懂就好。'}</b><p>${esc(r.explanation)}</p>
    ${qi + 1 < quiz.length ? '<button class="btn" onclick="qi++;renderQuizQ()">下一題 →</button>' : `<button class="btn" onclick="finishQuiz()">看結果</button>`}</div>`;
}
function finishQuiz() {
  app.innerHTML = `<div class="card"><h2>本章完成！</h2><p>答對 ${qScore} / ${quiz.length} 題。${qScore >= 7 ? '🌟 3 顆星！' : qScore >= 5 ? '⭐ 2 顆星，差一點就滿分了。' : '再看一次講義，錯題會收到錯題本，再練一次就會更好。'}</p>
  <button class="btn" onclick="backToSubject()">回${esc(subjectTitle(chapterSubjectId(quiz[0].chapter_id)))}島</button> <button class="btn ghost" onclick="renderWrong()">看錯題本</button></div>`;
}
async function renderWrong() {
  const rows = await api('/api/me/wrong');
  app.innerHTML = `<div class="card"><button class="btn ghost" onclick="renderHome()">← 回群島</button><h2>📕 錯題本（最近 50 題）</h2>
  ${rows.length ? rows.map((r) => `<div class="card"><p class="muted">${esc(chapterTitle(r.chapter_id))} · ${esc(r.concept)} · ${esc(r.created_at.slice(0, 10))}</p>
    <p><b>${esc(r.stem)}</b></p><p>正確答案：${'ABCD'[r.answer]}. ${esc(r.options[r.answer])}</p><p>${esc(r.explanation)}</p></div>`).join('') : '<p>目前沒有錯題，繼續保持！</p>'}</div>`;
}
const subjectTitle = (sid) => (content.subjects.find((s) => s.id === sid) || {}).title || sid;
const chapterSubjectId = (cid) => (content.chapters.find((c) => c.id === cid) || {}).subject_id || '';
let paper = null, paperAnswers = {};
async function genPaper(subjectId) {
  const count = Number(document.getElementById('pc').value), mode = document.getElementById('pm').value;
  paper = await api('/api/papers', { method: 'POST', body: JSON.stringify({ count, mode, subject_id: subjectId }) });
  paperAnswers = {};
  document.getElementById('pout').innerHTML = `<div class="card"><h3>試卷已生成（${paper.questions.length} 題）</h3>
  <p>弱點 ${paper.breakdown.weakness} 題 · 基礎 ${paper.breakdown.basic} 題 · 挑戰 ${paper.breakdown.challenge} 題</p>
  <p class="muted">${esc(paper.breakdown.note)}</p>
  <p class="muted">錯誤率最高章節：${paper.breakdown.top_error_chapters.map((c) => `${esc(chapterTitle(c.chapter_id))} ${c.rate}%`).join('、') || '無'}；重複錯觀念：${paper.breakdown.repeated_concepts.map((c) => esc(c.concept)).join('、') || '無'}</p>
  <a class="btn ghost" href="/api/papers/${paper.id}/print" target="_blank">🖨️ 列印／下載 HTML</a>
  <div id="paperqs">${paper.questions.map((q, i) => `<div class="card"><p><b>${i + 1}. ${esc(q.stem)}</b></p>
    ${q.options.map((o, j) => `<label><input type="radio" name="pq${q.id}" value="${j}" onchange="paperAnswers['${q.id}']=Number(this.value)"> ${'ABCD'[j]}. ${esc(o)}</label><br>`).join('')}</div>`).join('')}</div>
  <button class="btn" onclick="submitPaper()">交卷（結果會記入弱點紀錄）</button><div id="pres"></div></div>`;
}
async function submitPaper() {
  const r = await api(`/api/papers/${paper.id}/submit`, { method: 'POST', body: JSON.stringify({ answers: paperAnswers }) });
  document.getElementById('pres').innerHTML = `<h3>成績：${r.score} / ${r.total} 題</h3>` + r.results.map((x, i) => `<div class="card"><p><b>${i + 1}. ${esc(x.stem)}</b> ${x.correct ? '✅' : '❌'}</p><p>你的答案：${x.selected >= 0 ? 'ABCD'[x.selected] + '. ' + esc(x.options[x.selected]) : '未作答'}；正確答案：${'ABCD'[x.correct_index]}. ${esc(x.options[x.correct_index])}</p><p>${esc(x.explanation)}</p></div>`).join('');
  window.scrollTo(0, 0);
}
async function renderAdmin() {
  const dash = await api('/api/admin/dashboard');
  adminStudents = dash;
  const info = await api('/api/admin/questions-info');
  app.innerHTML = `<div class="card"><button class="btn ghost" onclick="renderHome()">← 回群島</button><h2>👨‍👩‍👧 家長看板</h2>
  <p class="muted">題庫版本 ${esc(info.version)}，匯入時間 ${esc(info.imported_at || '')}，題庫來源 ${esc(info.source_url || info.configured_url || '未設定')}</p>
  ${dash.map((s) => `<div class="card"><h3>${esc(s.display_name)}（${esc(s.username)}）</h3>
    <p>共作答 ${s.total_attempts} 題，答對率 ${s.accuracy === null ? '—' : s.accuracy + '%'}；最近 7 天錯題 ${s.wrong7} 題</p>
    <p>錯誤率最高章節：${s.top_error_chapters.map((c) => `${esc(chapterTitle(c.chapter_id))} ${Math.round(c.rate * 100)}%`).join('、') || '無'}</p>
    <p>重複錯觀念：${s.repeated_concepts.map((c) => `${esc(c.concept)}（${c.wrong} 次）`).join('、') || '無'}</p>
    <p class="muted">最近錯題：${s.recent_mistakes.map((r) => esc(r.stem)).join('；') || '無'}</p>
    <button class="btn danger" onclick="deleteStudent(${s.id})">🗑️ 刪除此學生帳號</button></div>`).join('') || '<p>還沒有學生帳號，請先建立。</p>'}
  </div>
  <div class="card"><h3>建立學生帳號</h3>
    <label>帳號（英文、例如 student1）<input id="nu"></label>
    <label>顯示名稱<input id="nd" placeholder="例如：小明"></label>
    <label>密碼（至少 6 字元）<input id="npw" type="password"></label>
    <button class="btn" onclick="createStudent()">建立帳號</button><p id="cerr" style="color:#dc2626"></p></div>
  <div class="card"><h3>題庫更新</h3><p class="muted">題庫放在 GitHub 的 questions.json，更新題目後，在這裡按「檢查題庫更新」，學生作答紀錄不會被清除。</p>
    <label>題庫網址（留空用伺服器設定的 QUESTIONS_URL）<input id="qurl" placeholder="https://raw.githubusercontent.com/.../questions.json"></label>
    <button class="btn amber" onclick="checkUpdates()">檢查題庫更新</button><p id="qup"></p></div>
  <div class="card"><h3>重設學生密碼</h3>
    <label>學生<select id="rs">${dash.map((s) => `<option value="${s.id}">${esc(s.display_name)}（${esc(s.username)}）</option>`).join('')}</select></label>
    <label>新密碼（至少 6 字元，學生下次登入需先更改）<input id="rpw" type="password"></label>
    <button class="btn" onclick="resetPw()">重設密碼</button><p id="rerr" style="color:#dc2626"></p></div>`;
}
async function createStudent() {
  try { await api('/api/admin/users', { method: 'POST', body: JSON.stringify({ username: document.getElementById('nu').value, display_name: document.getElementById('nd').value, password: document.getElementById('npw').value }) }); alert('學生帳號已建立'); renderAdmin(); }
  catch (e) { document.getElementById('cerr').textContent = e.message; }
}
async function deleteStudent(id) {
  const s = adminStudents.find((x) => x.id === id);
  const name = s ? `${s.display_name}（${s.username}）` : `ID ${id}`;
  if (!confirm(`確定要刪除學生「${name}」嗎？\n他的作答紀錄、錯題本、星星都會一起刪除，刪了就救不回來。`)) return;
  try { await api(`/api/admin/users/${id}/delete`, { method: 'POST', body: JSON.stringify({}) }); alert('學生帳號已刪除'); renderAdmin(); }
  catch (e) { alert(`刪除失敗：${e.message}`); }
}
async function resetPw() {
  const id = document.getElementById('rs').value;
  try { await api(`/api/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password: document.getElementById('rpw').value }) }); alert('密碼已重設，學生下次登入需先更改密碼。'); }
  catch (e) { document.getElementById('rerr').textContent = e.message; }
}
async function checkUpdates() {
  const url = document.getElementById('qurl').value.trim();
  try { const r = await api('/api/admin/check-updates', { method: 'POST', body: JSON.stringify({ url }) }); document.getElementById('qup').textContent = `更新完成：版本 ${r.version}，${r.questions} 題，作答紀錄保留 ${r.attempts_preserved} 筆。`; }
  catch (e) { document.getElementById('qup').textContent = e.message; }
}
boot();
