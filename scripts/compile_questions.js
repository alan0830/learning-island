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
  require('./data/civ')
];

const allChapters = [];
const allQuestions = [];

for (const mod of modules) {
  allChapters.push(...mod.chapters);
  allQuestions.push(...mod.questions);
}

console.log(`Gathered ${allChapters.length} chapters and ${allQuestions.length} questions.`);

// Validation
if (allChapters.length !== 25) {
  throw new Error(`Expected 25 chapters, got ${allChapters.length}`);
}

if (allQuestions.length !== 300) {
  throw new Error(`Expected 300 questions, got ${allQuestions.length}`);
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

const compiled = {
  version: 3,
  title: "學習島嶼題庫（七年級翰林版）",
  note: "依據臺灣 108 課綱國中七年級上學期翰林版教材精心編寫，收錄 7 大科目、25 大單元、共 300 道會考核心題庫與素養精選詳解。",
  subjects: original.subjects,
  chapters: allChapters,
  questions: allQuestions,
  resources: original.resources,
  video_resources: original.video_resources
};

fs.writeFileSync(originalPath, JSON.stringify(compiled, null, 2), 'utf8');
console.log('Successfully compiled data/questions.json with 25 chapters and 300 questions!');

