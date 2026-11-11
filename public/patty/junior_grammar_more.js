/* 國中文法補充模組（v214） */
(function(){
  var D=window.JG_DATA||{};
  D.tenses={title:'時態總覽',icon:'⏰',color:'#1d4ed8',
    rules:['時態＝時間＋動作狀態。先看時間副詞，再看主詞，最後選動詞形式。','現在簡單：習慣、事實；現在進行：現在正在做；過去：已發生；過去進行：過去某時正在做；未來：還沒發生；現在完成：到目前為止已完成或持續。'],
    sections:[
      {title:'現在簡單式',headers:['用法','句型','例'],rows:[
        ['習慣、事實','S + V / S + Vs(es)','I play tennis every day. / She plays tennis.'],
        ['否定','S + don’t/doesn’t + V','I don’t like coffee. / He doesn’t like coffee.'],
        ['疑問','Do/Does + S + V?','Do you play tennis? / Does she play tennis?']
      ]},
      {title:'現在進行式',headers:['用法','句型','例'],rows:[
        ['現在正在做','am/is/are + Ving','I am reading now.'],
        ['否定','am/is/are + not + Ving','She is not sleeping.'],
        ['疑問','Am/Is/Are + S + Ving?','Are you listening?']
      ]},
      {title:'過去式',headers:['用法','句型','例'],rows:[
        ['過去發生','S + Ved / 不規則過去式','I visited my grandma yesterday. / He went home.'],
        ['否定','S + didn’t + V','I didn’t see him.'],
        ['疑問','Did + S + V?','Did you finish your homework?']
      ]},
      {title:'過去進行式',headers:['用法','句型','例'],rows:[
        ['過去某時正在做','was/were + Ving','I was sleeping at ten last night.'],
        ['與過去式連用','when + 過去式','I was taking a bath when the phone rang.']
      ]},
      {title:'未來式',headers:['用法','句型','例'],rows:[
        ['未來會發生','will + V','I will call you tomorrow.'],
        ['計畫、打算','be going to + V','She is going to visit Japan.'],
        ['否定','won’t + V / be not going to + V','He won’t come. / He isn’t going to come.']
      ]},
      {title:'現在完成式',headers:['用法','句型','例'],rows:[
        ['已完成','have/has + p.p.','I have finished my homework.'],
        ['經驗','have/has ever/never + p.p.','Have you ever been to Japan?'],
        ['持續','have/has + p.p. + for/since','She has lived here for five years.'],
        ['否定／疑問','haven’t/hasn’t + p.p.；Have/Has + S + p.p.?','I haven’t seen him yet.']
      ]},
      {title:'時態比較',headers:['時態','時間焦點','例'],rows:[
        ['現在簡單','習慣、事實','I go to school by bus.'],
        ['現在進行','現在正在','I am going to school now.'],
        ['過去','過去發生','I went to school yesterday.'],
        ['過去進行','過去某時正在','I was going to school at seven.'],
        ['未來','未來發生','I will go to school tomorrow.'],
        ['現在完成','到目前為止','I have gone to school for six years.']
      ]}
    ],
    examples:[['I play basketball every weekend.','我每個週末打籃球。'],['She is doing her homework now.','她現在正在寫功課。'],['We went to the museum last Sunday.','我們上週日去了博物館。'],['I was watching TV when you called.','你打電話來時，我正在看電視。'],['They will come back tomorrow.','他們明天會回來。'],['He has already eaten lunch.','他已經吃過午餐了。']],
    questions:[
      {q:'She ______ to school every day.',o:['goes','go','going','went'],a:0,e:'every day 用現在簡單，主詞 She 加 -es。'},
      {q:'Look! The baby ______ .',o:['is sleeping','sleeps','slept','sleep'],a:0,e:'Look! 表示現在正在，用現在進行。'},
      {q:'I ______ my homework yesterday.',o:['finished','finish','will finish','am finishing'],a:0,e:'yesterday 用過去式。'},
      {q:'At eight last night, I ______ TV.',o:['was watching','watch','watched','will watch'],a:0,e:'過去某時正在，用過去進行。'},
      {q:'We ______ to the zoo tomorrow.',o:['will go','went','go','have gone'],a:0,e:'tomorrow 用未來式。'},
      {q:'He ______ already ______ lunch.',o:['has / eaten','have / eat','is / eating','did / eat'],a:0,e:'already 搭配現在完成。'},
      {q:'______ you ever ______ to Japan?',o:['Have / been','Did / go','Are / going','Do / go'],a:0,e:'ever 問經驗，用現在完成。'},
      {q:'She ______ here since 2020.',o:['has lived','lived','lives','is living'],a:0,e:'since 2020 用現在完成。'},
      {q:'My brother ______ like milk.',o:['doesn’t','don’t','isn’t','didn’t'],a:0,e:'現在簡單否定，主詞單數用 doesn’t。'},
      {q:'______ she play the piano?',o:['Does','Do','Is','Did'],a:0,e:'現在簡單疑問，主詞 She 用 Does。'},
      {q:'They ______ basketball now.',o:['are playing','play','played','will play'],a:0,e:'now 用現在進行。'},
      {q:'I ______ him last night.',o:['didn’t see','don’t see','haven’t seen','won’t see'],a:0,e:'last night 用過去式。'},
      {q:'It ______ rain tomorrow.',o:['will','is','did','has'],a:0,e:'tomorrow 用 will。'},
      {q:'He ______ his homework yet.',o:['hasn’t finished','didn’t finish','doesn’t finish','won’t finish'],a:0,e:'yet 用現在完成否定。'},
      {q:'We ______ dinner when the doorbell rang.',o:['were having','have','had','are having'],a:0,e:'過去某時正在，用過去進行。'}
    ]};
  D.passive={title:'被動語態',icon:'🔄',color:'#0f766e',
    rules:['被動＝be + 過去分詞（p.p.）；重點在「被怎樣」而不是「誰做」。','原句受詞變成新主詞；原主詞用 by 引出，可省略。','時態變化在 be 動詞：is/are、was/were、has/have been、will be、is being。'],
    sections:[{title:'主動改被動',headers:['主動句','被動句','說明'],rows:[
      ['Tom cleans the room.','The room is cleaned by Tom.','現在簡單：is + p.p.'],
      ['Tom cleaned the room.','The room was cleaned by Tom.','過去：was + p.p.'],
      ['Tom has cleaned the room.','The room has been cleaned by Tom.','現在完成：has been + p.p.'],
      ['Tom will clean the room.','The room will be cleaned by Tom.','未來：will be + p.p.'],
      ['Tom is cleaning the room.','The room is being cleaned by Tom.','現在進行：is being + p.p.'],
      ['Tom can clean the room.','The room can be cleaned by Tom.','助動詞：can be + p.p.']
    ]}],
    examples:[['The cake was made by my mother.','這個蛋糕是我媽媽做的。'],['English is spoken in many countries.','許多國家說英語。'],['The window was broken by the boy.','窗戶被那個男孩打破了。'],['The homework has been finished.','功課已經被完成了。'],['The room will be cleaned tomorrow.','房間明天會被打掃。']],
    questions:[
      {q:'The room ______ by Tom every day.',o:['is cleaned','cleans','cleaned','is cleaning'],a:0,e:'現在簡單被動：is + p.p.。'},
      {q:'The cake ______ by my mother yesterday.',o:['was made','made','is made','makes'],a:0,e:'過去被動：was + p.p.。'},
      {q:'English ______ in many countries.',o:['is spoken','speaks','spoke','is speaking'],a:0,e:'現在簡單被動：is + p.p.。'},
      {q:'The homework ______ already ______ .',o:['has / been finished','have / finished','is / finishing','did / finish'],a:0,e:'現在完成被動：has been + p.p.。'},
      {q:'The window ______ by the boy.',o:['was broken','broke','is breaking','breaks'],a:0,e:'過去被動：was + p.p.。'},
      {q:'The room ______ tomorrow.',o:['will be cleaned','will clean','is cleaning','cleaned'],a:0,e:'未來被動：will be + p.p.。'},
      {q:'The song ______ by many people.',o:['is loved','loves','loved','is loving'],a:0,e:'現在簡單被動。'},
      {q:'The letter ______ yesterday.',o:['was sent','sent','is sent','sends'],a:0,e:'過去被動。'},
      {q:'The car ______ now.',o:['is being washed','is washing','washes','washed'],a:0,e:'現在進行被動：is being + p.p.。'},
      {q:'The work can ______ by us.',o:['be done','do','did','doing'],a:0,e:'助動詞被動：can be + p.p.。'}
    ]};
  D.pronouns={title:'代名詞與限定詞',icon:'👤',color:'#7c3aed',
    rules:['主格當主詞，受格當受詞，所有格後面接名詞。','反身代名詞表示「自己」；指示代名詞指 this/that/these/those。','冠詞 a/an 用於單數可數名詞，the 用於特定或已提過的名詞。'],
    sections:[
      {title:'人稱代名詞',headers:['人稱','主格','受格','所有格'],rows:[
        ['我','I','me','my / mine'],['你','you','you','your / yours'],['他','he','him','his / his'],['她','she','her','her / hers'],['它','it','it','its / its'],['我們','we','us','our / ours'],['你們','you','you','your / yours'],['他們','they','them','their / theirs']
      ]},
      {title:'反身代名詞',headers:['主格','反身','例'],rows:[
        ['I','myself','I made it myself.'],['you','yourself','Be careful yourself.'],['he','himself','He hurt himself.'],['she','herself','She enjoyed herself.'],['it','itself','The cat cleaned itself.'],['we','ourselves','We enjoyed ourselves.'],['they','themselves','They taught themselves.']
      ]},
      {title:'指示代名詞',headers:['單數','複數','用法'],rows:[
        ['this','these','近的'],['that','those','遠的'],['this / that','these / those','可代替前面提過的名詞']
      ]},
      {title:'冠詞',headers:['冠詞','用法','例'],rows:[
        ['a / an','單數可數名詞，第一次提到','a book / an apple'],['the','特定、已提過、獨一無二','the sun / the book on the desk'],['不加冠詞','複數泛指、不可數泛指','I like apples. / I need water.']
      ]},
      {title:'數量詞',headers:['數量詞','用法','例'],rows:[
        ['some','肯定句；可數複數／不可數','some books / some water'],['any','否定句、疑問句','I don’t have any money.'],['many','可數複數','many students'],['much','不可數','much time'],['a few','一些（可數）','a few friends'],['a little','一些（不可數）','a little milk']
      ]}
    ],
    examples:[['She gave me a book.','她給了我一本書。'],['This is my bag; that is yours.','這是我的袋子；那是你的。'],['He hurt himself.','他傷到自己了。'],['I have a few friends here.','我在這裡有一些朋友。'],['There isn’t much water.','水不多了。']],
    questions:[
      {q:'______ is my brother.',o:['He','Him','His','Himself'],a:0,e:'主格用 He。'},
      {q:'Please give ______ the book.',o:['me','I','my','mine'],a:0,e:'受格用 me。'},
      {q:'This bag is ______ .',o:['mine','my','me','I'],a:0,e:'所有格代名詞用 mine。'},
      {q:'She hurt ______ .',o:['herself','her','she','hers'],a:0,e:'反身代名詞用 herself。'},
      {q:'______ are my friends.',o:['They','Them','Their','Themselves'],a:0,e:'主格用 They。'},
      {q:'I don’t have ______ money.',o:['any','some','many','a few'],a:0,e:'否定句用 any。'},
      {q:'There are ______ students in the room.',o:['many','much','a little','any'],a:0,e:'可數複數用 many。'},
      {q:'I need ______ water.',o:['a little','a few','many','any'],a:0,e:'不可數用 a little。'},
      {q:'______ sun is very bright today.',o:['The','A','An','Some'],a:0,e:'獨一無二用 the。'},
      {q:'I saw ______ apple on the table.',o:['an','a','the','some'],a:0,e:'apple 母音開頭用 an。'},
      {q:'______ books are mine.',o:['These','This','That','It'],a:0,e:'複數用 These。'},
      {q:'He enjoyed ______ at the party.',o:['himself','him','his','he'],a:0,e:'反身代名詞用 himself。'},
      {q:'Do you have ______ questions?',o:['any','some','much','a little'],a:0,e:'疑問句用 any。'},
      {q:'My sister and ______ went shopping.',o:['I','me','my','mine'],a:0,e:'主格用 I。'},
      {q:'The book is ______ .',o:['his','him','he','himself'],a:0,e:'所有格代名詞用 his。'}
    ]};
  D.modals={title:'助動詞',icon:'🎛️',color:'#b45309',
    rules:['助動詞後面接原形動詞。','can/could 表能力、許可；may/might 表可能、許可；must 表必須；should 表建議；will/would 表未來或意願。','否定：助動詞 + not + 原形V；疑問：助動詞 + S + 原形V?'],
    sections:[{title:'常見助動詞',headers:['助動詞','意思','例'],rows:[
      ['can','能、會；可以','She can swim.'],['could','過去能；委婉請求','Could you help me?'],['may','可能；可以','It may rain.'],['might','可能（較不確定）','He might come.'],['must','必須','You must wear a seatbelt.'],['have to','必須（外在規定）','I have to go now.'],['should','應該','You should study harder.'],['will','將會','I will call you.'],['would','將會；委婉','Would you like some tea?']
    ]}],
    examples:[['She can speak three languages.','她會說三種語言。'],['You should go to bed early.','你應該早點睡。'],['It may rain this afternoon.','今天下午可能會下雨。'],['We must wear a helmet.','我們必須戴安全帽。'],['Would you like some tea?','你想喝點茶嗎？']],
    questions:[
      {q:'She ______ swim very well.',o:['can','cans','can to','is can'],a:0,e:'can + 原形V。'},
      {q:'You ______ study harder.',o:['should','shoulds','should to','are should'],a:0,e:'should + 原形V。'},
      {q:'It ______ rain tomorrow.',o:['may','mays','may to','is may'],a:0,e:'may + 原形V。'},
      {q:'I ______ go now; my mom is waiting.',o:['have to','has to','having to','am have to'],a:0,e:'have to 表必須。'},
      {q:'______ you help me?',o:['Could','Coulds','Are could','Do could'],a:0,e:'Could you + V? 委婉請求。'},
      {q:'You ______ wear a helmet.',o:['must','musts','must to','are must'],a:0,e:'must + 原形V。'},
      {q:'______ you like some tea?',o:['Would','Woulds','Are would','Do would'],a:0,e:'Would you like…? 固定句型。'},
      {q:'He ______ come later.',o:['might','mights','might to','is might'],a:0,e:'might + 原形V。'},
      {q:'We ______ not run in the hallway.',o:['should','shoulds','are should','do should'],a:0,e:'should not + 原形V。'},
      {q:'She ______ play the piano when she was five.',o:['could','can','could to','is could'],a:0,e:'過去能力用 could。'}
    ]};
  D.linking={title:'連綴動詞',icon:'👀',color:'#0891b2',
    rules:['連綴動詞後面接形容詞，補充主詞的狀態，不接副詞。','look 看起來、sound 聽起來、smell 聞起來、taste 嘗起來、feel 感覺起來。','become/get/turn/grow 表示「變成」，後面也接形容詞。'],
    sections:[{title:'常見連綴動詞',headers:['動詞','意思','例'],rows:[
      ['look','看起來','You look tired.'],['sound','聽起來','That sounds great.'],['smell','聞起來','The flowers smell sweet.'],['taste','嘗起來','The soup tastes good.'],['feel','感覺起來','I feel happy.'],['become','變成','He became a doctor.'],['get','變得','It is getting cold.'],['turn','變成','The leaves turn red.'],['grow','漸漸變得','She grew tall.']
    ]}],
    examples:[['You look tired today.','你今天看起來很累。'],['The idea sounds interesting.','這個主意聽起來很有趣。'],['The cake smells delicious.','蛋糕聞起來很香。'],['It is getting colder.','天氣漸漸變冷了。'],['The leaves turn red in autumn.','葉子在秋天變紅。']],
    questions:[
      {q:'You ______ tired today.',o:['look','looks','looking','looked'],a:0,e:'主詞 You 用原形 look。'},
      {q:'That ______ like a good idea.',o:['sounds','sound','sounding','sounded'],a:0,e:'主詞 That 用 sounds。'},
      {q:'The flowers ______ sweet.',o:['smell','smells','smelling','smelled'],a:0,e:'主詞複數用 smell。'},
      {q:'The soup ______ good.',o:['tastes','taste','tasting','tasted'],a:0,e:'主詞單數用 tastes。'},
      {q:'I ______ happy today.',o:['feel','feels','feeling','felt'],a:0,e:'主詞 I 用 feel。'},
      {q:'It is ______ cold.',o:['getting','get','gets','got'],a:0,e:'is + getting 表示漸漸變得。'},
      {q:'The leaves ______ red in autumn.',o:['turn','turns','turning','turned'],a:0,e:'主詞複數用 turn。'},
      {q:'She ______ a doctor last year.',o:['became','become','becomes','becoming'],a:0,e:'過去式 became。'},
      {q:'This song ______ beautiful.',o:['sounds','sound','sounding','sounded'],a:0,e:'主詞單數用 sounds。'},
      {q:'The milk ______ sour.',o:['smells','smell','smelling','smelled'],a:0,e:'主詞不可數視為單數。'}
    ]};
  D.tagq={title:'附加問句',icon:'❔',color:'#db2777',
    rules:['附加問句接在敘述句後面，用來確認對方是否同意。','肯定敘述句 → 否定附加問句；否定敘述句 → 肯定附加問句。','附加問句的助動詞要和主要子句一致：be / do / have / modal。'],
    sections:[{title:'附加問句變化',headers:['敘述句','附加問句','例'],rows:[
      ['肯定句（be）','be + not + 主詞代名詞？','You are a student, aren’t you?'],
      ['否定句（be）','be + 主詞代名詞？','She isn’t here, is she?'],
      ['肯定句（一般動詞）','don’t/doesn’t/didn’t + 主詞？','You like tea, don’t you?'],
      ['否定句（一般動詞）','do/does/did + 主詞？','He doesn’t know, does he?'],
      ['助動詞','助動詞 + 主詞？','You can swim, can’t you?'],
      ['現在完成','have/has + 主詞？','You have finished, haven’t you?'],
      ['Let’s','shall we?','Let’s go, shall we?'],
      ['祈使句','will you?','Open the door, will you?'],
      ['I am','aren’t I?','I am late, aren’t I?']
    ]}],
    examples:[['You are a student, aren’t you?','你是學生，對吧？'],['She likes music, doesn’t she?','她喜歡音樂，對吧？'],['He can’t swim, can he?','他不會游泳，對吧？'],['Let’s go, shall we?','我們走吧，好嗎？'],['You have finished, haven’t you?','你已經完成了，對吧？']],
    questions:[
      {q:'You are a student, ______ ?',o:['aren’t you','are you','don’t you','do you'],a:0,e:'肯定 be 動詞 → aren’t you。'},
      {q:'She likes music, ______ ?',o:['doesn’t she','does she','isn’t she','is she'],a:0,e:'肯定一般動詞 → doesn’t she。'},
      {q:'He can’t swim, ______ ?',o:['can he','can’t he','does he','doesn’t he'],a:0,e:'否定助動詞 → 肯定附加問句。'},
      {q:'They went home, ______ ?',o:['didn’t they','did they','don’t they','do they'],a:0,e:'過去式 → didn’t they。'},
      {q:'Let’s go, ______ ?',o:['shall we','will we','do we','don’t we'],a:0,e:'Let’s → shall we。'},
      {q:'Open the door, ______ ?',o:['will you','do you','are you','shall you'],a:0,e:'祈使句 → will you。'},
      {q:'I am late, ______ ?',o:['aren’t I','am I','don’t I','do I'],a:0,e:'I am → aren’t I。'},
      {q:'She isn’t here, ______ ?',o:['is she','isn’t she','does she','doesn’t she'],a:0,e:'否定 be → 肯定 is she。'},
      {q:'You have finished, ______ ?',o:['haven’t you','have you','don’t you','do you'],a:0,e:'現在完成 → haven’t you。'},
      {q:'He doesn’t know, ______ ?',o:['does he','doesn’t he','is he','isn’t he'],a:0,e:'否定一般動詞 → does he。'},
      {q:'They are coming, ______ ?',o:['aren’t they','are they','don’t they','do they'],a:0,e:'肯定 be → aren’t they。'},
      {q:'You didn’t see him, ______ ?',o:['did you','didn’t you','do you','don’t you'],a:0,e:'否定過去 → did you。'}
    ]};
  D.clauses.sections=[
    {title:'形容詞子句（關係子句）',headers:['關係詞','用法','例'],rows:[
      ['who','代替人，當主詞','The boy who is singing is my brother.'],
      ['whom','代替人，當受詞','The man whom I met is a teacher.'],
      ['which','代替事物','The book which I bought is new.'],
      ['that','代替人或事物（限定用法）','The girl that won is my sister.'],
      ['whose','表示所有格','The boy whose bag was lost is crying.'],
      ['where','代替地方','The house where he lives is old.'],
      ['when','代替時間','I remember the day when we met.']
    ]},
    {title:'名詞子句',headers:['連接詞','用法','例'],rows:[
      ['that','陳述事實，當主詞／受詞','I know that he is right.'],
      ['whether / if','是否','I don’t know whether he will come.'],
      ['what','所……的事物','What he said made us laugh.'],
      ['who / where / when / why / how','疑問詞當名詞子句','I know where he lives.']
    ]},
    {title:'副詞子句',headers:['連接詞','意思','例'],rows:[
      ['because','因為','I stayed home because it rained.'],
      ['although / though','雖然','Although he was tired, he kept working.'],
      ['if','如果','If it rains, we will stay home.'],
      ['when','當……時','When I got home, my mom was cooking.'],
      ['before / after','在……之前／之後','Wash your hands before you eat.'],
      ['until','直到','Wait until I come back.'],
      ['unless','除非','You will fail unless you study.'],
      ['so that','以便','Speak louder so that everyone can hear.'],
      ['as soon as','一……就……','Call me as soon as you arrive.']
    ]},
    {title:'間接問句',headers:['直接問句','間接問句','說明'],rows:[
      ['Where does he live?','Do you know where he lives?','間接問句用「疑問詞 + S + V」，不用倒裝。'],
      ['What is his name?','Can you tell me what his name is?','be 動詞放回主詞後面。'],
      ['Is she a teacher?','Do you know if she is a teacher?','Yes/No 問句用 if / whether。'],
      ['Can he swim?','I wonder whether he can swim.','whether = 是否。']
    ]}
  ];
  D.clauses.questions=D.clauses.questions.concat([
    {q:'The boy ______ is singing is my brother.',o:['who','which','where','when'],a:0,e:'先行詞是人，用 who。'},
    {q:'The book ______ I bought is new.',o:['which','who','where','when'],a:0,e:'先行詞是事物，用 which。'},
    {q:'I know ______ he is right.',o:['that','what','if','whether'],a:0,e:'陳述事實用 that。'},
    {q:'I don’t know ______ he will come.',o:['whether','that','what','who'],a:0,e:'是否用 whether。'},
    {q:'______ he said made us laugh.',o:['What','That','Which','Who'],a:0,e:'所……的事物用 What。'},
    {q:'I stayed home ______ it rained.',o:['because','although','if','unless'],a:0,e:'原因用 because。'},
    {q:'______ he was tired, he kept working.',o:['Although','Because','If','So'],a:0,e:'讓步用 Although。'},
    {q:'Wait ______ I come back.',o:['until','because','although','if'],a:0,e:'直到用 until。'},
    {q:'Do you know where ______ ?',o:['he lives','does he live','he live','is he live'],a:0,e:'間接問句不倒裝。'},
    {q:'Can you tell me what ______ ?',o:['his name is','is his name','his name does','does his name'],a:0,e:'間接問句 be 動詞放後面。'}
  ]);
  D.adv.sections=[{title:'頻率副詞',headers:['頻率','副詞','例'],rows:[
    ['100%','always','I always get up early.'],['80%','usually','She usually walks to school.'],['60%','often','We often play tennis.'],['40%','sometimes','He sometimes eats out.'],['20%','seldom','I seldom watch TV.'],['0%','never','She never smokes.']
  ]}];
  D.twowords.phraseGroups.push({title:'進階句型',rows:[
    ['so...that...','如此……以致於……','He was so tired that he fell asleep.'],
    ['such...that...','如此……以致於……','It was such a good movie that we watched it twice.'],
    ['neither...nor...','既不……也不……','Neither Tom nor Amy was late.'],
    ['too...to...','太……而不能……','She is too young to drive.'],
    ['not only...but also...','不但……而且……','He is not only smart but also kind.']
  ]});
  D.verbs.questions=[
    {q:'go 的過去式是？',o:['went','goed','gone','going'],a:0,e:'go-went-gone。'},
    {q:'eat 的過去分詞是？',o:['eaten','ate','eated','eating'],a:0,e:'eat-ate-eaten。'},
    {q:'see 的過去式是？',o:['saw','seen','seed','seeing'],a:0,e:'see-saw-seen。'},
    {q:'write 的過去分詞是？',o:['written','wrote','writed','writing'],a:0,e:'write-wrote-written。'},
    {q:'take 的過去式是？',o:['took','taken','taked','taking'],a:0,e:'take-took-taken。'},
    {q:'buy 的過去分詞是？',o:['bought','buyed','buying','buys'],a:0,e:'buy-bought-bought。'},
    {q:'teach 的過去式是？',o:['taught','teached','teaching','teachs'],a:0,e:'teach-taught-taught。'},
    {q:'swim 的過去分詞是？',o:['swum','swam','swimmed','swimming'],a:0,e:'swim-swam-swum。'},
    {q:'begin 的過去式是？',o:['began','begun','begined','beginning'],a:0,e:'begin-began-begun。'},
    {q:'break 的過去分詞是？',o:['broken','broke','breaked','breaking'],a:0,e:'break-broke-broken。'}
  ];

  D.nouns.sections=[{title:'規則複數變化',headers:['規則','變化','例'],rows:[
    ['一般名詞','+s','book → books'],
    ['字尾 s/x/ch/sh/o','+es','bus → buses / box → boxes / watch → watches / potato → potatoes'],
    ['子音 + y','y → ies','baby → babies'],
    ['母音 + y','+s','boy → boys'],
    ['字尾 f / fe','f/fe → ves','leaf → leaves / knife → knives'],
    ['不規則','整個字改變','child → children / man → men / woman → women / mouse → mice / foot → feet / tooth → teeth'],
    ['單複數同型','不加 s','sheep / deer / fish / species']
  ]}];
  D.adj.sections=[{title:'形容詞基本用法',headers:['位置','用法','例'],rows:[
    ['名詞前','修飾名詞','a tall boy / two red apples'],
    ['be 動詞後','補充主詞','She is happy.'],
    ['連綴動詞後','look/sound/smell/taste/feel + adj','You look tired.'],
    ['不定代名詞後','形容詞放在後面','something nice / nothing new']
  ]}];
  D.adv.sections.push({title:'副詞形成',headers:['規則','變化','例'],rows:[
    ['形容詞 + ly','quick → quickly','He runs quickly.'],
    ['子音 + y','y → ily','happy → happily'],
    ['去 e + ly','gentle → gently','She spoke gently.'],
    ['不規則','good → well','She sings well.'],
    ['形容詞／副詞同型','fast / hard / late / early / high / low / deep / near / far / long / straight / right / wrong','He runs fast. / She studies hard.']
  ]});
  D.pronouns.sections.push({title:'不定代名詞',headers:['代名詞','意思','例'],rows:[
    ['someone / somebody','某人（肯定）','Someone is at the door.'],
    ['anyone / anybody','任何人（否定／疑問）','Is anyone home?'],
    ['no one / nobody','沒有人','No one knows the answer.'],
    ['everyone / everybody','每個人','Everyone is here.'],
    ['something','某事（肯定）','I have something to tell you.'],
    ['anything','任何事（否定／疑問）','Do you need anything?'],
    ['nothing','沒有東西','There is nothing in the box.'],
    ['everything','一切','Everything is ready.']
  ]});

  D.adj.rules.push('原級比較：as + 形容詞 + as（和……一樣）；否定 not as … as（不如……）。','less + 形容詞 + than（比較不……）；one of the + 最高級 + 複數（最……之一）。');
  D.adv.rules.push('原級比較：as + 副詞 + as；否定 not as … as。','less + 副詞 + than（比較不……）。');
  D.pronouns.sections.push({title:'所有格',headers:['形式','用法','例'],rows:[
    ['名詞 + ’s','人或動物擁有','Amy’s bag / my brother’s bike'],
    ['of + 名詞','無生命事物所屬','the legs of the table'],
    ['所有格代名詞','mine / yours / his / hers / ours / theirs','This book is mine.']
  ]});
  D.participles.sections=[{title:'一般分詞',headers:['形式','用法','例'],rows:[
    ['現在分詞 Ving','主動、正在進行；修飾名詞','The boy standing there is my brother.'],
    ['過去分詞 p.p.','被動、已完成；修飾名詞','The book written by him is famous.'],
    ['情緒分詞','-ing 令人…／-ed 感到…','The movie is exciting. / I am excited.']
  ]}];
})();
