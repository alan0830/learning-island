'use strict';
const fs = require('fs');
const path = require('path');

const chapters = [
  {
    id: "eng1",
    subject_id: "eng",
    title: "Starter 基礎入門與教室美語",
    subtitle: "26 字母大小寫、母音子音發音規則與課堂日常用語（一段範圍）",
    exam_focus: true,
    key_points: [
      "26 字母規範書寫：正確掌握印刷體大小寫字母的格線位置（上格、中格、下格），注意容易混淆的 b/d、p/q、u/v。",
      "自然發音五大短母音：a (/æ/)、e (/e/)、i (/ɪ/)、o (/ɑ/)、u (/ʌ/)，以及常見子音拼讀規則（如 c 在 e/i/y 前發 /s/，其餘發 /k/）。",
      "常用問候與應對語句：Good morning / afternoon / evening; How are you? - I'm fine, thank you. Nice to meet you.",
      "課堂生活實用英語指令：Open your book; Close your book; Listen carefully; Stand up; Sit down; Raise your hand.",
      "表達感謝與道別：Thank you very much; You're welcome; See you tomorrow; Have a good weekend.",
      "禮貌請求句型：Please come in; May I go to the restroom?"
    ],
    common_mistakes: [
      "大小寫字母筆順與位置錯位：例如將小寫字母 p 或 y 寫在上兩格，或把 b 與 d 鏡像搞混。",
      "母音發音長短音混淆：如 /ɪ/（ship）與 /i/（sheep）的唇形與發音長度差異。",
      "漏掉禮貌應答：當對方說 Thank you 時，不可只回答 Yes，應禮貌回應 You're welcome 或 No problem。"
    ],
    think: "試著在房間裡環顧四周，找出五樣文具或傢俱，大聲用自然發音拼出它們的英文單字，並注意母音的正確唇形。"
  },
  {
    id: "eng2",
    subject_id: "eng",
    title: "Unit 1 Hello, I'm...",
    subtitle: "be動詞現在式（am/is/are）、主格代名詞與自我介紹（一段範圍）",
    exam_focus: true,
    key_points: [
      "主格人稱代名詞與 be 動詞之搭配：I am (I'm); You are (You're); He/She/It is (He's/She's/It's); We/You/They are (We're/They're)。",
      "be 動詞的否定句結構：主詞 + be 動詞 + not（am not 不能縮寫為 amn't；is not 縮寫為 isn't；are not 縮寫為 aren't）。",
      "be 動詞的 Yes/No 問句與簡答：Is he a student? - Yes, he is. / No, he isn't.（肯定簡答不可縮寫為 Yes, he's）。",
      "自我介紹基本句型：My name is Kevin. / I am a junior high school student. / I am twelve years old.",
      "稱謂詞的使用：Mr.（先生）、Ms.（女士，婚姻狀況不明或不願指明）、Mrs.（已婚女士/太太）、Miss（未婚小姐）。",
      "Wh- 疑問詞 Who 的用法：Who is that boy? - He is my classmate, Leo."
    ],
    common_mistakes: [
      "肯定簡答錯誤縮寫：回答 Yes, I am. 不可寫成 Yes, I'm.；Yes, she is. 不可寫成 Yes, she's.。",
      "人稱代名詞與 be 動詞不一致：例如誤寫 He are a teacher 或 They is my friends。",
      "詢問年齡常誤加 year：應為 He is twelve years old.（不可漏掉 s）或直接說 He is twelve。"
    ],
    think: "如果要向一位來自國外的新同學介紹自己與身邊最要好的兩位朋友，你會使用哪些 be 動詞句型完整介紹大家的姓名與角色？"
  },
  {
    id: "eng3",
    subject_id: "eng",
    title: "Unit 2 Meet My Family",
    subtitle: "家庭成員稱謂、名詞所有格（'s）與指示代名詞（一段範圍）",
    exam_focus: true,
    key_points: [
      "核心家庭成員字彙：father (dad), mother (mom), parents, brother, sister, grandfather, grandmother, grandparents, cousin, uncle, aunt。",
      "名詞所有格結構：單數名詞與不以 s 結尾的複數名詞加 's（Tom's book, the children's toys）；以 s 結尾的規則複數名詞直接加 '（the boys' balls）。",
      "共同所有 vs 個別所有：Tom and Mary's father（兩人共同的父親）；Tom's and Mary's fathers（兩人各自的父親）。",
      "指示代名詞單複數：This is my dog.（單數近指）/ That is a bird.（單數遠指）；These are apples.（複數近指）/ Those are cars.（複數遠指）。",
      "指示代名詞問句與代名詞回應：What is this/that? - It is a pen. / What are these/those? - They are books.（答句一律用 It / They 代替）。",
      "職業詢問句型：What is your father? / What does your father do? - He is an engineer."
    ],
    common_mistakes: [
      "答句誤用指示代名詞：問 What are these? 不可回答 These are pens，必須用代名詞 They are pens。",
      "所有格符號撇號位置放錯：The girl's bag（一個女孩的包包）vs The girls' bags（多個女孩的包包）。",
      "混淆 parents 與 parent：parents 指雙親（兩人）；parent 指父母其中一人（單數）。"
    ],
    think: "畫一張簡單的家族樹，並用英文向同學介紹：「這位是我的姑姑，她是醫生；那是她的先生與兒子。」"
  },
  {
    id: "eng4",
    subject_id: "eng",
    title: "Review 1 一段跨單元統整複習",
    subtitle: "字母發音、be動詞全句型、家庭所有格與會考生活素養題型（一段總結）",
    exam_focus: true,
    key_points: [
      "一段文法大融會：主格代名詞、所有格、be 動詞肯定句/否定句/疑問句/答句之無縫轉換。",
      "會考聽力常考語句：聽音辨圖（辨別人物外貌、家庭關係、職業與位置）、簡短日常對話應答。",
      "閱讀題型：家庭邀請函、自我介紹電子郵件、學生識別證與人物關係圖表判讀。",
      "情境交際句型整合：Nice to meet you. - Nice to meet you, too. / Welcome to my house. - Thank you.",
      "單複數名詞變化規則：規則名詞加 s/es（box → boxes, bus → buses, baby → babies），不規則變化（man → men, tooth → teeth）。",
      "考試作答心法：檢查主詞是單數還是複數，動詞與代名詞是否一致，標點符號與首字母大小寫是否正確。"
    ],
    common_mistakes: [
      "填空時忘記首字母大寫：句首的第一個單字務必大寫。",
      "答非所問：問 Who is she? 回答 She is fine（搞混了 Who 與 How）。",
      "名詞變複數時 y 結尾未細看：子音 + y 改 ies（city → cities）；母音 + y 直接加 s（boy → boys）。"
    ],
    think: "假裝你是一名小記者，要採訪剛轉學來的新同學，列出三個你在一段所學到的英文問題並預想對方的回答。"
  },
  {
    id: "eng5",
    subject_id: "eng",
    title: "Unit 3 Where Are You From?",
    subtitle: "國家國籍、公共場所、職業與地點介系詞（二段範圍）",
    exam_focus: true,
    key_points: [
      "主要國家與國籍單字：Taiwan/Taiwanese, Japan/Japanese, the USA/American, the UK/British, Canada/Canadian。",
      "詢問來源地句型：Where are you from? = Where do you come from? - I am from Taiwan. / I come from Taiwan.",
      "公共場所字彙：park, library, hospital, museum, restaurant, station, school, supermarket, bookstore。",
      "三大基本地點介系詞用法：at（精確點或地址，如 at the bus stop, at school）；in（大範圍或封閉空間內，如 in Taipei, in the room）；on（平面上，如 on the desk, on the street）。",
      "常用方位介系詞：next to（在……旁邊）、between A and B（在 A 與 B 之間）、in front of（在……前面）、behind（在……後面）。",
      "There is / There are 存在句型：There is a book on the table. / There are three dogs in the park."
    ],
    common_mistakes: [
      "混淆國家名與國籍形容詞：He is from Japanese（錯誤，應為 He is from Japan 或 He is Japanese）。",
      "混淆 between 與 among：between 用於「兩者之間」；among 用於「三者以上之中」。",
      "There is/are 與 have 混淆：There is a book（那裡有一本書）；I have a book（我擁有一本書），不可寫成 There have a book。"
    ],
    think: "試著用英文向外國遊客描述你家附近的環境：「在學校旁邊有一座圖書館，超市就在它們兩者之間。」"
  },
  {
    id: "eng6",
    subject_id: "eng",
    title: "Unit 4 What Are You Doing?",
    subtitle: "現在進行式（be + V-ing）、時間表達與動詞現在分詞變化（二段範圍）",
    exam_focus: true,
    key_points: [
      "現在進行式核心意義：表示「說話當下正在發生的動作」，公式為【主詞 + be動詞 (am/is/are) + 動詞-ing】。",
      "動詞現在分詞 (-ing) 規則變化：直接加 ing（watch → watching）；字尾有不發音 e 去 e 加 ing（write → writing）；短母音+單子音重複字尾加 ing（run → running, swim → swimming）；ie 結尾改 y 加 ing（die → dying, lie → lying）。",
      "現在進行式的否定句與問句：They are not studying. / Are you doing your homework? - Yes, I am. / What are they watching? - They are watching TV.",
      "常見時間詢問與表達：What time is it? = What is the time? - It is eight o'clock. / It is ten fifteen (a quarter past ten).",
      "日常活動動詞片語：read a book, listen to music, play basketball, clean the bedroom, cook dinner, draw a picture。",
      "現在進行式常見時間副詞搭配：now, right now, at the moment, Look!, Listen!。"
    ],
    common_mistakes: [
      "進行式漏掉 be 動詞：誤寫 I reading a book（正確應為 I am reading a book）。",
      "重複字尾規則判斷錯誤：play 字尾為母音+y，直接加 ing（playing），不可重複 y。",
      "狀態動詞不可用進行式：如 know, like, have（擁有）, want 通常不使用進行式（不可說 I am liking apples）。"
    ],
    think: "觀察教室或客廳裡的人，用五個現在進行式句子描述他們此刻各自正在進行的動作。"
  },
  {
    id: "eng7",
    subject_id: "eng",
    title: "Review 2 二段跨單元統整複習",
    subtitle: "地點方位、現在進行式、時間表達與生活對話閱讀判讀（二段總結）",
    exam_focus: true,
    key_points: [
      "二段文法總梳理：地點介系詞精準運用、現在進行式各種句型與時間副詞之呼應關係。",
      "生活圖表閱讀題解密：公車時刻表、地圖問路指示、手機通訊軟體即時對話理解。",
      "詢問天氣與活動結合：How is the weather? - It's sunny. We are playing in the park.",
      "電話美語日常用語：Hello. May I speak to Eric? - This is Eric speaking. / Who is calling, please?",
      "會考素養題型演練：根據漫畫對白推論人物當下心情與後續行為。",
      "檢查清單：注意 be 動詞主從一致、動詞現在分詞拼字正確性、介系詞是否精準。"
    ],
    common_mistakes: [
      "問路回答語態生硬：Turn left at the corner; Go straight along the street 是最自然的祈使句指示。",
      "電話中自我介紹說 I am...：英語講電話說「我是某某」應說 This is...，而非 I am...。",
      "介系詞重複：誤寫 into in the house 或 on upon the desk。"
    ],
    think: "假裝你正在和好朋友通電話，用英語向他描述你正在做什麼，並約定下午三點在學校門口見面。"
  },
  {
    id: "eng8",
    subject_id: "eng",
    title: "Unit 5 What Do You Do on Weekends?",
    subtitle: "現在簡單式、一般動詞現在式單三變化與助動詞 do/does（三段範圍）",
    exam_focus: true,
    key_points: [
      "現在簡單式使用時機：表示「常態性習慣、事實、真理或目前狀態」，常與 every day, on weekends, in the morning 搭配。",
      "一般動詞的第三人稱單數 (he/she/it) 現象：主詞是第三人稱單數時，動詞字尾必須加 s/es（like → likes, watch → watches, study → studies, have → has）。",
      "助動詞 do 與 does 的功能：用於一般動詞的疑問句與否定句。第三人稱單數用 does/doesn't，其餘用 do/don't。",
      "助動詞後面動詞「打回原形」金律：Does she like apples?（like 用原形）；He doesn't play tennis.（play 用原形）。",
      "週末休閒活動單字：play video games, visit grandparents, ride a bike, walk the dog, go hiking, watch movies。",
      "詢問職業與日常活動：What do you do? = What is your job? / What do you do on weekends? - I usually read books."
    ],
    common_mistakes: [
      "助動詞後忘記還原原形動詞：誤寫 Does he plays basketball? 或 She doesn't likes cats。",
      "混淆 be 動詞與助動詞 do/does：不可說 Do you a student? 或 Are you like dogs?。",
      "第三人稱單數動詞加 s 疏忽：He study English every night（應改為 studies）。"
    ],
    think: "寫下你週一到週五的真實作息表，並用三個句子描述你的生活習慣，再用三個句子描述你家人的日常習慣。"
  },
  {
    id: "eng9",
    subject_id: "eng",
    title: "Unit 6 How Often Do You Exercise?",
    subtitle: "頻率副詞（always ~ never）、運動健身字彙與健康生活習慣（三段範圍）",
    exam_focus: true,
    key_points: [
      "六大頻率副詞依頻率高低排列：always (100%) → usually (80%) → often (60%) → sometimes (40%) → seldom (10%) → never (0%)。",
      "頻率副詞的位置口訣：【be動詞後、一般動詞前、助動詞與本動詞之間】。例如：He is always late. / She never eats fast food. / You must always follow the rules.",
      "詢問頻率句型：How often do you play basketball? - I play basketball once a week / twice a month / three times a year.",
      "次數與時間表達法：once（一次）、twice（兩次）、three times（三次）；every other day（每隔一天）。",
      "健康生活與運動單字：exercise, jog, swim, play badminton, eat vegetables, drink enough water, sleep well。",
      "否定頻率副詞特殊注意：seldom 與 never 本身已具備否定意味，句子中不可再加 not（不可說 He doesn't seldom walk）。"
    ],
    common_mistakes: [
      "頻率副詞位置放錯：誤寫 He always is happy（應為 He is always happy）。",
      "雙重否定錯誤：誤寫 She doesn't never drink coffee（應改為 She never drinks coffee）。",
      "How often 與 How many times 混淆：How often 詢問「頻率週期」；How many times 詢問「累計次數」。"
    ],
    think: "反省自己的健康作息，用 always, usually, sometimes, seldom, never 各寫一個與飲食、睡眠或運動相關的真實英文句子。"
  },
  {
    id: "eng10",
    subject_id: "eng",
    title: "Review 3 三段跨單元統整複習",
    subtitle: "現在簡單式vs進行式辨析、頻率副詞、生活閱讀與國中會考題型模擬（三段總結）",
    exam_focus: true,
    key_points: [
      "現在簡單式 vs 現在進行式之關鍵對比：現在簡單式強調「習慣與常態」（He plays soccer every Sunday）；現在進行式強調「當下正進行」（He is playing soccer now）。",
      "會考常見素養閱讀：健康檢查報告、運動俱樂部會員問卷、生活日誌與社群貼文分析。",
      "動詞變化與句型全盤檢視：be動詞 vs 一般動詞助動詞 do/does 之正誤辨別。",
      "時間副詞提示詞辨認技巧：看見 every day, usually 選簡單式；看見 now, Look!, Listen! 選進行式。",
      "生活交際與情境問答：How about going to the movies this Saturday? - That sounds great!",
      "全方位大考避坑秘笈：注意單複數、第三人稱單數動詞加 s、助動詞後接原形動詞。"
    ],
    common_mistakes: [
      "時態混淆：Look! The bus comes.（錯誤，看到 Look! 應為 is coming）。",
      "省略主詞或動詞：答句忘記完整主從結構。",
      "助動詞與頻率副詞順序錯置：應為 I can always help you，而非 I always can help you。"
    ],
    think: "如果有一位外國交換生問你臺灣國中生的一天作息，請嘗試用五個完整英文句子向他綜合介紹我們的校園生活與休閒運動。"
  }
];

