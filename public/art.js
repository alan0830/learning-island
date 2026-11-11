'use strict';
/* 學習島群島插畫：底座六角島嶼 + 七科代表物向量藝術 (SVG) */

const BASE_ISLAND = `
  <path d="M12 102 l24-14 h68 l24 14 -14 18 H26 z" fill="#e5d0a1"/>
  <path d="M26 98 l18-12 h52 l18 12 -12 10 H38 z" fill="#88be67"/>
  <path d="M44 86 h52 l18 12 H26 z" fill="#a4d17c"/>
`;

const SUBJECT_ART = {
  // 國文：書卷、毛筆、墨寶
  chi: `
    <!-- 書卷底本 -->
    <rect x="42" y="44" width="56" height="40" rx="5" fill="#fdfaf3" stroke="#2c3e50" stroke-width="2.5"/>
    <path d="M70 44 v40" stroke="#d5c8b5" stroke-width="2" stroke-dasharray="2 3"/>
    <path d="M48 54 h16 M48 62 h16 M48 70 h12 M76 54 h16 M76 62 h16 M76 70 h12" stroke="#4a5568" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 紅色印章 -->
    <rect x="80" y="66" width="10" height="10" rx="2" fill="#e53e3e"/>
    <!-- 毛筆 -->
    <path d="M98 24 L72 68" stroke="#8c5836" stroke-width="4" stroke-linecap="round"/>
    <polygon points="72,68 68,76 76,72" fill="#2d3748"/>
    <circle cx="98" cy="24" r="3" fill="#d69e2e"/>
  `,

  // 英文：對話氣泡、地球儀、ABC
  eng: `
    <!-- 地球儀底座 -->
    <ellipse cx="94" cy="74" rx="14" ry="5" fill="#a0aec0"/>
    <path d="M94 74 v-8 M94 40 a16 16 0 0 1 0 26" fill="none" stroke="#4a5568" stroke-width="3"/>
    <!-- 地球儀球體 -->
    <circle cx="94" cy="53" r="14" fill="#63b3ed" stroke="#2b6cb0" stroke-width="2"/>
    <path d="M83 50 q8-6 16 1 M86 58 q10 5 18-2" fill="none" stroke="#68d391" stroke-width="2.5"/>
    <!-- 對話泡泡 ABC -->
    <rect x="30" y="32" width="46" height="34" rx="10" fill="#ffffff" stroke="#2d3748" stroke-width="2.5"/>
    <polygon points="42,66 38,76 50,66" fill="#ffffff"/>
    <polygon points="42,66 38,76 50,66" fill="none" stroke="#2d3748" stroke-width="2.5" stroke-linejoin="round"/>
    <text x="53" y="55" font-family="'Fredoka', 'Nunito', sans-serif" font-weight="bold" font-size="16" fill="#4f46e5" text-anchor="middle">ABC</text>
  `,

  // 數學：三角板、圓規、運算符號
  math: `
    <!-- 三角板 (黃色透明感) -->
    <polygon points="38,82 86,30 92,82" fill="#fbd38d" stroke="#c05621" stroke-width="2.5"/>
    <polygon points="52,76 78,50 82,76" fill="#88be67" opacity="0.6"/>
    <!-- 圓規 -->
    <path d="M58 24 L48 66 M58 24 L68 66" stroke="#2b6cb0" stroke-width="3" stroke-linecap="round"/>
    <circle cx="58" cy="24" r="3.5" fill="#e53e3e"/>
    <path d="M52 46 h12" stroke="#718096" stroke-width="2"/>
    <!-- 浮動數學符號 -->
    <text x="96" y="44" font-family="'JetBrains Mono', sans-serif" font-weight="bold" font-size="16" fill="#dd6b20">π</text>
    <text x="32" y="48" font-family="'JetBrains Mono', sans-serif" font-weight="bold" font-size="18" fill="#3182ce">∑</text>
  `,

  // 生物：幼苗、細胞核、陽光
  bio: `
    <!-- 溫暖陽光 -->
    <circle cx="104" cy="30" r="11" fill="#f6ad55"/>
    <path d="M104 14 v4 M104 42 v4 M88 30 h4 M116 30 h4" stroke="#f6ad55" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 萌芽幼苗 -->
    <path d="M68 94 V62" stroke="#744210" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M68 66 C46 64 38 42 46 30 c18 0 30 14 22 36 z" fill="#48bb78" stroke="#276749" stroke-width="2"/>
    <path d="M68 76 c18-2 26-16 22-26 -12 0-22 10-22 26 z" fill="#68d391" stroke="#276749" stroke-width="1.5"/>
    <!-- 漂浮細胞小胞 -->
    <ellipse cx="38" cy="62" rx="14" ry="10" fill="#fed7e2" stroke="#b83280" stroke-width="2"/>
    <circle cx="39" cy="61" r="4.5" fill="#97266d"/>
  `,

  // 歷史：古城樓、石碑、旗幟
  his: `
    <!-- 古城樓主體 -->
    <rect x="50" y="46" width="40" height="38" rx="2" fill="#d69e2e" stroke="#2d3748" stroke-width="2.5"/>
    <!-- 拱門 -->
    <path d="M62 84 v-14 a8 8 0 0 1 16 0 v14 z" fill="#2d3748"/>
    <!-- 瓦片屋頂 -->
    <polygon points="42,46 70,28 98,46" fill="#9b2c2c" stroke="#2d3748" stroke-width="2.5"/>
    <!-- 城垛 -->
    <rect x="48" y="42" width="6" height="5" fill="#b7791f"/>
    <rect x="67" y="42" width="6" height="5" fill="#b7791f"/>
    <rect x="86" y="42" width="6" height="5" fill="#b7791f"/>
    <!-- 飄揚錦旗 -->
    <path d="M70 28 v-16 M70 12 h14 l-4 6 4 6 h-14" fill="#e53e3e" stroke="#742a2a" stroke-width="1.8"/>
  `,

  // 地理：等高線、羅盤指南針、山峰
  geo: `
    <!-- 背景山脈 -->
    <polygon points="34,84 56,48 78,84" fill="#a0aec0" stroke="#2d3748" stroke-width="2"/>
    <polygon points="56,48 50,58 56,62 62,56" fill="#edf2f7"/>
    <!-- 羅盤圓盤 -->
    <circle cx="86" cy="56" r="22" fill="#ebf8ff" stroke="#2b6cb0" stroke-width="2.5"/>
    <circle cx="86" cy="56" r="18" fill="none" stroke="#bee3f8" stroke-width="1.5"/>
    <path d="M86 38 v4 M86 70 v4 M68 56 h4 M100 56 h4" stroke="#2b6cb0" stroke-width="2"/>
    <!-- 指南針紅藍針 -->
    <polygon points="86,41 90,56 86,53 82,56" fill="#e53e3e"/>
    <polygon points="86,71 90,56 86,59 82,56" fill="#3182ce"/>
    <circle cx="86" cy="56" r="2.5" fill="#2d3748"/>
  `,

  // 公民：天平、法典、民主愛心
  civ: `
    <!-- 天平立柱 -->
    <path d="M70 34 v46 M58 80 h24" stroke="#2d3748" stroke-width="3" stroke-linecap="round"/>
    <circle cx="70" cy="34" r="4" fill="#d69e2e"/>
    <!-- 橫桿天平臂 -->
    <path d="M44 40 l26 -4 l26 4" stroke="#2d3748" stroke-width="3" stroke-linecap="round"/>
    <!-- 左托盤 -->
    <path d="M44 40 l-8 16 h16 z" fill="none" stroke="#4a5568" stroke-width="1.5"/>
    <path d="M34 56 a10 6 0 0 0 20 0 z" fill="#f6e05e" stroke="#2d3748" stroke-width="2"/>
    <!-- 右托盤 -->
    <path d="M96 40 l-8 16 h16 z" fill="none" stroke="#4a5568" stroke-width="1.5"/>
    <path d="M86 56 a10 6 0 0 0 20 0 z" fill="#f6e05e" stroke="#2d3748" stroke-width="2"/>
    <!-- 象徵和諧的愛心標誌 -->
    <path d="M70 20 c-3-4 -7-2 -7 2 c0 4 7 8 7 8 s7-4 7-8 c0-4 -4-6 -7-2 z" fill="#ed64a6"/>
  `
};

window.renderIslandSVG = function(subjectId) {
  const art = SUBJECT_ART[subjectId] || SUBJECT_ART.bio;
  return `<svg class="isle-pedestal" viewBox="0 0 140 126" aria-hidden="true">${BASE_ISLAND}${art}</svg>`;
};

