'use strict';

const fs = require('fs');
const path = require('path');

const originalPath = path.join(__dirname, '..', 'data', 'questions.json');
const original = JSON.parse(fs.readFileSync(originalPath, 'utf8'));

const modules = [
  require('./data/chi'),
  require('./data/eng'),
  require('./data/math'),
  require('./data/bio'),
  require('./data/his'),
  require('./data/geo'),
  require('./data/civ'),
  require('./data/patty')
];

const allChapters = [];
const allQuestions = [];

for (const mod of modules) {
  allChapters.push(...mod.chapters);
  allQuestions.push(...mod.questions);
}

console.log(`Gathered ${allChapters.length} chapters and ${allQuestions.length} questions.`);

// Validation
if (allChapters.length !== 33) {
  throw new Error(`Expected 33 chapters, got ${allChapters.length}`);
}

if (allQuestions.length !== 396) {
  throw new Error(`Expected 396 questions, got ${allQuestions.length}`);
}

const qMap = new Map();
for (const q of allQuestions) {
  if (qMap.has(q.id)) {
    throw new Error(`Duplicate question id: ${q.id}`);
  }
  qMap.set(q.id, q);

  if (!q.stem || !Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error(`Question ${q.id} must have a stem and exactly 4 options`);
  }
  if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
    throw new Error(`Question ${q.id} has invalid answer index: ${q.answer}`);
  }
  if (!q.explanation || !q.concept || !q.chapter_id || !q.subject_id) {
    throw new Error(`Question ${q.id} missing required fields`);
  }
}

// Check per-chapter question count
for (const ch of allChapters) {
  const chQuestions = allQuestions.filter(q => q.chapter_id === ch.id);
  if (chQuestions.length !== 12) {
    throw new Error(`Chapter ${ch.id} expected 12 questions, found ${chQuestions.length}`);
  }
}

const subjects = [...original.subjects];
if (!subjects.some(s => s.id === 'patty')) {
  subjects.push({
    id: "patty",
    title: "Patty 英文特訓",
    desc: "會考・翰林全冊・文法實戰・英檢字彙",
    color: "#4f46e5",
    icon: "🅰️"
  });
}

const compiled = {
  version: 4,
  title: "學習島嶼題庫（七年級翰林版 + Patty 英文特訓島）",
  note: "依據臺灣 108 課綱教材與 Patty 英文會考/英檢專題整合，收錄 8 大科目、33 大單元、共 396 道核心題庫與素養精選詳解。",
  subjects,
  chapters: allChapters,
  questions: allQuestions,
  resources: original.resources,
  video_resources: original.video_resources
};

fs.writeFileSync(originalPath, JSON.stringify(compiled, null, 2), 'utf8');
console.log('Successfully compiled data/questions.json with 33 chapters and 396 questions!');

