'use strict';
/* 學習島：國中群島學習平臺前端核心
 * 靈感來自 bio-islands.netlify.app
 * 整合 7 科 25 章 200 題題庫、SQLite 弱點引擎、3D 低多邊形群島與沉浸式學習抽屜
 */

const app = document.getElementById('app');
const modalContainer = document.getElementById('modal-container');

let me = null;
let content = null;
let stats = null;
let currentSubject = null;
let currentChapterId = null;
let drawerTab = 'island'; // 'island' | 'paper'
let quizState = null;
let isListMode = false;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `請求失敗（${res.status}）`);
  return data;
};

const starsStr = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

function speak(text, btn) {
  if (!('speechSynthesis' in window)) {
    alert('您的瀏覽器不支援語音朗讀功能');
    return;
  }
  window.speechSynthesis.cancel();
  const clean = String(text || '').replace(/<[^>]+>/g, '').replace(/[•·*]/g, '');
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'zh-TW';
  u.rate = 0.95;
  if (btn) {
    btn.classList.add('speaking');
    u.onend = () => btn.classList.remove('speaking');
    u.onerror = () => btn.classList.remove('speaking');
  }
  window.speechSynthesis.speak(u);
}

function formatKeyPoint(text) {
  return esc(text)
    .replace(/(「[^」]+」)/g, '<span class="kwd">$1</span>')
    .replace(/^([^：:]+[：:])/, '<span class="kwd">$1</span>');
}

/* ================= 啟動與認證 ================= */
async function boot() {
  try {
    content = await api('/api/content');
  } catch (e) {
    app.innerHTML = `<div class="wrap" style="padding:60px 20px;text-align:center">
      <h2>無法連線至學習島伺服器</h2><p style="color:#f87171">${esc(e.message)}</p>
    </div>`;
    return;
  }

  try {
    me = await api('/api/auth/me');
  } catch {
    me = null;
  }

  if (!me) {
    renderLoginModal();
    return;
  }
  if (me.must_change_password) {
    renderChangePasswordModal(true);
    return;
  }

  renderHome();
}