function buildQuestions() {
  const qs = [];

  chapters.forEach((ch) => {
    for (let i = 1; i <= 12; i++) {
      const qid = `${ch.id}_q${i}`;
      let stem = "", options = [], answer = 0, explanation = "", concept = "", difficulty = "medium", exam_tags = [];

      switch (ch.id) {
        case "eng1":
          if (i === 1) {
            stem = "Which letter pair has the correct uppercase and lowercase match?";
            options = ["B - d", "D - b", "P - q", "E - e"];
            answer = 3;
            explanation = "E 的小寫是 e。A 應為 B-b；B 應為 D-d；C 應為 P-p。";
            concept = "Alphabet Letter Matching";
            difficulty = "basic";
            exam_tags = ["字母辨識", "基礎題"];
          } else if (i === 2) {
            stem = "Teacher: \"_____ your hands before you speak in class.\" Which word fits best?";
            options = ["Raise", "Stand", "Close", "Read"];
            answer = 0;
            explanation = "課堂常見指令為 Raise your hand（舉手發言）。";
            concept = "Classroom English";
            difficulty = "basic";
            exam_tags = ["教室美語"];
          } else if (i === 3) {
            stem = "Amy: \"Thank you so much for your help.\" - Bob: \"_____\"";
            options = ["I am fine.", "You're welcome.", "Goodbye.", "Yes, please."];
            answer = 1;
            explanation = "當對方表達感謝 Thank you 時，標準禮貌回應是 You're welcome（不客氣）。";
            concept = "Daily Conversational Responses";
            difficulty = "basic";
            exam_tags = ["日常會話"];
          } else {
            const items = [
              { q: "Which word has the short vowel sound /æ/ as in 'cat'?", a: 0, o: ["apple", "bee", "ice", "use"] },
              { q: "When you meet someone for the first time in the morning, what should you say?", a: 1, o: ["Good night.", "Good morning. Nice to meet you.", "See you yesterday.", "You are welcome."] },
              { q: "Student: \"May I _____ to the restroom, Mr. Lin?\" Which word completes the sentence?", a: 2, o: ["listening", "stands", "go", "reading"] },
              { q: "Which of the following is spelled correctly?", a: 0, o: ["student", "studnet", "stuednt", "stutent"] },
              { q: "Teacher: \"Please _____ to page 10 and read silently.\" Which word completes the command?", a: 1, o: ["stand", "turn", "raise", "close"] },
              { q: "Which word starts with the same sound as 'desk' (/d/)?", a: 2, o: ["ball", "pen", "dog", "cat"] },
              { q: "Tom: \"See you tomorrow, Jenny!\" - Jenny: \"_____!\"", a: 0, o: ["See you", "I am Jenny", "Thank you", "Nice to meet you"] },
              { q: "Which sentence is punctuated and capitalized correctly?", a: 3, o: ["how are you today", "I am a boy", "Good morning, mr. wang.", "Good morning, Mr. Wang."] },
              { q: "Which word has a different vowel sound from the other three?", a: 1, o: ["bed", "bike", "pen", "desk"] }
            ];
            const cur = items[i - 4];
            stem = cur.q;
            options = cur.o;
            answer = cur.a;
            explanation = "本題旨在考查 Starter 單元基礎發音、單字拼讀與日常課堂美語之核心用法。";
            concept = "Starter Basic English Competency";
            difficulty = i <= 6 ? "basic" : "medium";
            exam_tags = ["段考必考", "發音與拼字"];
          }
          break;

        case "eng2":
          if (i === 1) {
            stem = "Leo: \"Who _____ that girl over there?\" - Mia: \"She _____ my new classmate, Cindy.\"";
            options = ["is; is", "are; is", "is; are", "are; are"];
            answer = 0;
            explanation = "that girl 與 She 皆為第三人稱單數主詞，故皆搭配 be 動詞 is。";
            concept = "be 動詞主從一致";
            difficulty = "basic";
            exam_tags = ["be動詞", "主從一致"];
          } else if (i === 2) {
            stem = "Are you and Mary in the same class? - _____";
            options = ["Yes, I am.", "Yes, we are.", "No, she isn't.", "Yes, they are."];
            answer = 1;
            explanation = "問句主詞是 you and Mary（你們），簡答時需用代名詞 we（我們）回答：Yes, we are.。";
            concept = "代名詞轉換與簡答";
            difficulty = "medium";
            exam_tags = ["人稱代名詞", "段考常考"];
          } else if (i === 3) {
            stem = "Which sentence has the correct contraction (縮寫)?";
            options = ["I amn't a doctor.", "Yes, he's.", "They aren't teachers.", "He is'nt at home."];
            answer = 2;
            explanation = "are not 縮寫為 aren't。A 中 am not 不可縮寫為 amn't；B 中肯定簡答不可縮寫；D 中 isn't 撇號位置錯誤。";
            concept = "be 動詞縮寫規則";
            difficulty = "medium";
            exam_tags = ["縮寫法則", "易錯題"];
          } else {
            const items = [
              { q: "Peter: \"Is your brother twelve years old?\" - John: \"No, _____.\"", a: 0, o: ["he isn't", "he is", "she isn't", "he's not old"] },
              { q: "_____ name is Kevin, and _____ am a junior high school student.", a: 1, o: ["My; my", "My; I", "I; My", "I; I"] },
              { q: "This is _____ Lee. She is our English teacher.", a: 2, o: ["Mr.", "Sir", "Ms.", "Boy"] },
              { q: "Ken: \"How old is your sister?\" - Sam: \"_____.\"", a: 0, o: ["She is fourteen years old", "She is a student", "She is fine, thanks", "She is tall"] },
              { q: "Which of the following sentences is grammatically correct?", a: 3, o: ["We is good friends.", "You am very kind.", "He and I is students.", "They are happy today."] },
              { q: "Who is the tall man in the picture? - _____ is my uncle.", a: 1, o: ["She", "He", "It", "They"] },
              { q: "Eric and Leo are not brothers. _____ are classmates.", a: 0, o: ["They", "We", "You", "He"] },
              { q: "Are those your pencils? - No, _____.", a: 2, o: ["those aren't", "they are", "they aren't", "it isn't"] },
              { q: "Choose the correct sentence order: \"good / a / is / student / Jack / .\"", a: 0, o: ["Jack is a good student.", "Jack a good student is.", "Is Jack a good student.", "A good student is Jack."] }
            ];
            const cur = items[i - 4];
            stem = cur.q;
            options = cur.o;
            answer = cur.a;
            explanation = "本題旨在考查 Unit 1 be 動詞肯定、否定、疑問句型以及人稱代名詞之正確運用。";
            concept = "Unit 1 Grammar Mastery";
            difficulty = i <= 6 ? "basic" : "medium";
            exam_tags = ["單元測驗", "文法概念"];
          }
          break;

        default:
          const baseQuestions = [
            { q: `What is the key grammatical focus in ${ch.title}?`, a: 0, o: ["Subject-verb agreement and proper sentence structure", "Memorizing random irregular words without grammar", "Translating words backward", "Ignoring all punctuation marks"] },
            { q: `Which sentence best represents the main theme of ${ch.title}?`, a: 1, o: ["I does not know the answer.", "We learn English by practicing speaking and reading every day.", "He are my best friend forever.", "She like to play basketball yesterday."] },
            { q: `Choose the correct word to complete the sentence based on ${ch.title}: "_____ your brother like to play sports?"`, a: 2, o: ["Do", "Is", "Does", "Are"] },
            { q: `Which of the following is the correct response in daily communication for ${ch.title}?`, a: 0, o: ["That sounds like a great idea! Let's go.", "I am not like that.", "He don't know.", "She aren't here."] },
            { q: `Identify the common mistake mentioned in ${ch.title}:`, a: 1, o: ["Using a capital letter at the start of a sentence", "Forgetting the third-person singular 's' or auxiliary verb agreement", "Ending a sentence with a period", "Putting an adjective before a noun"] },
            { q: `Choose the grammatically CORRECT sentence:`, a: 3, o: ["He never is late for school.", "How often does you wash your hands?", "There have two apples on the desk.", "She is reading a book in the library right now."] },
            { q: `Which question word is used to ask about frequency in ${ch.title}?`, a: 0, o: ["How often", "How much", "How many", "How old"] },
            { q: `\"Look! The children _____ in the pool happily.\" Which verb form fits best?`, a: 2, o: ["swims", "is swimming", "are swimming", "swim"] },
            { q: `Which adverb of frequency means '100% of the time'?`, a: 0, o: ["always", "usually", "often", "seldom"] },
            { q: `Choose the correct preposition: \"My house is _____ the park and the bookstore.\"`, a: 1, o: ["next", "between", "under", "in front"] },
            { q: `What should we remember when answering \"What are these?\" in ${ch.title}?`, a: 0, o: ["Use 'They are...' instead of 'These are...'", "Use 'It is...' instead of 'They are...'", "Always repeat the question", "Never use pronouns"] },
            { q: `How does mastering ${ch.title} help 7th-grade students in their English learning journey?`, a: 0, o: ["Builds authentic communicative skills and solid grammar foundations for junior high English", "Guarantees no need to practice listening ever again", "Replaces Chinese completely in everyday life", "Requires only memorizing dictionary page numbers"] }
          ];
          const cur = baseQuestions[i - 1];
          stem = cur.q;
          options = cur.o;
          answer = cur.a;
          explanation = `本題檢測學生對於 ${ch.title} 核心文法句型與字彙之掌握度，能有效強化國中七年級英語閱讀與實戰應答能力。`;
          concept = `${ch.title} 英語核心素養測驗`;
          difficulty = i <= 4 ? "basic" : (i <= 9 ? "medium" : "challenge");
          exam_tags = ["翰林七上必考", "會考模擬", "生活實用英語"];
          break;
      }

      qs.push({
        id: qid,
        subject_id: "eng",
        chapter_id: ch.id,
        stem,
        options,
        answer,
        explanation,
        concept,
        difficulty,
        exam_tags
      });
    }
  });

  return { chapters, questions: qs };
}

const res = buildQuestions();
const outPath = path.join(__dirname, '..', 'data', 'eng.js');
const content = `'use strict';\n\nmodule.exports = ${JSON.stringify(res, null, 2)};\n`;
fs.writeFileSync(outPath, content, 'utf8');
console.log(`Successfully generated eng.js with ${res.chapters.length} chapters and ${res.questions.length} questions.`);

