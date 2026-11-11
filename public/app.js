'use strict';
/* 學習島：國中群島學習平臺前端核心
 * 靈感來自 bio-islands.netlify.app
 * 整合 7 科 25 章 300 題題庫、SQLite 弱點引擎、3D 低多邊形群島與沉浸式學習抽屜
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

function speak(text, btn, lang) {
  if (!('speechSynthesis' in window)) {
    alert('您的瀏覽器不支援語音朗讀功能');
    return;
  }
  window.speechSynthesis.cancel();
  const clean = String(text || '').replace(/<[^>]+>/g, '').replace(/[•·*]/g, '');
  const u = new SpeechSynthesisUtterance(clean);
  const isPureEnglish = /^[A-Za-z\s.,?!'’"\d/-]+$/.test(clean.trim());
  u.lang = lang || (isPureEnglish ? 'en-US' : 'zh-TW');
  u.rate = isPureEnglish ? 0.9 : 0.95;
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
  const totalQ = content?.questions_count || 300;

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

    ${currentSubject.id === 'patty' ? `
      <!-- Patty 英文特訓專區工具箱 -->
      <div class="patty-hub-banner">
        <div class="patty-hub-title">
          <b>🎓 Patty 英文實戰特訓中心</b>
          <span class="patty-hub-badge">全功能整合</span>
        </div>
        <p class="patty-hub-desc">
          完整整合 pattyexam.netlify.app 內容：1,431 翰林全單字、1,233 康軒單字、866 會考歷屆試題單字、全套文法學習單與閃卡練習。
        </p>
        <div class="patty-hub-actions">
          <button class="btn-patty-pri" onclick="openPattyDictionary()">
            🔍 單字檢索字典
          </button>
          <button class="btn-patty-sec" onclick="openPattyFlashcards()">
            🗂️ 單字閃卡練習
          </button>
          <button class="btn-patty-sec" onclick="openPattyGrammarManual()">
            📖 翰林六冊文法手冊
          </button>
        </div>
      </div>
    ` : ''}

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
        <span style="color:#a8a29e">· 已掌握 ${ch.mastered || 0}/${ch.total_questions || 12} 題${ch.accuracy !== null && ch.accuracy !== undefined ? ` · 答對率 ${ch.accuracy}%` : ''}</span>
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
      開始挑戰・${ch.total_questions || 12} 題闖關
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
  const ratio = total > 0 ? score / total : 0;
  const starsEarned = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.25 ? 1 : 0;

  if (window.Island3D && starsEarned >= 2) {
    window.Island3D.celebrate(quizState.chapterId);
  }

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

  const totalStudents = dash.length;
  const totalAttempts = dash.reduce((a, s) => a + (s.total_attempts || 0), 0);
  const totalStars = dash.reduce((a, s) => a + (s.total_stars || 0), 0);
  const totalWrong7 = dash.reduce((a, s) => a + (s.wrong7 || 0), 0);

  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog modal-wide" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 style="display:flex;align-items:center;gap:8px">
              👨‍👩‍👧 家長看板與學習中心
            </h2>
            <p style="margin:4px 0 0;font-size:13px;color:#a8a29e">
              即時掌握小朋友作答歷程、錯題分析、各科星星與弱點補強
            </p>
          </div>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>

        <!-- 全體統計摘要列 -->
        <div class="parent-summary-bar">
          <div class="parent-summary-item">
            <div class="num">${totalStudents}</div>
            <div class="lbl">👨‍🎓 註冊學生</div>
          </div>
          <div class="parent-summary-item">
            <div class="num">${totalAttempts}</div>
            <div class="lbl">📝 累計作答題數</div>
          </div>
          <div class="parent-summary-item">
            <div class="num">${totalStars}</div>
            <div class="lbl">⭐ 全島累積星星</div>
          </div>
          <div class="parent-summary-item">
            <div class="num" style="color:${totalWrong7 ? 'var(--bad)' : 'var(--good)'}">${totalWrong7}</div>
            <div class="lbl">⚠️ 7天待加強錯題</div>
          </div>
        </div>

        <!-- 學生學習卡片列表 -->
        <div class="study-card-block">
          <h3>👦 小朋友學習檔案與紀錄分析</h3>
          ${dash.length ? dash.map(s => {
            const initial = (s.display_name || s.username || '?').charAt(0).toUpperCase();
            return `
              <div class="student-card">
                <div class="student-card-header">
                  <div class="student-info-main">
                    <div class="student-avatar">${esc(initial)}</div>
                    <div class="student-name-block">
                      <b>${esc(s.display_name)}</b>
                      <span>（帳號：${esc(s.username)}）</span>
                    </div>
                  </div>
                  <div class="student-card-actions">
                    <button class="btn-primary" onclick="viewStudentDetail(${s.id})">
                      🔍 查看使用記錄與錯題分析
                    </button>
                    <button class="btn-ghost" onclick="resetStudentPasswordPrompt(${s.id}, '${esc(s.display_name)}')">
                      🔑 重設密碼
                    </button>
                    <button class="btn-danger" onclick="deleteStudent(${s.id}, '${esc(s.display_name)}')">
                      🗑️ 刪除
                    </button>
                  </div>
                </div>

                <div class="student-metrics-grid">
                  <div class="metric-pill">
                    <div class="v">${s.total_attempts} 題</div>
                    <div class="k">累計作答</div>
                  </div>
                  <div class="metric-pill">
                    <div class="v">${s.accuracy !== null ? s.accuracy + '%' : '—'}</div>
                    <div class="k">整體答對率</div>
                  </div>
                  <div class="metric-pill">
                    <div class="v" style="color:var(--star)">★ ${s.total_stars || 0}</div>
                    <div class="k">累積星星</div>
                  </div>
                  <div class="metric-pill">
                    <div class="v" style="color:${s.wrong7 ? 'var(--bad)' : 'var(--good)'}">${s.wrong7} 題</div>
                    <div class="k">近7天錯題</div>
                  </div>
                </div>

                ${(s.repeated_concepts && s.repeated_concepts.length) || (s.top_error_chapters && s.top_error_chapters.length) ? `
                  <div class="student-weak-tags">
                    <b>⚠️ 待加強弱點：</b>
                    ${(s.repeated_concepts || []).slice(0, 3).map(c => `
                      <span class="tag">常錯觀念：${esc(c.concept)} (${c.wrong}次)</span>
                    `).join('')}
                    ${(s.top_error_chapters || []).slice(0, 2).map(c => {
                      const ch = (content?.chapters || []).find(x => x.id === c.chapter_id);
                      const title = ch ? String(ch.title).replace(/^第\s*\d+\s*章\s*/, '') : c.chapter_id;
                      return `<span class="tag">錯誤率高：${esc(title)} (${Math.round(c.rate * 100)}%)</span>`;
                    }).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('') : `
            <div style="text-align:center;padding:24px;color:#a8a29e">
              目前尚未建立學生帳號，請在下方建立小朋友的第一個帳號！
            </div>
          `}
        </div>

        <!-- 建立新學生帳號 -->
        <div class="study-card-block">
          <h3>➕ 建立新學生帳號</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px">
            <div class="form-group" style="margin:0">
              <label>帳號 (英文/數字)</label>
              <input class="form-input" id="new-stu-user" placeholder="例如：student1">
            </div>
            <div class="form-group" style="margin:0">
              <label>顯示名稱 (姓名或小名)</label>
              <input class="form-input" id="new-stu-name" placeholder="例如：小明">
            </div>
            <div class="form-group" style="margin:0">
              <label>登入密碼 (至少 6 碼)</label>
              <input class="form-input" id="new-stu-pwd" type="password" placeholder="例如：123456">
            </div>
          </div>
          <button class="btn-primary" style="margin-top:12px" onclick="createStudent()">確認建立學生</button>
        </div>

        <!-- 題庫管理 -->
        <div class="study-card-block">
          <h3>🔄 題庫管理與線上更新</h3>
          <p style="font-size:13px;color:#a8a29e;margin:0 0 10px">
            目前版本：<b>版本 ${esc(info.version)}</b> · 匯入時間：${esc(info.imported_at || '系統初始建置')}
          </p>
          <div class="form-group" style="margin-bottom:8px">
            <label>題庫 raw JSON 網址（可自訂 GitHub Raw 連結）</label>
            <input class="form-input" id="new-q-url" placeholder="留空使用預設來源">
          </div>
          <button class="btn-ghost" onclick="checkUpdateQuestions()">檢查並更新題庫（不清除學生紀錄）</button>
        </div>
      </div>
    </div>
  `;
}

/* ================= 8. 學生詳細學習檔案視窗（使用記錄 + 錯題簿 + 各科進度） ================= */
let currentDetailStudentId = null;
let currentDetailTab = 'timeline';

async function viewStudentDetail(studentId, tab = 'timeline') {
  currentDetailStudentId = studentId;
  currentDetailTab = tab;

  let detail = null;
  try {
    detail = await api(`/api/admin/users/${studentId}/detail`);
  } catch (e) {
    alert(`取得學生資料失敗：${e.message}`);
    return;
  }

  const { student, stats: sStats, attempts, mistakes } = detail;
  const initial = (student.display_name || student.username || '?').charAt(0).toUpperCase();

  const formatDt = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return iso;
    }
  };

  const chMap = new Map((content?.chapters || []).map(c => [c.id, c]));
  const subMap = new Map((content?.subjects || []).map(s => [s.id, s]));

  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog modal-wide" onclick="event.stopPropagation()">
        <!-- 導航標頭 -->
        <div class="detail-nav-header">
          <div style="display:flex;align-items:center;gap:12px">
            <button class="btn-ghost" onclick="renderAdminModal()" style="padding:6px 12px;font-size:13px">
              ‹ 返回家長看板
            </button>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="student-avatar" style="width:34px;height:34px;font-size:15px">${esc(initial)}</div>
              <div>
                <b style="font-size:17px;color:#fff">${esc(student.display_name)}</b>
                <span style="font-size:12px;color:#a8a29e;margin-left:4px">（帳號：${esc(student.username)}）</span>
              </div>
            </div>
          </div>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>

        <!-- 學生指標卡片列 -->
        <div class="student-metrics-grid">
          <div class="metric-pill">
            <div class="v">${sStats.total_attempts} 題</div>
            <div class="k">總作答題數</div>
          </div>
          <div class="metric-pill">
            <div class="v">${sStats.accuracy !== null ? sStats.accuracy + '%' : '—'}</div>
            <div class="k">整體答對率</div>
          </div>
          <div class="metric-pill">
            <div class="v" style="color:var(--star)">★ ${sStats.total_stars || 0}</div>
            <div class="k">全島星星</div>
          </div>
          <div class="metric-pill">
            <div class="v" style="color:${mistakes.length ? 'var(--bad)' : 'var(--good)'}">
              ${mistakes.length} 題
            </div>
            <div class="k">累計錯題簿</div>
          </div>
        </div>

        <!-- 標籤切換 -->
        <div class="detail-tabs">
          <button class="detail-tab ${currentDetailTab === 'timeline' ? 'active' : ''}"
                  onclick="viewStudentDetail(${studentId}, 'timeline')">
            🕒 作答歷程時間軸 (${attempts.length} 筆)
          </button>
          <button class="detail-tab ${currentDetailTab === 'mistakes' ? 'active' : ''}"
                  onclick="viewStudentDetail(${studentId}, 'mistakes')">
            📕 錯題記錄清單與分析 (${mistakes.length} 題)
          </button>
          <button class="detail-tab ${currentDetailTab === 'subjects' ? 'active' : ''}"
                  onclick="viewStudentDetail(${studentId}, 'subjects')">
            📊 7 科進度與星星分布
          </button>
        </div>

        <!-- 分頁 1：使用記錄時間軸 -->
        ${currentDetailTab === 'timeline' ? `
          <div class="timeline-list">
            ${attempts.length ? attempts.map(a => {
              const ch = chMap.get(a.chapter_id);
              const sub = subMap.get(a.subject_id);
              const chName = ch ? String(ch.title).replace(/^第\s*\d+\s*章\s*/, '') : a.chapter_id;
              const subName = sub ? sub.title : a.subject_id;
              const subColor = sub ? sub.color : '#f97316';
              const isCorrect = a.is_correct === 1;

              return `
                <div class="timeline-card ${isCorrect ? 'correct' : 'wrong'}">
                  <div class="timeline-meta">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                      <span class="timeline-badge ${isCorrect ? 'good' : 'bad'}">
                        ${isCorrect ? '✅ 答對' : '❌ 答錯'}
                      </span>
                      <span style="background:${subColor};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">
                        ${esc(subName)}
                      </span>
                      <span class="timeline-chapter">${esc(chName)}</span>
                      ${a.concept ? `<span style="color:#a8a29e">· 觀念：${esc(a.concept)}</span>` : ''}
                    </div>
                    <span class="timeline-time">${formatDt(a.created_at)}</span>
                  </div>

                  <div class="timeline-stem">
                    <b>題目：</b>${esc(a.stem || '（無題幹資料）')}
                  </div>

                  ${!isCorrect ? `
                    <div class="timeline-expl">
                      <div><b>💡 正確答案：</b>${typeof a.answer === 'number' && a.options && a.options[a.answer] ? `(${'ABCD'[a.answer]}) ${esc(a.options[a.answer])}` : '詳見解析'}</div>
                      <div style="margin-top:4px"><b>解析：</b>${esc(a.explanation || '暫無解析')}</div>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('') : `
              <div style="text-align:center;padding:36px;color:#a8a29e">
                尚無作答紀錄。小朋友開始在島嶼中闖關答題後，這裡會即時記錄每一次的作答歷程與時間！
              </div>
            `}
          </div>
        ` : ''}

        <!-- 分頁 2：錯題記錄清單與分析 -->
        ${currentDetailTab === 'mistakes' ? `
          <div class="mistake-list">
            ${sStats.repeated_concepts && sStats.repeated_concepts.length ? `
              <div class="student-weak-tags" style="background:#271816;border-color:#7f1d1d">
                <b style="color:#fca5a5">⚠️ 重複犯錯的觀念排行：</b>
                ${sStats.repeated_concepts.map(c => `
                  <span class="tag">觀念【${esc(c.concept)}】· 錯 ${c.wrong} 次</span>
                `).join('')}
              </div>
            ` : ''}

            ${mistakes.length ? mistakes.map(m => {
              const ch = chMap.get(m.chapter_id);
              const sub = subMap.get(m.subject_id);
              const chName = ch ? String(ch.title).replace(/^第\s*\d+\s*章\s*/, '') : m.chapter_id;
              const subName = sub ? sub.title : m.subject_id;
              const subColor = sub ? sub.color : '#f97316';

              return `
                <div class="mistake-card">
                  <div class="mistake-header">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                      <span class="mistake-count-badge">
                        ⚠️ 累計答錯 ${m.wrong_count} 次
                      </span>
                      <span style="background:${subColor};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">
                        ${esc(subName)}
                      </span>
                      <span style="color:#fb923c;font-weight:600;font-size:13px">${esc(chName)}</span>
                      ${m.concept ? `<span style="color:#a8a29e;font-size:12px">· 觀念：${esc(m.concept)}</span>` : ''}
                    </div>
                    <span style="color:#78716c;font-size:12px">最近錯於：${formatDt(m.last_wrong_at)}</span>
                  </div>

                  <div style="font-size:14px;color:#fff;line-height:1.5">
                    <b>題幹：</b>${esc(m.stem || '（無題幹資料）')}
                  </div>

                  ${Array.isArray(m.options) && m.options.length ? `
                    <div class="mistake-options-grid">
                      ${m.options.map((opt, i) => {
                        const isAns = i === m.answer;
                        return `
                          <div class="mistake-opt-item ${isAns ? 'is-answer' : ''}">
                            <span style="font-weight:700">${'ABCD'[i]}.</span>
                            <span>${esc(opt)}</span>
                            ${isAns ? '<span style="margin-left:auto;font-size:12px">✓ 正確答案</span>' : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  ` : ''}

                  <div class="timeline-expl">
                    <b>💡 觀念剖析與正解：</b>
                    <p style="margin:4px 0 0;color:#e7e5e4">${esc(m.explanation || '暫無解析')}</p>
                  </div>
                </div>
              `;
            }).join('') : `
              <div style="text-align:center;padding:36px;color:#a8a29e">
                🎉 太棒了！該學生目前沒有任何錯題記錄。
              </div>
            `}
          </div>
        ` : ''}

        <!-- 分頁 3：7 科進度與星星分布 -->
        ${currentDetailTab === 'subjects' ? `
          <div class="subject-stat-grid">
            ${(content?.subjects || []).map(s => {
              const chs = (sStats.chapters || []).filter(c => c.subject_id === s.id);
              const stars = chs.reduce((a, c) => a + (c.stars || 0), 0);
              const maxStars = chs.length * 3;
              const mastered = chs.reduce((a, c) => a + (c.mastered || 0), 0);
              const totalQ = chs.reduce((a, c) => a + (c.total_questions || 12), 0);
              const attempts = chs.reduce((a, c) => a + (c.attempts || 0), 0);
              const accuracy = attempts ? Math.round((chs.reduce((a, c) => a + (c.accuracy ? (c.accuracy * c.attempts / 100) : 0), 0) / attempts)) : null;
              const pct = totalQ ? Math.round((mastered / totalQ) * 100) : 0;

              return `
                <div class="subject-stat-card" style="border-top:3px solid ${s.color}">
                  <div class="subject-stat-top">
                    <b>${s.icon} ${esc(s.title)}島</b>
                    <span>★ ${stars} / ${maxStars}</span>
                  </div>
                  <div style="font-size:12px;color:#a8a29e">
                    共 ${chs.length} 章 · 已掌握 ${mastered} / ${totalQ} 題 (${pct}%)
                  </div>
                  <div class="prog-bar-slim" style="margin:4px 0">
                    <div style="width:${pct}%;background:${s.color}"></div>
                  </div>
                  <div style="font-size:12px;color:#d6d3d1;display:flex;justify-content:space-between;margin-top:2px">
                    <span>作答數：${attempts} 題</span>
                    <span>答對率：${accuracy !== null ? accuracy + '%' : '—'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function resetStudentPasswordPrompt(id, name) {
  const newPwd = prompt(`請輸入為「${name}」設定的新密碼（至少 6 碼）：`);
  if (!newPwd) return;
  if (newPwd.length < 6) {
    alert('密碼至少需要 6 個字元！');
    return;
  }
  try {
    await api(`/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password: newPwd })
    });
    alert(`密碼重設成功！學生下次登入請使用新密碼。`);
  } catch (e) {
    alert(`重設失敗：${e.message}`);
  }
}

async function createStudent() {
  const u = document.getElementById('new-stu-user').value.trim();
  const d = document.getElementById('new-stu-name').value.trim();
  const p = document.getElementById('new-stu-pwd').value.trim();
  if (!u || !p) {
    alert('請填寫帳號與密碼！');
    return;
  }
  if (p.length < 6) {
    alert('密碼至少需要 6 個字元！');
    return;
  }
  try {
    await api('/api/admin/users', { method: 'POST', body: JSON.stringify({ username: u, display_name: d || u, password: p }) });
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

/* ================= 9. PATTY 英文實戰特訓中心互動工具 ================= */
function loadPattyScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

let pattyAllWords = null;
let currentDictFilter = 'all';
let currentFlashcardSet = 'hl_1';
let currentFlashcardIdx = 0;
let currentFlashcardFlipped = false;

async function ensurePattyWords() {
  if (pattyAllWords) return pattyAllWords;
  await Promise.all([
    loadPattyScript('/patty/hl_words.js'),
    loadPattyScript('/patty/kx_words.js'),
    loadPattyScript('/patty/cap_words.js')
  ]);

  const list = [];
  // 翰林
  if (window.HL_WORDS) {
    for (const vol of Object.keys(window.HL_WORDS)) {
      for (const it of window.HL_WORDS[vol]) {
        list.push({
          word: it.w,
          pos: it.p,
          zh: it.m,
          srcGroup: 'hl',
          src: `翰林 B${vol} U${it.u || ''}`,
          context: ''
        });
      }
    }
  }
  // 康軒
  if (Array.isArray(window.KX_WORDS)) {
    for (const it of window.KX_WORDS) {
      list.push({
        word: it.word,
        pos: it.pos,
        zh: it.zh,
        srcGroup: 'kx',
        src: `康軒 ${it.name || ''} ${it.lesson || ''}`,
        context: ''
      });
    }
  }
  // 會考
  if (Array.isArray(window.CAP_WORDS)) {
    for (const it of window.CAP_WORDS) {
      list.push({
        word: it.word,
        pos: it.pos,
        zh: it.zh,
        srcGroup: 'cap',
        src: `國中會考高頻 (出現 ${it.count || 1} 次)`,
        context: it.context || ''
      });
    }
  }

  pattyAllWords = list;
  return pattyAllWords;
}

// 1. Patty 單字檢索字典
async function openPattyDictionary(filter = 'all') {
  currentDictFilter = filter;
  await ensurePattyWords();

  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog modal-wide" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 style="display:flex;align-items:center;gap:8px">
              🔍 Patty 國中英語全能字典（3,500+ 單字）
            </h2>
            <p style="margin:4px 0 0;font-size:13px;color:#a8a29e">
              整合翰林 B1-B6 (1,431字)、康軒 (1,233字) 與會考歷屆考題 (866字)
            </p>
          </div>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>

        <div class="dict-search-box">
          <input class="dict-search-input" id="patty-dict-kw"
                 placeholder="輸入英文單字或中文意思，例如：people、delicious、蘋果..."
                 oninput="onSearchPattyDict()">
          <button class="btn-primary" onclick="onSearchPattyDict()">搜尋</button>
        </div>

        <div class="dict-filter-chips">
          <button class="chip-btn ${currentDictFilter === 'all' ? 'active' : ''}" onclick="openPattyDictionary('all')">全部 (${pattyAllWords.length})</button>
          <button class="chip-btn ${currentDictFilter === 'hl' ? 'active' : ''}" onclick="openPattyDictionary('hl')">翰林全冊 (1,431)</button>
          <button class="chip-btn ${currentDictFilter === 'kx' ? 'active' : ''}" onclick="openPattyDictionary('kx')">康軒全冊 (1,233)</button>
          <button class="chip-btn ${currentDictFilter === 'cap' ? 'active' : ''}" onclick="openPattyDictionary('cap')">會考高頻 (866)</button>
        </div>

        <div class="dict-results-container" id="patty-dict-list">
          ${renderPattyDictItems(pattyAllWords.filter(w => currentDictFilter === 'all' || w.srcGroup === currentDictFilter).slice(0, 50))}
        </div>
      </div>
    </div>
  `;
}

function onSearchPattyDict() {
  const kw = (document.getElementById('patty-dict-kw')?.value || '').trim().toLowerCase();
  const listEl = document.getElementById('patty-dict-list');
  if (!listEl || !pattyAllWords) return;

  const filtered = pattyAllWords.filter(w => {
    if (currentDictFilter !== 'all' && w.srcGroup !== currentDictFilter) return false;
    if (!kw) return true;
    return String(w.word || '').toLowerCase().includes(kw) || String(w.zh || '').includes(kw);
  }).slice(0, 60);

  listEl.innerHTML = renderPattyDictItems(filtered);
}

function renderPattyDictItems(items) {
  if (!items || items.length === 0) {
    return `<div style="text-align:center;padding:32px;color:#a8a29e">找不到符合的單字，請嘗試其他關鍵字。</div>`;
  }
  return items.map(w => `
    <div class="dict-item-card">
      <div class="dict-item-left">
        <div class="dict-item-word">
          <b>${esc(w.word)}</b>
          ${w.pos ? `<span class="dict-pos-tag">${esc(w.pos)}</span>` : ''}
          <span class="dict-src-tag">${esc(w.src)}</span>
        </div>
        <div class="dict-item-zh">${esc(w.zh)}</div>
        ${w.context ? `<div class="dict-item-context">例：${esc(w.context)}</div>` : ''}
      </div>
      <button class="say-btn" onclick="speak('${esc(w.word)}', this, 'en-US')" title="朗讀發音">
        🔊
      </button>
    </div>
  `).join('');
}

// 2. Patty 單字閃卡練習
async function openPattyFlashcards(setName = 'hl_1') {
  currentFlashcardSet = setName;
  currentFlashcardIdx = 0;
  currentFlashcardFlipped = false;
  await ensurePattyWords();

  renderFlashcardModal();
}

function getFlashcardPool(setName) {
  if (!pattyAllWords) return [];
  if (setName.startsWith('hl_')) {
    const vol = setName.replace('hl_', '');
    if (window.HL_WORDS && window.HL_WORDS[vol]) {
      return window.HL_WORDS[vol].map(it => ({
        word: it.w,
        pos: it.p,
        zh: it.m,
        src: `翰林 B${vol} U${it.u || ''}`
      }));
    }
  }
  if (setName === 'cap') {
    return (window.CAP_WORDS || []).map(it => ({
      word: it.word,
      pos: it.pos,
      zh: it.zh,
      src: `國中會考歷屆考題 (出現 ${it.count || 1} 次)`,
      context: it.context || ''
    }));
  }
  if (setName === 'kx') {
    return (window.KX_WORDS || []).slice(0, 150).map(it => ({
      word: it.word,
      pos: it.pos,
      zh: it.zh,
      src: `康軒 ${it.name || ''}`
    }));
  }
  return pattyAllWords.slice(0, 100);
}

function renderFlashcardModal() {
  const pool = getFlashcardPool(currentFlashcardSet);
  const total = pool.length;
  if (currentFlashcardIdx >= total) currentFlashcardIdx = 0;
  if (currentFlashcardIdx < 0) currentFlashcardIdx = total - 1;
  const current = pool[currentFlashcardIdx] || { word: 'None', pos: '', zh: '', src: '' };

  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 style="display:flex;align-items:center;gap:8px">🗂️ Patty 單字閃卡記憶</h2>
            <p style="margin:4px 0 0;font-size:13px;color:#a8a29e">點擊卡片翻面背單字，訓練英中反射神經</p>
          </div>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>

        <div class="dict-filter-chips">
          <button class="chip-btn ${currentFlashcardSet === 'hl_1' ? 'active' : ''}" onclick="openPattyFlashcards('hl_1')">翰林七上 (B1)</button>
          <button class="chip-btn ${currentFlashcardSet === 'hl_2' ? 'active' : ''}" onclick="openPattyFlashcards('hl_2')">翰林七下 (B2)</button>
          <button class="chip-btn ${currentFlashcardSet === 'hl_3' ? 'active' : ''}" onclick="openPattyFlashcards('hl_3')">翰林八上 (B3)</button>
          <button class="chip-btn ${currentFlashcardSet === 'hl_4' ? 'active' : ''}" onclick="openPattyFlashcards('hl_4')">翰林八下 (B4)</button>
          <button class="chip-btn ${currentFlashcardSet === 'cap' ? 'active' : ''}" onclick="openPattyFlashcards('cap')">會考高頻單字</button>
          <button class="chip-btn ${currentFlashcardSet === 'kx' ? 'active' : ''}" onclick="openPattyFlashcards('kx')">康軒精選</button>
        </div>

        <div class="flashcard-wrapper">
          <div class="flashcard-box" onclick="toggleFlashcardFlip()">
            <div style="font-size:12px;color:#818cf8;margin-bottom:6px">
              ${esc(current.src)} · ${currentFlashcardIdx + 1} / ${total}
            </div>
            <div class="flashcard-word">${esc(current.word)}</div>
            ${current.pos ? `<div class="flashcard-sub">${esc(current.pos)}</div>` : ''}

            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <button class="say-btn" onclick="event.stopPropagation(); speak('${esc(current.word)}', this, 'en-US')">
                🔊 聽發音
              </button>
            </div>

            ${currentFlashcardFlipped ? `
              <div class="flashcard-zh">${esc(current.zh)}</div>
              ${current.context ? `<div class="dict-item-context" style="margin-top:8px">${esc(current.context)}</div>` : ''}
              <div class="flashcard-tip">（點擊卡片翻回正面）</div>
            ` : `
              <div class="flashcard-tip">👉 點擊卡片查看中文意思</div>
            `}
          </div>

          <div class="flashcard-nav">
            <button class="btn-ghost" onclick="prevFlashcard()">‹ 上一個</button>
            <button class="btn-primary" onclick="toggleFlashcardFlip()">
              ${currentFlashcardFlipped ? '翻回正面' : '翻面看中文'}
            </button>
            <button class="btn-ghost" onclick="nextFlashcard()">下一個 ›</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleFlashcardFlip() {
  currentFlashcardFlipped = !currentFlashcardFlipped;
  renderFlashcardModal();
}

function nextFlashcard() {
  currentFlashcardIdx++;
  currentFlashcardFlipped = false;
  renderFlashcardModal();
}

function prevFlashcard() {
  currentFlashcardIdx--;
  currentFlashcardFlipped = false;
  renderFlashcardModal();
}

// 3. Patty 翰林六冊文法手冊
let currentGrammarVol = 1;

async function openPattyGrammarManual(vol = 1) {
  currentGrammarVol = vol;
  await loadPattyScript('/patty/hl_grammar.js');

  const contentHtml = (window.HL_GRAMMAR && window.HL_GRAMMAR[currentGrammarVol]) || '<p>尚無該冊文法資料。</p>';

  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-dialog modal-wide" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 style="display:flex;align-items:center;gap:8px">📖 翰林 B1–B6 完整文法手冊</h2>
            <p style="margin:4px 0 0;font-size:13px;color:#a8a29e">來自 Patty 整理之文法活動學習單，涵蓋六冊句型、規則與例句</p>
          </div>
          <button class="btn-nav-close" onclick="closeModal()">✕</button>
        </div>

        <div class="dict-filter-chips">
          <button class="chip-btn ${currentGrammarVol === 1 ? 'active' : ''}" onclick="openPattyGrammarManual(1)">B1（七上）</button>
          <button class="chip-btn ${currentGrammarVol === 2 ? 'active' : ''}" onclick="openPattyGrammarManual(2)">B2（七下）</button>
          <button class="chip-btn ${currentGrammarVol === 3 ? 'active' : ''}" onclick="openPattyGrammarManual(3)">B3（八上）</button>
          <button class="chip-btn ${currentGrammarVol === 4 ? 'active' : ''}" onclick="openPattyGrammarManual(4)">B4（八下）</button>
          <button class="chip-btn ${currentGrammarVol === 5 ? 'active' : ''}" onclick="openPattyGrammarManual(5)">B5（九上）</button>
          <button class="chip-btn ${currentGrammarVol === 6 ? 'active' : ''}" onclick="openPattyGrammarManual(6)">B6（九下）</button>
        </div>

        <div class="patty-grammar-body">
          ${contentHtml}
        </div>
      </div>
    </div>
  `;
}

// 啟動執行
boot();