/* ================= 1. 首頁群島門戶 (PORTAL) ================= */
async function renderHome() {
  // 如果從島嶼視角返回，銷毀 3D 場景
  if (window.Island3D) window.Island3D.destroy();
  currentSubject = null;
  currentChapterId = null;

  try {
    stats = await api('/api/me/stats');
  } catch (e) {
    console.warn('Stats fetch error:', e);
  }

  const chBySub = {};
  for (const c of (stats?.chapters || [])) {
    (chBySub[c.subject_id] ||= []).push(c);
  }

  const totalStars = (stats?.chapters || []).reduce((a, c) => a + c.stars, 0);
  const maxStars = (content?.chapters || []).length * 3;
  const mastered = (stats?.chapters || []).reduce((a, c) => a + c.mastered, 0);
  const totalQ = content?.questions_count || 200;

  app.innerHTML = `
    <div class="portal-sea">
      <div class="wrap">
        <header class="portal-header">
          <div class="portal-title">
            <h1>🏝️ 國中學習群島</h1>
            <p>選一座島全部逛，或從下面挑一章，只練那一章的範圍。</p>
          </div>
          <div class="portal-tools">
            <div class="pill-tool pill-stars" title="全島星星累積">
              ★ ${totalStars} / ${maxStars}
            </div>
            <button class="pill-tool" onclick="renderWrongModal()">
              📕 錯題本
            </button>
            <button class="pill-tool" onclick="renderVideosModal()">
              🎬 影音教學
            </button>
            ${me?.role === 'admin' ? '<button class="pill-tool" onclick="renderAdminModal()">👨‍👩‍👧 家長看板</button>' : ''}
            <button class="pill-tool" onclick="renderUserMenuModal()">
              👤 ${esc(me?.display_name || me?.username)}
            </button>
          </div>
        </header>

        <!-- 7 科展示島座群 (Pedestals) -->
        <nav class="isles-grid" id="isles-grid" aria-label="七大主題群島">
          ${content.subjects.map(s => {
            const chs = chBySub[s.id] || [];
            const st = chs.reduce((a, c) => a + c.stars, 0);
            const tq = chs.reduce((a, c) => a + c.total_questions, 0);
            const ms = chs.reduce((a, c) => a + c.mastered, 0);
            return `
              <div class="isle-item" data-subject="${s.id}" style="--isle-color:${s.color}" onclick="openIsland('${s.id}')">
                ${window.renderIslandSVG ? window.renderIslandSVG(s.id) : `<div style="font-size:48px">${s.icon}</div>`}
                <div class="isle-card">
                  <b>${esc(s.title)}島</b>
                  <span class="tag">${esc(s.desc)}</span>
                  <span class="meta">${chs.length} 章 · ${tq} 題</span>
                  <div class="stars-badge">★ ${st} / ${chs.length * 3}</div>
                </div>
              </div>
            `;
          }).join('')}
        </nav>
      </div>
    </div>

    <!-- 課程章節總覽目錄 (Directory) -->
    <main class="wrap directory-section">
      <div class="directory-header">
        <h2>七年級 翰林版群島課程總覽</h2>
        <p>依課本章節挑選進度，各科章節都有獨立知識講義與闖關題庫。</p>
      </div>

      <div class="chapter-directory-grid">
        ${content.subjects.map(s => {
          const chs = (content.chapters || []).filter(c => c.subject_id === s.id);
          const stMap = Object.fromEntries((chBySub[s.id] || []).map(c => [c.id, c]));
          return `
            <div class="subject-group" data-subject="${s.id}">
              <div class="subject-group-title">
                <span>${s.icon} ${esc(s.title)}島</span>
                <span class="pill-ch-count">${chs.length} 個章節</span>
              </div>
              <div class="subject-group-rows">
                ${chs.map((c, i) => {
                  const chStat = stMap[c.id] || {};
                  const stars = chStat.stars || 0;
                  const shortName = String(c.title || '').replace(/^第\s*\d+\s*章\s*/, '');
                  return `
                    <div class="ch-directory-row" data-subject="${s.id}" style="--row-color:${s.color}" onclick="openIsland('${s.id}','${c.id}')">
                      <div class="num">${i + 1}</div>
                      <div class="mid">
                        <b>${esc(shortName)}</b>
                        <span>${esc(c.subtitle)}</span>
                      </div>
                      <div class="right-badge">
                        <span class="badge-isle">${esc(s.title)}島</span>
                        <span class="badge-stars">★ ${stars}/3</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </main>
  `;

  // 滑鼠移到上方島嶼時，亮起下方對應科目的所有章節
  document.querySelectorAll('.isle-item').forEach(item => {
    const sid = item.dataset.subject;
    const onHover = () => {
      document.body.classList.add('hl');
      document.querySelectorAll('.ch-directory-row').forEach(row => {
        row.classList.toggle('highlight', row.dataset.subject === sid);
      });
    };
    const onLeave = () => {
      document.body.classList.remove('hl');
      document.querySelectorAll('.ch-directory-row').forEach(row => row.classList.remove('highlight'));
    };
    item.addEventListener('mouseenter', onHover);
    item.addEventListener('mouseleave', onLeave);
  });
}

/* ================= 2. 島嶼 3D 分割畫面 (SPLIT SCREEN VIEW) ================= */
async function openIsland(subjectId, initialChapterId) {
  currentSubject = content.subjects.find(s => s.id === subjectId) || content.subjects[0];
  try {
    stats = await api('/api/me/stats');
  } catch (e) {
    console.warn(e);
  }

  const subjectChapters = (stats?.chapters || []).filter(c => c.subject_id === subjectId);
  const totalStars = subjectChapters.reduce((a, c) => a + c.stars, 0);
  const maxStars = subjectChapters.length * 3;
  const mastered = subjectChapters.reduce((a, c) => a + c.mastered, 0);
  const totalQ = subjectChapters.reduce((a, c) => a + c.total_questions, 0);

  app.innerHTML = `
    <div class="island-view-container">
      <!-- 左側 3D 舞台 -->
      <div class="island-stage" id="stage-box">
        <div id="stage3d"></div>
        <div id="stage-pins"></div>

        <!-- 頂部浮動 HUD -->
        <div class="stage-hud-top">
          <div class="hud-group">
            <button class="hud-pill" onclick="renderHome()">
              ‹ 入口
            </button>
            <div class="hud-pill primary">
              ${currentSubject.icon} <b>${esc(currentSubject.title)}島</b>
            </div>
            <div class="hud-pill" style="color:var(--star)">
              ★ ${totalStars} / ${maxStars}
            </div>
            <div class="hud-pill" style="color:#86efac">
              已掌握 ${mastered} / ${totalQ} 題
            </div>
          </div>
          <div class="hud-group">
            <button class="hud-pill" onclick="if(window.Island3D) window.Island3D.resetView()" title="回到全景視角">
              全景
            </button>
            <button class="hud-pill" onclick="toggleFullscreen()" title="全螢幕切換">
              ⛶
            </button>
            <button class="hud-pill" onclick="renderUserMenuModal()">
              👤 ${esc(me?.display_name || me?.username)}
            </button>
          </div>
        </div>

        <!-- 底部提示氣泡 -->
        <div class="stage-hud-bottom">
          點一座島開始挑戰 · 島旁的小船載著歷屆會考題與綜合複習卷
        </div>
      </div>

      <!-- 右側抽屜 (THE ISLAND INDEX / 講義 / 作答) -->
      <aside class="island-drawer" id="panel">
        <div class="drawer-content" id="panel-content">
          <!-- 動態抽屜內容由函式渲染 -->
        </div>
      </aside>
    </div>
  `;

  // 初始化 3D 群島
  const stageEl = document.getElementById('stage3d');
  const pinsEl = document.getElementById('stage-pins');

  const ok = window.Island3D.init(stageEl, pinsEl, {
    onSelectChapter: (cid) => {
      selectChapter(cid);
    },
    onOpenPaper: () => {
      openPaperDrawer();
    }
  });

  if (ok) {
    window.Island3D.buildArchipelago(currentSubject, subjectChapters, stats);
  } else {
    stageEl.innerHTML = `<div style="padding:60px 20px;text-align:center;color:#8ea3aa">
      3D 模組未啟用，請使用右側清單探索章節與練習題。
    </div>`;
  }

  // 決定右側抽屜顯示內容
  if (initialChapterId) {
    selectChapter(initialChapterId);
  } else {
    renderDrawerIndex();
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/* ================= 3. 抽屜：THE ISLAND INDEX ================= */
function renderDrawerIndex() {
  currentChapterId = null;
  drawerTab = 'island';
  const panel = document.getElementById('panel-content');
  if (!panel) return;

  const subjectChapters = (stats?.chapters || []).filter(c => c.subject_id === currentSubject.id);
  const totalStars = subjectChapters.reduce((a, c) => a + c.stars, 0);
  const maxStars = subjectChapters.length * 3;
  const mastered = subjectChapters.reduce((a, c) => a + c.mastered, 0);
  const totalQ = subjectChapters.reduce((a, c) => a + c.total_questions, 0);
  const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

  // 計算本科整體答對率
  const attempts = subjectChapters.reduce((a, c) => a + (c.attempts || 0), 0);
  const corrects = subjectChapters.reduce((a, c) => a + (c.corrects || 0), 0);
  const accuracy = attempts ? Math.round((corrects / attempts) * 100) : null;
  const wrong7 = stats?.weakness?.wrong7?.filter(w => {
    const ch = content.chapters.find(x => x.id === w.chapter_id);
    return ch && ch.subject_id === currentSubject.id;
  }) || [];

  panel.innerHTML = `
    <div class="drawer-eyebrow">THE ISLAND INDEX</div>
    <div class="drawer-title">
      <h2>把重點，連成島。</h2>
      <p>${currentSubject.icon} ${esc(currentSubject.title)}島 · ${subjectChapters.length} 座章節 · ${totalQ} 題精選練習。選一座島，讀重點、做練習、拿星星。</p>
    </div>

    <!-- 進度指標看板 -->
    <div class="drawer-progress-grid">
      <div class="prog-box">
        <div class="lbl">⭐ 歷程進度</div>
        <div class="val">${totalStars} <small>/ ${maxStars} 顆星</small></div>
        <div class="prog-bar-slim"><div style="width:${pct(totalStars, maxStars)}%"></div></div>
      </div>
      <div class="prog-box">
        <div class="lbl">📚 已掌握題數</div>
        <div class="val">${mastered} <small>/ ${totalQ} 題</small></div>
        <div class="prog-bar-slim"><div style="width:${pct(mastered, totalQ)}%"></div></div>
      </div>
      <div class="prog-box">
        <div class="lbl">🎯 本科答對率</div>
        <div class="val">${accuracy !== null ? accuracy + '%' : '—'} <small>${attempts} 題作答</small></div>
        <div class="prog-bar-slim"><div style="width:${accuracy || 0}%"></div></div>
      </div>
      <div class="prog-box">
        <div class="lbl">📕 7天錯題</div>
        <div class="val">${wrong7.length} <small>題待補強</small></div>
        <div class="prog-bar-slim"><div style="width:${Math.min(wrong7.length * 10, 100)}%;background:var(--bad)"></div></div>
      </div>
    </div>

    <!-- 標籤頁切換 -->
    <div class="drawer-tabs">
      <button class="drawer-tab ${drawerTab === 'island' ? 'active' : ''}" onclick="renderDrawerIndex()">島嶼學習</button>
      <button class="drawer-tab ${drawerTab === 'paper' ? 'active' : ''}" onclick="openPaperDrawer()">會考小船 / 複習試卷</button>
    </div>

    <!-- 章節列表卡片 -->
    <div class="drawer-ch-list">
      ${subjectChapters.map((ch, i) => {
        const shortName = String(ch.title || '').replace(/^第\s*\d+\s*章\s*/, '');
        return `
          <div class="drawer-ch-card" onclick="selectChapter('${ch.id}')">
            <span class="ch-badge-num" style="--ch-accent:${currentSubject.color}">第 ${i + 1} 章</span>
            <div class="ch-card-body">
              <b>${esc(shortName)}</b>
              <span>${esc(ch.subtitle)}</span>
            </div>
            <div class="ch-card-stars">★ ${ch.stars}/3 →</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function selectChapter(chapterId) {
  currentChapterId = chapterId;
  if (window.Island3D) window.Island3D.focusChapter(chapterId);
  renderDrawerStudy(chapterId);
}

/* ================= 4. 抽屜：章節講義與次主題 (STUDY DRAWER - Image 3) ================= */
function renderDrawerStudy(chapterId) {
  const panel = document.getElementById('panel-content');
  if (!panel) return;

  const ch = (stats?.chapters || []).find(c => c.id === chapterId) || content.chapters.find(c => c.id === chapterId);
  if (!ch) return;

  const st = ch.stars || 0;
  const shortName = String(ch.title || '').replace(/^第\s*\d+\s*章\s*/, '');
  const videoGroups = (content?.video_resources || []).filter(g => g.subject_id === ch.subject_id);

  panel.innerHTML = `
    <div class="drawer-nav-header">
      <button class="btn-nav-back" onclick="renderDrawerIndex()">
        ‹ 回群島索引
      </button>
      <button class="btn-nav-close" onclick="renderDrawerIndex()" title="關閉講義">
        ✕
      </button>
    </div>

    <div class="study-hero">
      <h2>${esc(shortName)}</h2>
      <div class="sub">${esc(ch.subtitle)}</div>
      <div style="margin-top:8px;font-size:14px;color:var(--star)">
        ${starsStr(st)} <b>${st}/3 顆星</b>
        <span style="color:#a8a29e">· 已掌握 ${ch.mastered || 0}/${ch.total_questions || 8} 題${ch.accuracy !== null && ch.accuracy !== undefined ? ` · 答對率 ${ch.accuracy}%` : ''}</span>
      </div>
    </div>

    <!-- 核心重點整理 -->
    <div class="study-card-block">
      <h3>
        <span>📖 次主題與核心講義</span>
        <button class="say-btn" onclick="speak('${esc(ch.key_points.join('。'))}', this)">
          🔊 語音朗讀
        </button>
      </h3>
      <ul>
        ${ch.key_points.map(p => `<li>${formatKeyPoint(p)}</li>`).join('')}
      </ul>
    </div>

    <!-- 容易出錯概念 -->
    <div class="study-card-block">
      <h3 style="color:#fcd34d">⚠️ 容易錯的地方</h3>
      <ul>
        ${ch.common_mistakes.map(p => `<li>${formatKeyPoint(p)}</li>`).join('')}
      </ul>
    </div>

    <!-- 想一想思考題 -->
    <div class="study-card-block">
      <h3 style="color:#93c5fd">💭 想一想</h3>
      <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.6">${esc(ch.think)}</p>
    </div>

    <!-- 闖關挑戰按鈕 -->
    <button class="btn-action-quiz" onclick="startQuiz('${ch.id}')">
      開始挑戰・8 題闖關
    </button>

    <!-- 影音延伸資源 -->
    ${videoGroups.length ? `
      <div class="study-card-block">
        <h3>🎬 本科影音教學資源</h3>
        ${videoGroups.map(g => `
          <div style="font-size:13px;margin-bottom:8px">
            <b>${esc(g.title)}</b>
            ${g.items.map(it => `
              <div style="margin-top:4px"><a href="${esc(it.url)}" target="_blank" rel="noopener" style="color:#7dd3fc">🔗 ${esc(it.name)}</a></div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

/* ================= 5. 抽屜：闖關做題與反饋 (QUIZ DRAWER - Image 4) ================= */
async function startQuiz(chapterId) {
  try {
    const list = await api(`/api/quiz/${chapterId}`);
    quizState = {
      chapterId,
      questions: list,
      index: 0,
      score: 0,
      errors: 0,
      history: []
    };
    renderQuizQuestion();
  } catch (e) {
    alert(`無法載入題目：${e.message}`);
  }
}

function renderQuizQuestion() {
  const panel = document.getElementById('panel-content');
  if (!panel || !quizState) return;

  const q = quizState.questions[quizState.index];
  const ch = content.chapters.find(c => c.id === quizState.chapterId);
  const total = quizState.questions.length;
  const current = quizState.index + 1;

  panel.innerHTML = `
    <div class="drawer-nav-header">
      <button class="btn-nav-back" onclick="renderDrawerStudy('${quizState.chapterId}')">
        ‹ 回講義
      </button>
      <button class="btn-nav-close" onclick="renderDrawerIndex()" title="離開測驗">
        ✕
      </button>
    </div>

    <!-- 分段橘色進度條 -->
    <div class="quiz-progress-bar">
      <div class="quiz-segmented-bar">
        ${quizState.questions.map((_, i) => {
          let cls = '';
          if (i < quizState.index) {
            cls = quizState.history[i] ? 'done' : 'wrong';
          } else if (i === quizState.index) {
            cls = 'now';
          }
          return `<div class="quiz-segment ${cls}"></div>`;
        }).join('')}
      </div>
      <div class="quiz-err-counter">
        第 ${current} / 共 ${total} 題 · <span style="color:${quizState.errors ? 'var(--bad)' : 'var(--good)'}">✕ 錯誤 ${quizState.errors}</span>
      </div>
    </div>

    <!-- 題目情境與題幹 -->
    <div class="quiz-stem-card">
      <div class="question-text">
        <span>${esc(q.stem)}</span>
        <button class="say-btn" onclick="speak('${esc(q.stem)}', this)" title="朗讀題幹">
          🔊
        </button>
      </div>
    </div>

    <!-- ABCD 四個大選項 -->
    <div class="quiz-options" id="quiz-opts">
      ${q.options.map((opt, i) => `
        <button class="opt-btn" onclick="submitAnswer(${i}, this)">
          <span class="opt-badge">${'ABCD'[i]}</span>
          <span>${esc(opt)}</span>
        </button>
      `).join('')}
    </div>

    <div id="quiz-feedback"></div>
  `;
}

async function submitAnswer(optionIndex, btn) {
  const allBtns = document.querySelectorAll('.opt-btn');
  allBtns.forEach(b => b.disabled = true);

  const q = quizState.questions[quizState.index];

  try {
    const res = await api('/api/attempts', {
      method: 'POST',
      body: JSON.stringify({ question_id: q.id, selected: optionIndex })
    });

    const isCorrect = res.correct;
    quizState.history[quizState.index] = isCorrect;
    if (isCorrect) {
      quizState.score++;
    } else {
      quizState.errors++;
    }

    allBtns[res.correct_index].classList.add('correct');
    if (!isCorrect) {
      btn.classList.add('wrong');
    }

    // 顯示反饋卡片
    const fb = document.getElementById('quiz-feedback');
    const isLast = quizState.index + 1 >= quizState.questions.length;

    fb.innerHTML = `
      <div class="quiz-feedback-card ${isCorrect ? 'correct' : 'wrong'}">
        <b>${isCorrect ? '✅ 答對了！' : '❌ 答錯了，弄懂概念最重要。'}</b>
        <p>${esc(res.explanation)}</p>
        <button class="btn-primary" style="width:100%" onclick="${isLast ? 'finishQuiz()' : 'nextQuizQuestion()'}">
          ${isLast ? '查看闖關成果 ⭐' : '下一題 →'}
        </button>
      </div>
    `;
  } catch (e) {
    alert(`送出失敗：${e.message}`);
    allBtns.forEach(b => b.disabled = false);
  }
}

function nextQuizQuestion() {
  quizState.index++;
  renderQuizQuestion();
}

async function finishQuiz() {
  const panel = document.getElementById('panel-content');
  if (!panel || !quizState) return;

  const score = quizState.score;
  const total = quizState.questions.length;
  const starsEarned = score >= 7 ? 3 : score >= 5 ? 2 : 1;

  // 重新獲取最新進度資料
  try {
    stats = await api('/api/me/stats');
  } catch {}

  panel.innerHTML = `
    <div class="drawer-nav-header">
      <div style="font-weight:700;color:var(--star)">🎉 本章闖關完成！</div>
      <button class="btn-nav-close" onclick="renderDrawerIndex()">✕</button>
    </div>

    <div class="study-card-block" style="text-align:center;padding:28px 16px">
      <div style="font-size:48px;line-height:1;margin-bottom:8px">
        ${starsEarned === 3 ? '🌟' : starsEarned === 2 ? '⭐' : '💪'}
      </div>
      <h2 style="margin:0 0 6px;color:#fff">${starsEarned === 3 ? '完美通關！榮獲 3 顆星' : starsEarned === 2 ? '表現優秀！榮獲 2 顆星' : '再接再厲！榮獲 1 顆星'}</h2>
      <p style="color:#a8a29e;font-size:15px;margin:0 0 16px">
        本次作答 <b>${total}</b> 題，答對 <b>${score}</b> 題（答對率 ${Math.round((score / total) * 100)}%）。
      </p>

      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-primary" onclick="startQuiz('${quizState.chapterId}')">再挑戰一次</button>
        <button class="btn-ghost" onclick="renderDrawerStudy('${quizState.chapterId}')">回本章講義</button>
        <button class="btn-ghost" onclick="renderWrongModal()">查看錯題本</button>
      </div>
    </div>
  `;
}

/* ================= 6. 抽屜：會考小船 / 複習試卷 ================= */
function openPaperDrawer() {
  drawerTab = 'paper';
  const panel = document.getElementById('panel-content');
  if (!panel) return;

  const subjectChapters = (content?.chapters || []).filter(c => c.subject_id === currentSubject.id);
  const totalQ = subjectChapters.length * 8;
  const opts = [10, 20];
  if (totalQ >= 30) opts.push(30);

  panel.innerHTML = `
    <div class="drawer-nav-header">
      <button class="btn-nav-back" onclick="renderDrawerIndex()">
        ‹ 回群島索引
      </button>
      <button class="btn-nav-close" onclick="renderDrawerIndex()">✕</button>
    </div>

    <div class="study-hero">
      <h2>⛵ ${esc(currentSubject.title)}島 · 會考複習卷</h2>
      <div class="sub">模擬大考出題機制，根據你的個人弱點自適應組卷。</div>
    </div>

    <div class="study-card-block">
      <div class="form-group">
        <label>測驗題數</label>
        <select class="form-select" id="paper-count">
          ${opts.map(n => `<option value="${n}" ${n === 20 ? 'selected' : ''}>${n} 題</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>組卷模式</label>
        <select class="form-select" id="paper-mode">
          <option value="weakness">弱點補強模式（70% 弱點、20% 基礎、10% 挑戰）</option>
          <option value="balanced">平均分佈模式（各章均勻出題）</option>
        </select>
      </div>
      <button class="btn-action-quiz" onclick="createPaper()">
        組卷出發 🎯
      </button>
    </div>

    <div id="paper-output"></div>
  `;
}

async function createPaper() {
  const count = Number(document.getElementById('paper-count').value);
  const mode = document.getElementById('paper-mode').value;
  const out = document.getElementById('paper-output');

  try {
    const paper = await api('/api/papers', {
      method: 'POST',
      body: JSON.stringify({ count, mode, subject_id: currentSubject.id })
    });

    out.innerHTML = `
      <div class="study-card-block" style="margin-top:14px">
        <h3>📄 試卷已生成（${paper.questions.length} 題）</h3>
        <p style="font-size:13px;color:#a8a29e;margin:4px 0">
          弱點題 ${paper.breakdown.weakness} · 基礎題 ${paper.breakdown.basic} · 挑戰題 ${paper.breakdown.challenge}
        </p>
        <div style="display:flex;gap:8px;margin-top:10px">
          <a class="btn-ghost" href="/api/papers/${paper.id}/print" target="_blank" rel="noopener">
            🖨️ 列印 / 下載 HTML
          </a>
        </div>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px">
          ${paper.questions.map((q, idx) => `
            <div style="background:#1c1917;padding:12px;border-radius:10px">
              <b>${idx + 1}. ${esc(q.stem)}</b>
              <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
                ${q.options.map((opt, oi) => `
                  <label style="font-size:13.5px;color:#d6d3d1;cursor:pointer">
                    <input type="radio" name="pq_${q.id}" value="${oi}" onchange="recordPaperAns('${q.id}', ${oi})">
                    ${'ABCD'[oi]}. ${esc(opt)}
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn-primary" style="width:100%;margin-top:14px" onclick="submitPaperExam('${paper.id}')">
          交卷評分（將回饋弱點引擎）
        </button>
      </div>
      <div id="paper-submit-res"></div>
    `;
    window.activePaperAnswers = {};
  } catch (e) {
    alert(`組卷失敗：${e.message}`);
  }
}

window.recordPaperAns = function(qid, optIndex) {
  window.activePaperAnswers[qid] = optIndex;
};

async function submitPaperExam(paperId) {
  try {
    const res = await api(`/api/papers/${paperId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers: window.activePaperAnswers || {} })
    });

    const resEl = document.getElementById('paper-submit-res');
    resEl.innerHTML = `
      <div class="study-card-block" style="margin-top:14px">
        <h3>測驗結果：${res.score} / ${res.total} 題（答對率 ${Math.round((res.score / res.total) * 100)}%）</h3>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px">
          ${res.results.map((r, i) => `
            <div style="padding:10px;border-radius:8px;background:${r.correct ? 'var(--good-soft)' : 'var(--bad-soft)'}">
              <b>${i + 1}. ${esc(r.stem)} ${r.correct ? '✅' : '❌'}</b>
              <p style="margin:4px 0 0;font-size:13px;color:#d6d3d1">${esc(r.explanation)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    resEl.scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    alert(`交卷失敗：${e.message}`);
  }
}

/* ================= 7. 彈窗 MODALS (錯題本、影音、管理、登入) ================= */
async function renderWrongModal() {
  let rows = [];
  try {
    rows = await api('/api/me/wrong');
  } catch (e) {
    alert(e.message);
    return;
  }

  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>📕 我的錯題本（最近 50 題）</h2>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>
        ${rows.length ? `
          <div style="display:flex;flex-direction:column;gap:12px">
            ${rows.map(r => {
              const ch = (content?.chapters || []).find(c => c.id === r.chapter_id);
              return `
                <div class="study-card-block">
                  <div style="font-size:12px;color:var(--accent);font-weight:700">
                    ${esc(ch?.title || r.chapter_id)} · ${esc(r.concept || '')} · ${esc((r.created_at || '').slice(0, 10))}
                  </div>
                  <b style="font-size:15px;color:#fff">${esc(r.stem)}</b>
                  <div style="color:var(--good);font-size:14px;font-weight:600">
                    正確答案：${'ABCD'[r.answer]}. ${esc(r.options[r.answer])}
                  </div>
                  <p style="margin:0;font-size:13px;color:#a8a29e">${esc(r.explanation)}</p>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="text-align:center;padding:40px 0;color:#a8a29e">
            目前沒有錯題紀錄，太厲害了，請繼續保持！
          </div>
        `}
      </div>
    </div>
  `;
}

function renderVideosModal() {
  const groups = content?.video_resources || [];
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>🎬 影音教學與線上延伸資源</h2>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          ${groups.map(g => `
            <div class="study-card-block">
              <h3>${esc(g.title)} <span style="font-size:12px;color:var(--muted)">${esc(g.label || '')}</span></h3>
              <p style="font-size:13px;color:#a8a29e;margin:2px 0 6px">${esc(g.note || '')}</p>
              ${g.items.map(it => `
                <div style="margin-top:4px">
                  <a href="${esc(it.url)}" target="_blank" rel="noopener" style="color:#7dd3fc;font-size:14px">
                    🔗 ${esc(it.name)}
                  </a>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function renderAdminModal() {
  let dash = [];
  let info = {};
  try {
    dash = await api('/api/admin/dashboard');
    info = await api('/api/admin/questions-info');
  } catch (e) {
    alert(e.message);
    return;
  }

  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>👨‍👩‍👧 家長看板與管理中心</h2>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>

        <div class="study-card-block">
          <h3>學生學習狀況總覽</h3>
          ${dash.map(s => `
            <div style="background:#1f1c1a;padding:12px;border-radius:10px;margin-bottom:8px">
              <b>${esc(s.display_name)}（帳號：${esc(s.username)}）</b>
              <div style="font-size:13px;color:#a8a29e;margin-top:4px">
                作答數：${s.total_attempts} 題 · 答對率：${s.accuracy !== null ? s.accuracy + '%' : '—'} · 7天錯題：${s.wrong7} 題
              </div>
              <div style="margin-top:8px">
                <button class="btn-danger" onclick="deleteStudent(${s.id}, '${esc(s.display_name)}')">刪除帳號</button>
              </div>
            </div>
          `).join('') || '<p style="color:#a8a29e">尚未建立學生帳號。</p>'}
        </div>

        <div class="study-card-block">
          <h3>建立新學生帳號</h3>
          <div class="form-group">
            <label>帳號 (英文)</label>
            <input class="form-input" id="new-stu-user" placeholder="例如：student1">
          </div>
          <div class="form-group">
            <label>顯示名稱 (姓名)</label>
            <input class="form-input" id="new-stu-name" placeholder="例如：小明">
          </div>
          <div class="form-group">
            <label>密碼 (至少 6 碼)</label>
            <input class="form-input" id="new-stu-pwd" type="password">
          </div>
          <button class="btn-primary" onclick="createStudent()">建立學生</button>
        </div>

        <div class="study-card-block">
          <h3>題庫更新</h3>
          <p style="font-size:13px;color:#a8a29e">目前版本：${esc(info.version)}，匯入時間：${esc(info.imported_at || '初次建庫')}</p>
          <div class="form-group">
            <label>題庫 raw JSON 網址</label>
            <input class="form-input" id="new-q-url" placeholder="留空使用預設來源">
          </div>
          <button class="btn-ghost" onclick="checkUpdateQuestions()">檢查並更新題庫</button>
        </div>
      </div>
    </div>
  `;
}

async function createStudent() {
  const u = document.getElementById('new-stu-user').value.trim();
  const d = document.getElementById('new-stu-name').value.trim();
  const p = document.getElementById('new-stu-pwd').value.trim();
  try {
    await api('/api/admin/users', { method: 'POST', body: JSON.stringify({ username: u, display_name: d, password: p }) });
    alert('學生帳號建立成功！');
    renderAdminModal();
  } catch (e) {
    alert(e.message);
  }
}

async function deleteStudent(id, name) {
  if (!confirm(`確定要刪除學生「${name}」嗎？所有進度、星星與錯題紀錄將永久清除。`)) return;
  try {
    await api(`/api/admin/users/${id}/delete`, { method: 'POST', body: JSON.stringify({}) });
    alert('學生已刪除');
    renderAdminModal();
  } catch (e) {
    alert(e.message);
  }
}

async function checkUpdateQuestions() {
  const url = document.getElementById('new-q-url').value.trim();
  try {
    const res = await api('/api/admin/check-updates', { method: 'POST', body: JSON.stringify({ url }) });
    alert(`題庫更新完成！版本 ${res.version}，保留 ${res.attempts_preserved} 筆學生作答。`);
    location.reload();
  } catch (e) {
    alert(e.message);
  }
}

function renderUserMenuModal() {
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog" style="max-width:400px" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>個人設定</h2>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>
        <div style="font-size:15px;color:#d6d3d1">
          <b>${esc(me?.display_name || me?.username)}</b>
          <span style="color:#a8a29e">（${me?.role === 'admin' ? '管理員 / 家長' : '學生'}）</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
          <button class="btn-ghost" onclick="renderChangePasswordModal(false)">更改密碼</button>
          <button class="btn-danger" onclick="logout()">登出帳號</button>
        </div>
      </div>
    </div>
  `;
}

function renderLoginModal() {
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-dialog" style="max-width:440px">
        <div class="modal-header">
          <h2>登入學習島</h2>
        </div>
        <p style="font-size:14px;color:#a8a29e;margin:0">
          每個學生用自己的帳號登入，進度、星星與錯題分開記錄，在 iPad 或筆電登入同一個帳號即可同步。
        </p>
        <div class="form-group">
          <label>帳號</label>
          <input class="form-input" id="login-u" autocomplete="username">
        </div>
        <div class="form-group">
          <label>密碼</label>
          <input class="form-input" id="login-p" type="password" autocomplete="current-password">
        </div>
        <p id="login-err" style="color:var(--bad);font-size:13px;margin:0"></p>
        <button class="btn-primary" onclick="doLogin()">登入</button>
      </div>
    </div>
  `;
}

async function doLogin() {
  const u = document.getElementById('login-u').value.trim();
  const p = document.getElementById('login-p').value.trim();
  try {
    me = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
    closeModal();
    boot();
  } catch (e) {
    document.getElementById('login-err').textContent = e.message;
  }
}

function renderChangePasswordModal(firstLogin) {
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-dialog" style="max-width:440px">
        <div class="modal-header">
          <h2>${firstLogin ? '首次登入請先更改密碼' : '更改密碼'}</h2>
          ${firstLogin ? '' : '<button class="btn-nav-close" onclick="closeModal()">✕</button>'}
        </div>
        <div class="form-group">
          <label>目前舊密碼</label>
          <input class="form-input" id="pw-old" type="password">
        </div>
        <div class="form-group">
          <label>新密碼（至少 6 個字元）</label>
          <input class="form-input" id="pw-new" type="password">
        </div>
        <p id="pw-err" style="color:var(--bad);font-size:13px;margin:0"></p>
        <button class="btn-primary" onclick="doChangePassword()">確認變更</button>
      </div>
    </div>
  `;
}

async function doChangePassword() {
  const o = document.getElementById('pw-old').value;
  const n = document.getElementById('pw-new').value;
  try {
    await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ old_password: o, new_password: n }) });
    alert('密碼變更成功，請重新登入！');
    location.reload();
  } catch (e) {
    document.getElementById('pw-err').textContent = e.message;
  }
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
  location.reload();
}

function closeModal(event) {
  if (event && event.target && !event.target.classList.contains('modal-overlay')) return;
  modalContainer.innerHTML = '';
}

// 啟動執行
boot();
