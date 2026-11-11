'use strict';

module.exports = {
  chapters: [
    {
      id: "math1",
      subject_id: "math",
      title: "第 1 章 數與數線",
      subtitle: "正負數意義、數線三要素、相反數、絕對值與整數四則運算",
      exam_focus: true,
      key_points: [
        "正負數的相對性意義：以某基準點（0）為界，表示具有「相反意義的量」（如收入為正、支出為負；海平面以上為正、海平面以下為負；東方為正、西方為負）。",
        "數線三要素：原點（0 的位置）、正向（通常以向右箭頭表示）、單位長（刻度間固定長度），三者缺一不可。",
        "相反數的性質：若兩數只有正負號不同，則互為相反數（$a$ 與 $-a$）；相反數之和必為 0（$a + (-a) = 0$）；在數線上，互為相反數的兩點到原點距離相等。",
        "絕對值的幾何意義：數線上某點到原點的距離稱為該數的絕對值，記作 $|a|$。距離恆大於或等於 0（$|a| \\ge 0$）；兩點 $A(a)、B(b)$ 的距離為 $|a - b|$。",
        "整數四則運算正負號律：同號相乘除得正（$(+) \\times (+) = (+)$、$(-) \\times (-) = (+)$）；異號相乘除得負（$(+) \\times (-) = (-)$）。減去一個負數等於加上它的相反數（$a - (-b) = a + b$）。",
        "去括號與分配律：$a(b + c) = ab + ac$；括號前為負號時，去括號後裡面各項必須變號，$-(a - b + c) = -a + b - c$。"
      ],
      common_mistakes: [
        "負數比大小的盲區：負數的絕對值越大，在數線上越偏左邊，其數值反而「越小」！（例如：$-10 < -2$）。",
        "絕對值的解不唯一：若 $|x| = 7$，則 $x = 7$ 或 $x = -7$（切勿漏掉負數解）。若 $|x| = -3$，則此方程式「無解」（因為距離不可能為負）。",
        "減法非乘法，勿死背口訣：計算 $(-3) - 5$ 是負數再往左移動 5 單位，結果為 $-8$，不可誤用乘法「負負得正」口訣寫成 $+8$！"
      ],
      think: "若數線上有一點 $A(-5)$，如果要走到與 $A$ 點距離為 8 個單位長的位置，你總共有幾種走法？最後停在哪些點上？"
    },
    {
      id: "math2",
      subject_id: "math",
      title: "第 2 章 標準分解式與分數運算",
      subtitle: "質數與合數、質因數分解、最大公因數、最小公倍數與分數運算",
      exam_focus: true,
      key_points: [
        "質數與合數的精確定義：大於 1 的正整數中，除了 1 與本身之外沒有其他因數者稱為「質數」（2 是唯一偶數質數，也是最小的質數）；除了 1 與本身還有其他因數者稱為「合數」。注意：1 既不是質數也不是合數！",
        "標準分解式寫法：將大於 1 的整數分解為質因數的乘積，底數由小到大排列，相同質因數寫成次方形式（例如：$360 = 2^3 \\times 3^2 \\times 5$）。",
        "最大公因數（GCD）取法：以標準分解式判斷時，取「共同的質因數」，次方取「最小（低）者」；記作 $(a, b)$。若 $(a, b) = 1$，稱 $a$ 與 $b$ 互質。",
        "最小公倍數（LCM）取法：取「所有出現過的質因數」，次方取「最大（高）者」；記作 $[a, b]$。兩數乘積等於其最大公因數與最小公倍數的乘積：$a \\times b = (a, b) \\times [a, b]$。",
        "分數的四則混合運算：加減法先通分（找分母的最小公倍數）；乘法分子分母先約分後再相乘；除以一個分數等於乘以該分數的「倒數」（分母分子顛倒）。",
        "倒數與相反數之區別：兩數乘積為 1 互為倒數（$a \\times \\frac{1}{a} = 1$，$0$ 沒有倒數）；兩數相加為 0 互為相反數。"
      ],
      common_mistakes: [
        "常將 1 誤認為質數：1 只有一個因數（就是它自己），質數必須「恰好有兩個正因數」，故 1 不是質數！",
        "倒數與相反數符號混淆：負分數的倒數符號不變！例如 $-\\frac{3}{5}$ 的倒數是 $-\\frac{5}{3}$（而非正數）；相反數才是 $+\\frac{3}{5}$。",
        "分配律運算盲點：除法對加法沒有右分配律！$(a + b) \\div c = a \\div c + b \\div c$，但 $c \\div (a + b) \\ne c \\div a + c \\div b$！"
      ],
      think: "兩數 $A = 2^2 \\times 3^3 \\times 5$ 與 $B = 2^3 \\times 3^2 \\times 7$。試著不算出它們的乘積數字，直接利用質因數標準分解式寫出它們的最大公因數與最小公倍數。"
    },
    {
      id: "math3",
      subject_id: "math",
      title: "第 3 章 一元一次方程式",
      subtitle: "文字代數式化簡、等量公理、移項法則與生活應用問題",
      exam_focus: true,
      key_points: [
        "代數式的簡記慣例：數字與文字相乘時數字寫在前面，乘號可省略（$3 \\times x = 3x$）；$1 \\times x$ 記作 $x$（切勿寫 $1x$）；$-1 \\times x$ 記作 $-x$；$x \\div 4$ 記作 $\\frac{x}{4}$ 或 $\\frac{1}{4}x$。",
        "同類項合併：文字符號及其次方完全相同的項稱為同類項，只有同類項才可以進行加減合併（例如：$5x - 2x = 3x$；$3x + 4$ 不可合併為 $7x$！）。",
        "等量公理四原則：等號兩邊同加、同減、同乘一個數，或同除以一個不為 0 的數，其等式依然成立。移項法則的本質即源自等量公理。",
        "解一元一次方程式的黃金四步驟：(1) 去分母（同乘各分母之最小公倍數）；(2) 去括號（注意分配律與負號變號）；(3) 移項並同類項合併（未知數移到左邊，常數項移到右邊）；(4) 係數化為 1（兩邊同除以未知數的係數）。",
        "一元一次方程式的解型態：通常有一解；若化簡後得到 $0x = 0$，表示有「無限多組解」；若得到 $0x = k$（$k \\ne 0$），表示「無解」。",
        "應用問題列式口訣：設未知數（設所求為 $x$）→ 依題意找相等關係列出等式 → 解方程式 → 檢驗答案的合理性（如人數、年齡、物件數不可為負數或小數）。"
      ],
      common_mistakes: [
        "去分母時未含分母的常數項漏乘：解方程式 $\\frac{x-1}{3} + 2 = \\frac{x+2}{2}$ 時，同乘 6，常數項 2 也必須乘 6 變成 12！漏乘是段考最常出現的致命錯誤。",
        "去括號時負號未完全分配：$-(2x - 3) = -2x + 3$（括號內的負號要變正號），常有學生錯寫成 $-2x - 3$。",
        "應用問題忘記單位換算：例如題目給予「時速」但時間給予「分鐘」，若未先將分鐘換算為小時就直接計算，答案必定錯誤。"
      ],
      think: "爸爸今年的年齡是小明的 3 倍多 2 歲，若 5 年後兩人的年齡和是 52 歲，你如何設未知數 $x$ 並列出一元一次方程式求出小明今年的年齡？"
    },
    {
      id: "math4",
      subject_id: "math",
      title: "第 4 章 線對稱與三視圖",
      subtitle: "線對稱圖形幾何性質、對稱軸、正多邊形規律與空間立體三視圖",
      exam_focus: true,
      key_points: [
        "線對稱圖形定義：若一個平面圖形沿著一條直線對摺後，直線兩側的部分能夠完全重合，此圖形稱為「線對稱圖形」，該直線稱為「對稱軸」。",
        "線對稱核心幾何性質：(1) 對稱軸必「垂直平分」任何一組對稱點的連線段；(2) 對稱線段等長；(3) 對稱角相等；(4) 對稱點到對稱軸的垂直距離相等。",
        "常見平面圖形的對稱軸數量：一般平行四邊形「無」對稱軸；等腰三角形有 1 條；等邊（正）三角形有 3 條；長方形（矩形）有 2 條；菱形有 2 條；正方形有 4 條；圓形有無窮多條（通過圓心的任何直線都是對稱軸）。",
        "正多邊形對稱軸規律：正 $n$ 邊形恰好有 $n$ 條對稱軸（例如正五邊形有 5 條、正六邊形有 6 條、正八邊形有 8 條）。",
        "立體積木的三視圖概念：由前方向後觀察的二維投影稱為「前視圖（正視圖）」；由正上方垂直俯瞰的投影稱為「上視圖（俯視圖）」；由左側或右側觀察的投影稱為「側視圖」。",
        "三視圖繪製對應法則：前視圖與上視圖「長對正」；前視圖與側視圖「高平齊」；上視圖與側視圖「寬相等」。"
      ],
      common_mistakes: [
        "誤以為平行四邊形是線對稱圖形：一般平行四邊形雖然對邊相等、對角相等，但沿著對角線對摺無法重合，它是「中心對稱圖形」而非線對稱圖形！",
        "長方形的對稱軸只有 2 條（兩對邊中點連線），對角線「不是」長方形的對稱軸！只有菱形和正方形的對角線才是對稱軸。",
        "三視圖隱藏積木數量的判定：由前視圖和側視圖看到的柱狀高度代表該列或該行的最大值，不要將未填滿的空格當作實體積木計算。"
      ],
      think: "英文字母（如 A, B, C, D, H, M, O, X）中，哪些是線對稱圖形？其中哪些字母同時擁有垂直與水平兩條對稱軸？"
    }
  ],
  questions: [
    // math1 題庫 (12 題)
    {
      id: "math1-1",
      stem: "若規定「以 70 分為基準，85 分記為 +15 分」，則考試得到 58 分時，應記為多少分？",
      options: ["+12 分", "-12 分", "+18 分", "-18 分"],
      answer: 1,
      explanation: "基準為 70 分，58 分比基準低了 $70 - 58 = 12$ 分，故應記為 $-12$ 分。",
      concept: "正負數之相對量表示",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-2",
      stem: "計算算式 $(-18) + (-6) \\div (-2) - (-5) \\times 3$ 的值為何？",
      options: ["0", "-15", "+15", "-30"],
      answer: 0,
      explanation: "先乘除後加減：$(-6) \\div (-2) = +3$；$(-5) \\times 3 = -15$。原式 $= (-18) + 3 - (-15) = -18 + 3 + 15 = 0$。",
      concept: "整數四則混合運算",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-3",
      stem: "數線上兩點 $A(-8)$ 與 $B(4)$，若 $C$ 點為線段 $AB$ 的中點，則 $C$ 點所代表的數為何？",
      options: ["-2", "-4", "-6", "2"],
      answer: 0,
      explanation: "數線上兩點 $A(a)、B(b)$ 的中點公式為 $\\frac{a + b}{2}$。故中點 $C = \\frac{-8 + 4}{2} = \\frac{-4}{2} = -2$。",
      concept: "數線中點公式",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-4",
      stem: "若 $|x - 3| = 7$，則 $x$ 的可能值為何？",
      options: ["10", "-4", "10 或 -4", "-10 或 4"],
      answer: 2,
      explanation: "$|x - 3| = 7$ 表示 $x - 3 = 7$ 或 $x - 3 = -7$。解得 $x = 10$ 或 $x = -4$。",
      concept: "絕對值方程式求解",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-5",
      stem: "比較四個負數：$a = -3.5, b = -3.2, c = -4, d = -2.9$，下列大小關係何者正確？",
      options: ["c > a > b > d", "d > b > a > c", "c > d > b > a", "d < b < a < c"],
      answer: 1,
      explanation: "負數的絕對值越大其值越小。各數絕對值為 $|c|=4 > |a|=3.5 > |b|=3.2 > |d|=2.9$，因此數值大小順序為 $d > b > a > c$。",
      concept: "負數大小比較規律",
      difficulty: "basic",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-6",
      stem: "計算算式 $25 \\times (-99)$ 最簡捷的算法為利用乘法分配律將 $-99$ 拆成：",
      options: ["25 × (-100 + 1)", "25 × (-100 - 1)", "25 × (-90 - 9)", "25 × (100 - 1)"],
      answer: 0,
      explanation: "$-99 = -100 + 1$，故 $25 \\times (-99) = 25 \\times (-100 + 1) = -2500 + 25 = -2475$。",
      concept: "乘法分配律之巧妙應用",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-7",
      stem: "若 $a < 0 < b$，且 $|a| > |b|$，則下列哪一個式子的運算結果必為「正數」？",
      options: ["a + b", "a - b", "b - a", "a × b"],
      answer: 2,
      explanation: "已知 $b > 0$ 且 $a < 0$，大數減小數必定為正數，故 $b - a > 0$ 恆成立。其他選項：$a+b<0$（因為負的絕對值較大）、$a-b<0$、$a \\times b < 0$。",
      concept: "正負數運算符號綜合推理",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-8",
      stem: "數線上有 $A(-12)、B(x)、C(6)$ 三點，已知 $B$ 到 $A$ 的距離是 $B$ 到 $C$ 距離的 2 倍，且 $B$ 介於 $A$ 與 $C$ 之間，則 $x$ 的值為何？",
      options: ["-6", "0", "-2", "4"],
      answer: 1,
      explanation: "$A$ 到 $C$ 總距離為 $|6 - (-12)| = 18$。$B$ 介於兩者之間且將長度分成 $2:1$，故 $AB$ 長度為 $18 \\times \\frac{2}{3} = 12$。由 $A(-12)$ 往右 12 單位：$-12 + 12 = 0$，故 $x = 0$。",
      concept: "數線比例距離問題",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-9",
      stem: "計算 $(-1)^1 + (-1)^2 + (-1)^3 + \\dots + (-1)^{100}$ 的總和為多少？",
      options: ["-100", "0", "100", "-1"],
      answer: 1,
      explanation: "$-1$ 的奇數次方為 $-1$，偶數次方為 $+1$。每兩項相加 $(-1) + 1 = 0$。共 100 項恰好分成 50 組零，總和為 0。",
      concept: "負數的次方規律",
      difficulty: "basic",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-10",
      stem: "若已知 $|a| + |b - 2| + |c + 5| = 0$，則 $a + b + c$ 的值為何？",
      options: ["-3", "3", "7", "-7"],
      answer: 0,
      explanation: "因為任何數的絕對值恆大於或等於 0，三個非負數相加為 0，代表每一項都必須為 0！故 $a = 0, b - 2 = 0 \\Rightarrow b = 2, c + 5 = 0 \\Rightarrow c = -5$。$a + b + c = 0 + 2 + (-5) = -3$。",
      concept: "絕對值非負性質",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-11",
      stem: "下列有關相反數的敘述，何者「錯誤」？",
      options: [
        "0 的相反數是 0",
        "任何數和它的相反數相加必等於 0",
        "互為相反數的兩數乘積一定為負數",
        "在數線上，互為相反數的兩數到原點等距離"
      ],
      answer: 2,
      explanation: "若此數為 0，其相反數為 0，則兩者相乘 $0 \\times 0 = 0$（0 既非正數亦非負數），因此「一定為負數」的說法錯誤。",
      concept: "相反數嚴謹觀念審視",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math1"
    },
    {
      id: "math1-12",
      stem: "玉山北峰氣象站測得清晨氣溫為 $-4.8^\\circ\\text{C}$，到了正午氣溫上升了 $8.5^\\circ\\text{C}$，入夜後又下降了 $6.2^\\circ\\text{C}$，則入夜後的氣溫為多少？",
      options: ["-2.5°C", "-0.5°C", "+2.5°C", "-1.5°C"],
      answer: 0,
      explanation: "列式：$(-4.8) + 8.5 - 6.2 = 3.7 - 6.2 = -2.5^\\circ\\text{C}$。",
      concept: "正負小數運算生活情境題",
      difficulty: "basic",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math1"
    },

    // math2 題庫 (12 題)
    {
      id: "math2-1",
      stem: "下列哪一個數「既不是質數，也不是合數」？",
      options: ["0", "1", "2", "3"],
      answer: 1,
      explanation: "依數學嚴謹定義，大於 1 的正整數才分類為質數或合數。數字 1 只有一個因數，故 1 既非質數亦非合數。",
      concept: "質數與合數精確定義",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-2",
      stem: "將 360 質因數分解後寫成標準分解式，結果應為：",
      options: ["2³ × 3² × 5", "2² × 3³ × 5", "2 × 3² × 5²", "2⁴ × 3 × 5"],
      answer: 0,
      explanation: "$360 = 36 \\times 10 = (2^2 \\times 3^2) \\times (2 \\times 5) = 2^3 \\times 3^2 \\times 5$。",
      concept: "質因數分解與標準分解式",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-3",
      stem: "設 $A = 2^3 \\times 3^2 \\times 5$，$B = 2^2 \\times 3^3 \\times 7$，則 $A$ 與 $B$ 的最大公因數 $(A, B)$ 為何？",
      options: ["2³ × 3³ × 5 × 7", "2² × 3²", "2³ × 3³", "2² × 3² × 5 × 7"],
      answer: 1,
      explanation: "最大公因數取「共同的質因數（2 和 3）」，次方取「較小（低）者」，故為 $2^2 \\times 3^2$。",
      concept: "標準分解式求最大公因數",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-4",
      stem: "若兩整數 $a$ 與 $b$ 互質，則下列敘述何者正確？",
      options: ["a 與 b 一定都是質數", "a 與 b 的最大公因數為 1", "a 與 b 的最小公倍數為 1", "a 與 b 相加必為偶數"],
      answer: 1,
      explanation: "互質的定義即為兩數的最大公因數為 1，即 $(a, b) = 1$。互質的兩數不一定要是質數（例如 8 和 9 互質，但兩者皆為合數）。",
      concept: "互質之本質定義",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-5",
      stem: "計算算式 $\\left(-\\frac{2}{3}\\right) + \\frac{5}{6} \\times \\left(-\\frac{4}{5}\\right)$ 的結果為何？",
      options: ["-4/3", "0", "-1/3", "-1"],
      answer: 0,
      explanation: "先乘除後加減：$\\frac{5}{6} \\times \\left(-\\frac{4}{5}\\right) = -\\frac{4}{6} = -\\frac{2}{3}$。原式 $= \\left(-\\frac{2}{3}\\right) + \\left(-\\frac{2}{3}\\right) = -\\frac{4}{3}$。",
      concept: "分數四則混合運算",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-6",
      stem: "下列有關數的倒數之敘述，何者正確？",
      options: [
        "-3/4 的倒數是 4/3",
        "0 的倒數是 0",
        "-1 的倒數是 -1",
        "任何數的倒數必定小於原來的數"
      ],
      answer: 2,
      explanation: "因為 $(-1) \\times (-1) = 1$，兩數相乘為 1 即互為倒數，故 $-1$ 的倒數依然是 $-1$。A 的倒數符號不變應為 $-4/3$；B 中 0 沒有倒數。",
      concept: "倒數性質精確認知",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-7",
      stem: "阿榮每 4 天去一次圖書館，小欣每 6 天去一次圖書館。若今天星期一兩人在圖書館相遇，下一次兩人在「星期一」又相遇至少要經過幾天？",
      options: ["12 天", "24 天", "84 天", "42 天"],
      answer: 2,
      explanation: "兩人相遇的週期是 4 與 6 的最小公倍數 $[4, 6] = 12$ 天；而要剛好再次碰上「星期一」，天數必須是 7 的倍數。故求 $[12, 7] = 84$ 天。",
      concept: "公倍數週期應用題",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-8",
      stem: "若五位數 $4321\\square$ 是 4 的倍數，也是 3 的倍數，則方格中 $\\square$ 可以填入的數字為何？",
      options: ["2", "6", "8", "0"],
      answer: 0,
      explanation: "4 的倍數判別法：末兩位 $1\\square$ 必須是 4 的倍數，$\\square$ 可為 2 或 6。3 的倍數判別法：各數位和 $4+3+2+1+\\square = 10 + \\square$ 必須是 3 的倍數。若 $\\square=2$，和為 12（符合）；若 $\\square=6$，和為 16（不合）。故 $\\square = 2$。",
      concept: "因數倍數之判別法綜合應用",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-9",
      stem: "計算算式 $\\left(1 - \\frac{1}{2}\\right) \\times \\left(1 - \\frac{1}{3}\\right) \\times \\left(1 - \\frac{1}{4}\\right) \\times \\dots \\times \\left(1 - \\frac{1}{100}\\right)$ 的值為：",
      options: ["1/100", "1/50", "99/100", "0"],
      answer: 0,
      explanation: "原式 $= \\frac{1}{2} \\times \\frac{2}{3} \\times \\frac{3}{4} \\times \\dots \\times \\frac{99}{100}$。前後分子分母連續相約抵消，最後只剩下第一個分子 1 與最後一個分母 100，結果為 $\\frac{1}{100}$。",
      concept: "分數連乘規律約分",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-10",
      stem: "長方體木塊長 24 公分、寬 18 公分、高 12 公分，若想切割成大小相同且邊長為整數的「最大正方體」且毫無浪費，則最少可切成幾個正方體？",
      options: ["6 個", "24 個", "18 個", "24 個"],
      answer: 1,
      explanation: "正方體最大邊長為三個長度之最大公因數 $(24, 18, 12) = 6$ 公分。正方體個數 $= (24 \\div 6) \\times (18 \\div 6) \\times (12 \\div 6) = 4 \\times 3 \\times 2 = 24$ 個。",
      concept: "最大公因數立體切割應用",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-11",
      stem: "下列哪一個數是質數？",
      options: ["51", "87", "91", "97"],
      answer: 3,
      explanation: "$51 = 3 \\times 17$（合數）；$87 = 3 \\times 29$（合數）；$91 = 7 \\times 13$（合數，最常見的考題陷阱）；只有 97 只有 1 與 97 兩個因數，是 100 以內最大的質數。",
      concept: "常見大合數與質數判別陷阱",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },
    {
      id: "math2-12",
      stem: "已知 $a = -\\frac{7}{8}$、$b = -\\frac{8}{9}$、$c = -\\frac{9}{10}$，則 $a、b、c$ 三數的大小關係為何？",
      options: ["a > b > c", "c > b > a", "b > a > c", "a > c > b"],
      answer: 0,
      explanation: "正數比較：$\\frac{7}{8} = 1 - \\frac{1}{8}$、$\\frac{8}{9} = 1 - \\frac{1}{9}$、$\\frac{9}{10} = 1 - \\frac{1}{10}$。因為分母越大扣得越少，故正數大小為 $\\frac{9}{10} > \\frac{8}{9} > \\frac{7}{8}$。加上負號後大小反轉，故 $a > b > c$。",
      concept: "負分數差量比大小",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math2"
    },

    // math3 題庫 (12 題)
    {
      id: "math3-1",
      stem: "化簡代數式 $3(2x - 4) - 2(x + 5)$ 的結果為何？",
      options: ["4x - 22", "4x - 2", "4x + 2", "4x - 14"],
      answer: 0,
      explanation: "利用分配律展開：$3(2x - 4) = 6x - 12$；$-2(x + 5) = -2x - 10$。同類項合併：$(6x - 2x) + (-12 - 10) = 4x - 22$。",
      concept: "代數式分配律與同類項合併",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-2",
      stem: "解一元一次方程式 $5x - 7 = 2x + 8$，則 $x$ 的值為何？",
      options: ["3", "5", "1", "15"],
      answer: 1,
      explanation: "移項：$5x - 2x = 8 + 7 \\Rightarrow 3x = 15$。兩邊同除以 3：$x = 5$。",
      concept: "一元一次方程式移項求解",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-3",
      stem: "解方程式 $\\frac{x - 1}{2} - \\frac{x + 2}{3} = 1$，第一步驟若在等號兩邊同乘以 6 去分母，則所得的正確方程式為何？",
      options: [
        "3(x - 1) - 2(x + 2) = 1",
        "3(x - 1) - 2(x + 2) = 6",
        "3x - 1 - 2x + 2 = 6",
        "2(x - 1) - 3(x + 2) = 6"
      ],
      answer: 1,
      explanation: "等號兩邊同乘以分母公倍數 6，等號右邊的 1 也必須乘 6 變成 6！分子需保持括號：$3(x - 1) - 2(x + 2) = 6$。",
      concept: "去分母技巧與括號保留",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-4",
      stem: "某服飾店舉辦換季拍賣，一件外套依定價打七折後再折價 200 元，最後售價為 1200 元。若設該外套定價為 $x$ 元，則依題意可列出方程式為何？",
      options: ["0.7x + 200 = 1200", "0.7x - 200 = 1200", "0.3x - 200 = 1200", "x - 200 × 0.7 = 1200"],
      answer: 1,
      explanation: "定價 $x$ 元打七折為 $0.7x$，再折價 200 元即減去 200，最後售價為 1200 元，故列式為 $0.7x - 200 = 1200$。",
      concept: "生活買賣折扣應用列式",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-5",
      stem: "承上題，該外套的原定價 $x$ 應為多少元？",
      options: ["1400 元", "1600 元", "2000 元", "2400 元"],
      answer: 2,
      explanation: "$0.7x - 200 = 1200 \\Rightarrow 0.7x = 1400 \\Rightarrow x = 1400 \\div 0.7 = 2000$ 元。",
      concept: "買賣折扣方程式求解",
      difficulty: "basic",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-6",
      stem: "父親今年 42 歲，兒子今年 12 歲，問幾年後父親的年齡恰好是兒子年齡的 3 倍？",
      options: ["2 年後", "3 年後", "4 年後", "5 年後"],
      answer: 1,
      explanation: "設 $x$ 年後滿足條件。此時父親為 $42 + x$ 歲，兒子為 $12 + x$ 歲。列式：$42 + x = 3(12 + x) \\Rightarrow 42 + x = 36 + 3x \\Rightarrow 2x = 6 \\Rightarrow x = 3$ 年後。",
      concept: "年齡應用問題",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-7",
      stem: "老師拿了一包糖果分給班上學生，若每人分 4 顆，則剩下 18 顆；若每人分 5 顆，則不足 12 顆。請問這包糖果共有多少顆？",
      options: ["30 顆", "120 顆", "138 顆", "150 顆"],
      answer: 2,
      explanation: "設學生有 $x$ 人。糖果總數以兩種分法表示相等：$4x + 18 = 5x - 12 \\Rightarrow x = 30$ 人。糖果總數 $= 4(30) + 18 = 138$ 顆。",
      concept: "盈虧分配問題",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-8",
      stem: "若關於 $x$ 的方程式 $2(x - a) + 5 = 3x - 1$ 的解為 $x = 4$，則常數 $a$ 的值為何？",
      options: ["1", "2", "-1", "3"],
      answer: 0,
      explanation: "將 $x = 4$ 代入方程式：$2(4 - a) + 5 = 3(4) - 1 \\Rightarrow 8 - 2a + 5 = 12 - 1 \\Rightarrow 13 - 2a = 11 \\Rightarrow 2a = 2 \\Rightarrow a = 1$。",
      concept: "方程式之解代入求未知數",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-9",
      stem: "甲、乙兩地相距 180 公里，開車從甲地到乙地，去程時速 60 公里，回程時速 90 公里，則往返兩地的「平均時速」為多少？",
      options: ["75 公里/時", "72 公里/時", "70 公里/時", "80 公里/時"],
      answer: 1,
      explanation: "平均時速 $=$ 總距離 $\\div$ 總時間。總距離 $= 180 \\times 2 = 360$ 公里。去程時間 $= 180 \\div 60 = 3$ 小時；回程時間 $= 180 \\div 90 = 2$ 小時。總時間 $= 5$ 小時。平均時速 $= 360 \\div 5 = 72$ 公里/小時（絕不是直接將 (60+90)/2 取平均！）。",
      concept: "平均速率經典段考陷阱題",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-10",
      stem: "解方程式 $0.3x - 0.2(x - 5) = 1.4$，則 $x$ 的值為何？",
      options: ["2", "4", "6", "8"],
      answer: 1,
      explanation: "兩邊同乘 10 化除小數：$3x - 2(x - 5) = 14 \\Rightarrow 3x - 2x + 10 = 14 \\Rightarrow x = 4$。",
      concept: "含小數之方程式求解",
      difficulty: "basic",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-11",
      stem: "若方程式 $3(2x - 1) = 6x - k$ 為「無解」，則常數 $k$ 的條件為何？",
      options: ["k = 3", "k ≠ 3", "k = -3", "k 可以是任意數"],
      answer: 1,
      explanation: "展開得 $6x - 3 = 6x - k \\Rightarrow 0x = 3 - k$。若要使方程式無解，等號右側必須不等於 0，即 $3 - k \\ne 0 \\Rightarrow k \\ne 3$（若 $k=3$ 則為無限多組解）。",
      concept: "方程式特殊解條件（無解與無限多解）",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },
    {
      id: "math3-12",
      stem: "有一個二位數，其個位數字與十位數字之和為 11。若將十位數字與個位數字對調，所得的新數比原數大 45，則原數為何？",
      options: ["29", "38", "47", "56"],
      answer: 1,
      explanation: "設原數十位數字為 $x$，則個位數字為 $11 - x$。原數值 $= 10x + (11 - x) = 9x + 11$。新數值 $= 10(11 - x) + x = 110 - 9x$。依題意：$(110 - 9x) - (9x + 11) = 45 \\Rightarrow 99 - 18x = 45 \\Rightarrow 18x = 54 \\Rightarrow x = 3$。個位數字為 $11 - 3 = 8$，故原數為 38。",
      concept: "二位數數字互換應用題",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math3"
    },

    // math4 題庫 (12 題)
    {
      id: "math4-1",
      stem: "下列哪一個常見的幾何平面圖形「不是」線對稱圖形？",
      options: ["正方形", "等腰梯形", "一般平行四邊形", "菱形"],
      answer: 2,
      explanation: "一般平行四邊形沿著任何直線對摺都無法完全重合，故不具備線對稱性質（它是中心對稱圖形）；其餘三者皆為線對稱圖形。",
      concept: "線對稱圖形辨識",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-2",
      stem: "一個正八邊形總共有幾條對稱軸？",
      options: ["4 條", "6 條", "8 條", "16 條"],
      answer: 2,
      explanation: "正 $n$ 邊形恰好有 $n$ 條對稱軸（包含相對頂點連線與相對邊中點連線），故正八邊形有 8 條對稱軸。",
      concept: "正多邊形對稱軸數量規律",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-3",
      stem: "下列有關線對稱圖形幾何性質的敘述，何者「錯誤」？",
      options: [
        "對稱軸必垂直平分對稱點的連線段",
        "對稱線段必定等長，對稱角必定相等",
        "長方形的兩條對角線是對稱軸",
        "圓形有無窮多條對稱軸"
      ],
      answer: 2,
      explanation: "長方形的對稱軸只有兩條（兩組對邊中點的連線）。長方形沿對角線對摺無法重合，故對角線「不是」長方形的對稱軸！",
      concept: "長方形對稱軸常見陷阱",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-4",
      stem: "若平面上 $A(3, 5)$ 與 $B(3, -5)$ 兩點互為對稱點，則它們的對稱軸為何？",
      options: ["x 軸", "y 軸", "直線 x = 3", "直線 y = x"],
      answer: 0,
      explanation: "$A$ 與 $B$ 兩點的 $x$ 座標相同、$y$ 座標互為相反數，兩點連線段被 $x$ 軸（即直線 $y = 0$）垂直平分，故對稱軸為 $x$ 軸。",
      concept: "座標平面上的對稱軸",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-5",
      stem: "下列 26 個英文字母大寫中，哪一個「同時具備水平與垂直兩條對稱軸」？",
      options: ["A", "H", "M", "E"],
      answer: 1,
      explanation: "字母 H 沿垂直中線或水平中線對摺皆能完全重合，具備 2 條對稱軸。A 和 M 只有垂直對稱軸；E 只有水平對稱軸。",
      concept: "字母線對稱圖形判別",
      difficulty: "basic",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-6",
      stem: "在三視圖中，由立體圖形正上方垂直向下俯瞰所繪製的平面圖形稱為：",
      options: ["前視圖", "上視圖（俯視圖）", "左側視圖", "底面展開圖"],
      answer: 1,
      explanation: "從正上方俯瞰觀察得到的二維正投影圖稱為「上視圖（或稱俯視圖）」。",
      concept: "三視圖定義",
      difficulty: "basic",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-7",
      stem: "繪製三視圖時，遵循「長對正、高平齊、寬相等」的原則。其中「高平齊」指的是哪兩個視圖的高度必須一致？",
      options: ["前視圖與上視圖", "前視圖與側視圖", "上視圖與側視圖", "左側視圖與右側視圖"],
      answer: 1,
      explanation: "立體物體的高度直接反應在前視圖與側視圖上，故前視圖與側視圖必須「高平齊」；長對正則是前視圖與上視圖。",
      concept: "三視圖投影幾何原則",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-8",
      stem: "一個正方體紙盒若沿著稜線剪開攤平，其表面展開圖共有幾種不同形狀的可能？",
      options: ["6 種", "8 種", "11 種", "12 種"],
      answer: 2,
      explanation: "正方體的展開圖共有著名的「11 種」不同構型（包含 1-4-1 型 6 種、2-3-1 型 3 種、2-2-2 型 1 種、3-3 型 1 種）。",
      concept: "正方體展開圖常識",
      difficulty: "challenge",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-9",
      stem: "用若干個大小相同的正方體積木堆疊成一個立體模型，若其「前視圖」與「上視圖」都呈現一個 $2 \\times 2$ 的田字形正方形，則此模型最少與最多各需要幾個積木？",
      options: ["最少 4 個，最多 8 個", "最少 4 個，最多 6 個", "最少 6 個，最多 8 個", "最少 5 個，最多 8 個"],
      answer: 0,
      explanation: "上視圖為 $2 \\times 2$，表示底層必須有 4 個位置。前視圖每列高均為 2，若最少只需在 4 個位置各放積木，其中某些堆高為 2，最少只需 4 個（每列至少一個高為2）；最多則是 4 個位置全部堆滿 2 層，共 $4 \\times 2 = 8$ 個。",
      concept: "三視圖積木推算最少與最多數",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-10",
      stem: "時鐘在 3 點 30 分時，時針與分針所夾的較小角度為多少度？",
      options: ["90°", "75°", "80°", "85°"],
      answer: 1,
      explanation: "分針指在 6（180度位置）。時針從 3 點走了 30 分鐘，移動了 $30 \\times 0.5^\\circ = 15^\\circ$。3 點時針位置為 $90^\\circ$，3:30 位置為 $90 + 15 = 105^\\circ$。兩針夾角 $= 180^\\circ - 105^\\circ = 75^\\circ$。",
      concept: "時鐘角度與幾何計算",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-11",
      stem: "下列哪一個國字「不是」線對稱圖形？",
      options: ["中", "田", "木", "風"],
      answer: 3,
      explanation: "「中」有垂直對稱軸，「田」有水平與垂直兩條對稱軸，「木」有垂直對稱軸；「風」左右兩側筆劃不對稱，不是線對稱圖形。",
      concept: "漢字字形線對稱美學觀察",
      difficulty: "basic",
      exam_focus: false,
      subject_id: "math",
      chapter_id: "math4"
    },
    {
      id: "math4-12",
      stem: "已知 $\\triangle ABC$ 為等腰三角形，若 $\\angle A = 100^\\circ$，且直線 $L$ 為 $\\triangle ABC$ 的對稱軸，則下列何者必為正確？",
      options: [
        "直線 L 必通過頂點 A 並平分 ∠A",
        "∠B 的度數必為 80°",
        "三角形 ABC 共有 3 條對稱軸",
        "直線 L 必平行線段 BC"
      ],
      answer: 0,
      explanation: "三角形內角和 180 度，鈍角 $100^\\circ$ 只能是頂角，底角 $\\angle B = \\angle C = (180 - 100)/2 = 40^\\circ$。等腰非正三角形只有 1 條對稱軸，必定通過頂角 $A$ 且垂直平分底邊 $BC$、平分頂角 $\\angle A$。",
      concept: "等腰三角形對稱幾何綜合證明",
      difficulty: "challenge",
      exam_focus: true,
      subject_id: "math",
      chapter_id: "math4"
    }
  ]
};
