import type { TriviaQuestion } from '../types/game.ts';

export const WORLD_AND_KNOWLEDGE_QUESTIONS: TriviaQuestion[] = [
  // ========================
  // CATEGORY 5: FOOTBALL
  // ========================
  {
    id: 'fb_wc_1',
    categoryId: 'football',
    subcategory: { ar: 'كأس العالم FIFA', en: 'FIFA World Cup' },
    topicTag: 'FIFA World Cup',
    questionType: 'speed_round',
    difficulty: 'easy',
    prompt: {
      ar: 'ما المنتخب الأكثر تتويجاً بكأس العالم لكرة القدم عبر التاريخ (5 ألقاب)؟',
      en: 'Which national team holds the all-time record with 5 FIFA World Cup titles?',
    },
    options: [
      { ar: 'البرازيل', en: 'Brazil' },
      { ar: 'ألمانيا', en: 'Germany' },
      { ar: 'الأرجنتين', en: 'Argentina' },
      { ar: 'إيطاليا', en: 'Italy' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'توجت البرازيل بكأس العالم 5 مرات أعوام 1958 و1962 و1970 و1994 و2002.',
      en: 'Brazil won the World Cup five times: 1958, 1962, 1970, 1994, and 2002.',
    },
    points: 120,
  },
  {
    id: 'fb_ucl_1',
    categoryId: 'football',
    subcategory: { ar: 'دوري أبطال أوروبا', en: 'UEFA Champions League' },
    topicTag: 'UEFA Champions League',
    questionType: 'guess_the_logo',
    difficulty: 'easy',
    prompt: {
      ar: 'كرة النجوم الثماني هذا يرمز لأي بطولة كروية أوروبية كبرى؟',
      en: 'Which premier European football competition is symbolized by this star-ball emblem?',
    },
    logoKey: 'champions_star',
    options: [
      { ar: 'دوري أبطال أوروبا', en: 'UEFA Champions League' },
      { ar: 'الدوري الأوروبي', en: 'UEFA Europa League' },
      { ar: 'كأس العالم للأندية', en: 'FIFA Club World Cup' },
      { ar: 'كوبا ليبرتادوريس', en: 'Copa Libertadores' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'كرة النجوم (Starball) هي الشعار الرسمي لدوري أبطال أوروبا منذ عام 1992.',
      en: 'The eight-star Starball logo has represented the UEFA Champions League since 1992.',
    },
    points: 130,
  },
  {
    id: 'fb_leg_1',
    categoryId: 'football',
    subcategory: { ar: 'الأساطير', en: 'Legends' },
    topicTag: 'Football Legends',
    questionType: 'who_am_i',
    difficulty: 'medium',
    prompt: {
      ar: 'من أنا؟ نجم مصري سجّلتُ رقماً قياسياً تاريخياً في عدد الأهداف بموسم واحد من الدوري الإنجليزي (32 هدفاً في 38 جولة).',
      en: 'Who Am I? An Egyptian forward who set a 38-game Premier League scoring record of 32 goals.',
    },
    hints: [
      { ar: 'ألعب بقميص نادي ليفربول منذ عام 2017.', en: 'I have starred for Liverpool FC since 2017.' },
      { ar: 'تُلقبني الجماهير بـ "الملك المصري".', en: 'Fans affectionately call me "The Egyptian King".' },
      { ar: 'اسمي محمد صلاح.', en: 'My name is Mohamed Salah.' },
    ],
    options: [
      { ar: 'محمد صلاح', en: 'Mohamed Salah' },
      { ar: 'رياض محرز', en: 'Riyad Mahrez' },
      { ar: 'ساديو ماني', en: 'Sadio Mané' },
      { ar: 'عمر مرموش', en: 'Omar Marmoush' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'سجّل محمد صلاح 32 هدفاً في موسم 2017–2018 مع ليفربول وحقق الحذاء الذهبي.',
      en: 'Mohamed Salah scored 32 goals in the 2017–18 Premier League campaign for Liverpool.',
    },
    points: 150,
  },

  // ========================
  // CATEGORY 6: SPORTS
  // ========================
  {
    id: 'spt_oly_1',
    categoryId: 'sports',
    subcategory: { ar: 'الألعاب الأولمبية', en: 'Olympic Games' },
    topicTag: 'Olympic Games',
    questionType: 'guess_the_logo',
    difficulty: 'easy',
    prompt: {
      ar: 'الحلقات الخمس المتشابكة تمثل أي حدث رياضي عالمي؟',
      en: 'Which global multi-sport event is represented by these five interlocking rings?',
    },
    logoKey: 'olympic_rings',
    options: [
      { ar: 'الألعاب الأولمبية', en: 'The Olympic Games' },
      { ar: 'دوري NBA', en: 'NBA Finals' },
      { ar: 'فورمولا 1', en: 'Formula 1' },
      { ar: 'بطولة ويمبلدون', en: 'Wimbledon' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'تمثل الحلقات الخمس القارات الخمس المأهولة التي تجتمع في الألعاب الأولمبية.',
      en: 'The five interlocking rings symbolize the union of the five continents at the Olympic Games.',
    },
    points: 110,
  },
  {
    id: 'spt_f1_1',
    categoryId: 'sports',
    subcategory: { ar: 'فورمولا 1', en: 'Formula 1' },
    topicTag: 'Formula 1',
    questionType: 'true_false',
    difficulty: 'medium',
    prompt: {
      ar: 'تقع حلبة مرسى ياس التي تستضيف سباق جائزة أبوظبي الكبرى للفورمولا 1 في دولة الإمارات العربية المتحدة.',
      en: 'The Yas Marina Circuit, host of the Abu Dhabi Formula 1 Grand Prix, is located in the UAE.',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، تستضيف حلبة مرسى ياس في أبوظبي ختام موسم الفورمولا 1 سنوياً منذ عام 2009.',
      en: 'True. Yas Marina Circuit in Abu Dhabi has hosted the F1 Grand Prix since 2009.',
    },
    points: 120,
  },

  // ========================
  // CATEGORY 7: MUSIC
  // ========================
  {
    id: 'mus_snd_1',
    categoryId: 'music',
    subcategory: { ar: 'الآلات الموسيقية', en: 'Instruments' },
    topicTag: 'Musical Chords',
    questionType: 'guess_the_sound',
    difficulty: 'medium',
    prompt: {
      ar: 'استمع إلى هذا التألف الموسيقي الختامي؛ هل يعبّر عن تآلف كبير مبهج (Major) أم انطفاء هبوطي؟',
      en: 'Listen to this rich resonant chord progression—what musical mood does it express?',
    },
    soundKey: 'victory_chord_major',
    soundCaption: { ar: 'تآلف ثلاثي كبير متوازن ومشرق', en: 'Warm major triad resolution chord' },
    options: [
      { ar: 'تآلف نصر مبهج (Major Victory Chord)', en: 'Major Victory Chord' },
      { ar: 'هبوط انطفاء إلكتروني (Power Down)', en: 'Retro Power Down' },
      { ar: 'نبضة سونار بحرية', en: 'Ocean Sonar Ping' },
      { ar: 'دقة عداد تنازلي', en: 'Countdown Tick' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'التآلف الكبير (Major Triad) يمنح إحساساً بالإشراق والانتصار والاكتمال اللحني.',
      en: 'A major triad chord resolves cleanly with an uplifting, triumphant harmonic tone.',
    },
    points: 150,
  },
  {
    id: 'mus_inst_1',
    categoryId: 'music',
    subcategory: { ar: 'الموسيقى العربية', en: 'Arabic Music' },
    topicTag: 'Arabic Music',
    questionType: 'true_false',
    difficulty: 'easy',
    prompt: {
      ar: 'آلة العود الشرقية تُصنف ضمن الآلات الوترية وتُعزف تقليدياً باستخدام ريشة.',
      en: 'The traditional Arabic Oud is a stringed instrument typically played with a plectrum (risha).',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، يُعد العود عماد الطرب العربي الأصيل ويُعزف بريشة خاصة لإخراج نغمات المقامات.',
      en: 'True. The fretless Oud is central to classical Arabic music and played with a risha.',
    },
    points: 100,
  },

  // ========================
  // CATEGORY 8: SCIENCE
  // ========================
  {
    id: 'sci_ast_1',
    categoryId: 'science',
    subcategory: { ar: 'الفضاء', en: 'Space' },
    topicTag: 'Astronomy',
    questionType: 'speed_round',
    difficulty: 'easy',
    prompt: {
      ar: 'ما أقرب كوكب إلى الشمس في مجموعتنا الشمسية؟',
      en: 'Which planet is closest to the Sun in our Solar System?',
    },
    options: [
      { ar: 'عطارد (Mercury)', en: 'Mercury' },
      { ar: 'الزهرة (Venus)', en: 'Venus' },
      { ar: 'المريخ (Mars)', en: 'Mars' },
      { ar: 'الأرض (Earth)', en: 'Earth' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'عطارد هو أقرب كوكب إلى الشمس ويكمل دورته حولها في نحو 88 يوماً أرضياً.',
      en: 'Mercury orbits closest to the Sun, completing a revolution every 88 Earth days.',
    },
    points: 110,
  },
  {
    id: 'sci_chem_1',
    categoryId: 'science',
    subcategory: { ar: 'الكيمياء', en: 'Chemistry' },
    topicTag: 'Chemistry',
    questionType: 'true_false',
    difficulty: 'medium',
    prompt: {
      ar: 'الرمز الكيميائي لعنصر الذهب في الجدول الدوري هو Au.',
      en: 'The chemical symbol for Gold on the periodic table is Au.',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، يرمز Au إلى الذهب اشتقاقاً من الكلمة اللاتينية Aurum.',
      en: 'True. Au comes from the Latin word for gold, "aurum".',
    },
    points: 110,
  },
  {
    id: 'sci_bio_1',
    categoryId: 'science',
    subcategory: { ar: 'جسم الإنسان', en: 'Human Body' },
    topicTag: 'Human Body',
    questionType: 'who_am_i',
    difficulty: 'medium',
    prompt: {
      ar: 'من أنا؟ أكبر عضو داخلي في جسم الإنسان وأؤدي أكثر من 500 وظيفة تشمل تنقية السموم وإنتاج العصارة الصفراوية.',
      en: 'Who Am I? The largest internal organ in the human body, performing detoxification and producing bile.',
    },
    hints: [
      { ar: 'أقع في الجانب الأيمن العلوي من تجويف البطن.', en: 'I sit in the upper right quadrant of the abdomen.' },
      { ar: 'أتميز بقدرة مذهلة على تجديد أنسجتي ذاتياً.', en: 'I am uniquely capable of regenerating lost tissue.' },
      { ar: 'أنا الكبد.', en: 'I am the human Liver.' },
    ],
    options: [
      { ar: 'الكبد (Liver)', en: 'Liver' },
      { ar: 'الطحال (Spleen)', en: 'Spleen' },
      { ar: 'البنكرياس (Pancreas)', en: 'Pancreas' },
      { ar: 'الكلية (Kidney)', en: 'Kidney' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'الكبد هو أكبر غدة وعضو داخلي في الجسم ويلعب دوراً حيوياً في الأيض وتنقية الدم.',
      en: 'The liver is the largest internal organ and handles metabolism and detoxification.',
    },
    points: 150,
  },

  // ========================
  // CATEGORY 9: TECHNOLOGY
  // ========================
  {
    id: 'tech_lang_1',
    categoryId: 'technology',
    subcategory: { ar: 'لغات البرمجة', en: 'Programming Languages' },
    topicTag: 'Programming',
    questionType: 'speed_round',
    difficulty: 'easy',
    prompt: {
      ar: 'أي لغة برمجة سُميت تيمناً بالفرقة الكوميدية البريطانية Monty Python وليس باسم الأفعى؟',
      en: 'Which programming language was named after the comedy troupe Monty Python rather than a snake?',
    },
    options: [
      { ar: 'بايثون (Python)', en: 'Python' },
      { ar: 'روبي (Ruby)', en: 'Ruby' },
      { ar: 'جافا (Java)', en: 'Java' },
      { ar: 'راست (Rust)', en: 'Rust' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'ابتكر غيدو فان روسوم لغة Python عام 1991 وأطلق عليها هذا الاسم إعجاباً بعروض Monty Python.',
      en: 'Guido van Rossum named Python after Monty Python’s Flying Circus in 1991.',
    },
    points: 130,
  },
  {
    id: 'tech_logo_1',
    categoryId: 'technology',
    subcategory: { ar: 'أندرويد', en: 'Android' },
    topicTag: 'Android',
    questionType: 'guess_the_logo',
    difficulty: 'easy',
    prompt: {
      ar: 'رأس الروبوت ذو القرنين الهوائيين يمثّل أي نظام تشغيل عالمي للهواتف؟',
      en: 'Which mobile operating system is symbolized by this clean geometric robot head with antennae?',
    },
    logoKey: 'android_bot',
    options: [
      { ar: 'أندرويد (Android)', en: 'Android' },
      { ar: 'آي أو إس (iOS)', en: 'iOS' },
      { ar: 'لينكس أوبونتو (Ubuntu)', en: 'Ubuntu' },
      { ar: 'ويندوز (Windows)', en: 'Windows' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'الروبوت الأخضر (Bugdroid) هو الشعار الرسمي لنظام التشغيل Android المطور من جوجل.',
      en: 'The iconic Bugdroid robot head represents Google’s Android operating system.',
    },
    points: 110,
  },

  // ========================
  // CATEGORY 10: GEOGRAPHY
  // ========================
  {
    id: 'geo_om_1',
    categoryId: 'geography',
    subcategory: { ar: 'دول الخليج', en: 'Gulf Countries' },
    topicTag: 'Gulf Countries',
    questionType: 'speed_round',
    difficulty: 'easy',
    prompt: {
      ar: 'ما عاصمة سلطنة عُمان؟',
      en: 'What is the capital city of the Sultanate of Oman?',
    },
    options: [
      { ar: 'مسقط', en: 'Muscat' },
      { ar: 'صلالة', en: 'Salalah' },
      { ar: 'نزوى', en: 'Nizwa' },
      { ar: 'صحار', en: 'Sohar' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'مسقط هي عاصمة سلطنة عُمان وأكبر مدنها وتطل على خليج عُمان.',
      en: 'Muscat is the capital and largest city of Oman, overlooking the Gulf of Oman.',
    },
    points: 110,
  },
  {
    id: 'geo_riv_1',
    categoryId: 'geography',
    subcategory: { ar: 'الأنهار', en: 'Rivers' },
    topicTag: 'Rivers',
    questionType: 'true_false',
    difficulty: 'easy',
    prompt: {
      ar: 'يمر نهر النيل عبر عدة دول أفريقية قبل أن يصب في البحر الأبيض المتوسط عبر مصر.',
      en: 'The Nile River flows northward through multiple African nations before emptying into the Mediterranean Sea in Egypt.',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، يتجه نهر النيل من الجنوب إلى الشمال وصولاً إلى دلتا مصر في البحر المتوسط.',
      en: 'True. The Nile flows northward for over 6,600 km into the Mediterranean Sea.',
    },
    points: 100,
  },

  // ========================
  // CATEGORY 11: HISTORY
  // ========================
  {
    id: 'his_eg_1',
    categoryId: 'history',
    subcategory: { ar: 'مصر القديمة', en: 'Ancient Egypt' },
    topicTag: 'Ancient Egypt',
    questionType: 'speed_round',
    difficulty: 'easy',
    prompt: {
      ar: 'أي حجر أثري شهير مكن العالم شامبليون من فك رموز الكتابة الهيروغليفية المصرية؟',
      en: 'Which ancient stone slab enabled Jean-François Champollion to decipher Egyptian hieroglyphs?',
    },
    options: [
      { ar: 'حجر رشيد (Rosetta Stone)', en: 'The Rosetta Stone' },
      { ar: 'مسلة حمورابي', en: 'Code of Hammurabi' },
      { ar: 'حجر موآب', en: 'Mesha Stele' },
      { ar: 'لوح جلجامش', en: 'Epic of Gilgamesh Tablet' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'تضمّن حجر رشيد نصاً واحداً بثلاث كتابات: الهيروغليفية والديموطيقية واليونانية القديمة.',
      en: 'The Rosetta Stone carried the same decree in Hieroglyphs, Demotic, and Ancient Greek.',
    },
    points: 130,
  },
  {
    id: 'his_isl_1',
    categoryId: 'history',
    subcategory: { ar: 'التاريخ الإسلامي', en: 'Islamic History' },
    topicTag: 'Islamic History',
    questionType: 'who_am_i',
    difficulty: 'medium',
    prompt: {
      ar: 'من أنا؟ عالم رياضيات وفلكي عاش في بيت الحكمة ببغداد ويُعد مؤسس علم الجبر.',
      en: 'Who Am I? A scholar at Baghdad’s House of Wisdom recognized as the founder of Algebra.',
    },
    hints: [
      { ar: 'اشتُق اسمي اللاتيني إلى مصطلح "الخوارزمية" (Algorithm).', en: 'My Latinized name gave rise to the word "Algorithm".' },
      { ar: 'ألّفتُ كتاب "المختصر في حساب الجبر والمقابلة".', en: 'I authored the foundational book "Al-Jabr".' },
      { ar: 'أنا محمد بن موسى الخوارزمي.', en: 'I am Muhammad ibn Musa al-Khwarizmi.' },
    ],
    options: [
      { ar: 'محمد بن موسى الخوارزمي', en: 'Al-Khwarizmi' },
      { ar: 'ابن الهيثم', en: 'Ibn al-Haytham' },
      { ar: 'ابن سينا', en: 'Ibn Sina (Avicenna)' },
      { ar: 'البيروني', en: 'Al-Biruni' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'وضع الخوارزمي أسس علم الجبر في القرن التاسع الميلادي وخلّد اسمه في علم الخوارزميات.',
      en: 'Al-Khwarizmi founded algebra in 9th-century Baghdad and inspired the term algorithm.',
    },
    points: 160,
  },

  // ========================
  // CATEGORY 12: FOOD & DRINKS
  // ========================
  {
    id: 'food_ar_1',
    categoryId: 'food_drinks',
    subcategory: { ar: 'الطعام العماني', en: 'Omani Food' },
    topicTag: 'Omani Food',
    questionType: 'true_false',
    difficulty: 'medium',
    prompt: {
      ar: 'تُحضَّر وجبة "الشواء العُماني" تقليدياً بلف اللحم المتبّل بأوراق الموز وطهيه ببطء في حفرة جمر تحت الأرض.',
      en: 'Traditional Omani Shuwa is marinated meat wrapped in banana leaves and slow-cooked in an underground pit.',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، يُعد الشواء العُماني من أعرق الأطباق الاحتفالية في سلطنة عُمان خاصة في الأعياد.',
      en: 'True. Shuwa is Oman’s signature festive dish, slow-roasted underground over embers.',
    },
    points: 130,
  },
  {
    id: 'food_it_1',
    categoryId: 'food_drinks',
    subcategory: { ar: 'المطبخ الإيطالي', en: 'Italian Cuisine' },
    topicTag: 'Italian Cuisine',
    questionType: 'speed_round',
    difficulty: 'easy',
    prompt: {
      ar: 'ما المكونات الأساسية الثلاثة لبيتزا مارغريتا الكلاسيكية التي تعكس ألوان العلم الإيطالي؟',
      en: 'What three classic toppings on Pizza Margherita represent the colors of the Italian flag?',
    },
    options: [
      { ar: 'الطماطم والموزاريلا والريحان', en: 'Tomato, Mozzarella, and Basil' },
      { ar: 'الفلفل والزيتون والجبن الأزرق', en: 'Peppers, Olives, and Blue Cheese' },
      { ar: 'البيبروني والبارميزان والفطر', en: 'Pepperoni, Parmesan, and Mushroom' },
      { ar: 'الثوم والسبانخ والريكوتا', en: 'Garlic, Spinach, and Ricotta' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'الأحمر من صلصة الطماطم، والأبيض من جبن الموزاريلا، والأخضر من أوراق الريحان الطازج.',
      en: 'Red tomato sauce, white mozzarella, and green fresh basil represent the Italian tricolor.',
    },
    points: 120,
  },

  // ========================
  // CATEGORY 13: ANIMALS & NATURE
  // ========================
  {
    id: 'nat_mam_1',
    categoryId: 'animals_nature',
    subcategory: { ar: 'الكائنات البحرية', en: 'Marine Animals' },
    topicTag: 'Marine Animals',
    questionType: 'guess_the_sound',
    difficulty: 'medium',
    prompt: {
      ar: 'استمع إلى نبضات الصدى البحرية هذه؛ ما التقنية أو الصوت الذي يمثل نبضات السونار والاتصال تحت الماء؟',
      en: 'Listen to this clean echoing underwater pulse—what marine/nautical sound does it depict?',
    },
    soundKey: 'radar_ping_sonar',
    soundCaption: { ar: 'نبضة صوتية نقية تتلاشى بصدى مائي', en: 'Resonant underwater sonar ping echo' },
    options: [
      { ar: 'نبضة سونار / تحديد الموقع بالصدى', en: 'Sonar / Echolocation Ping' },
      { ar: 'زئير بركاني', en: 'Volcanic Rumble' },
      { ar: 'صفارة قطار بخاري', en: 'Steam Train Whistle' },
      { ar: 'سقوط عملة معدنية', en: 'Falling Coin' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'تستخدم الغواصات كما تستخدم الدلافين والحيتان الموجات الصوتية المرتدة (الصدى) لتحديد الموقع في الأعماق.',
      en: 'Both marine mammals like dolphins and submarines navigate the depths via sonar echoes.',
    },
    points: 150,
  },
  {
    id: 'nat_pred_1',
    categoryId: 'animals_nature',
    subcategory: { ar: 'الحيوانات المفترسة', en: 'Predators' },
    topicTag: 'Predators',
    questionType: 'true_false',
    difficulty: 'easy',
    prompt: {
      ar: 'يُعد الفهد الصياد (Cheetah) أسرع حيوان بري في العالم في المسافات القصيرة.',
      en: 'The Cheetah is the fastest land animal in the world over short sprints.',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، تصل سرعة الفهد الصياد إلى نحو 100–120 كيلومتراً في الساعة أثناء المطاردة.',
      en: 'True. Cheetahs can sprint at speeds exceeding 100 km/h (60+ mph) in short bursts.',
    },
    points: 100,
  },

  // ========================
  // CATEGORY 14: LITERATURE & BOOKS
  // ========================
  {
    id: 'lit_poet_1',
    categoryId: 'literature_books',
    subcategory: { ar: 'الشعر العربي', en: 'Arabic Poetry' },
    topicTag: 'Arabic Poetry',
    questionType: 'speed_round',
    difficulty: 'medium',
    prompt: {
      ar: 'من قائل البيت الشهير: "الخيل والليل والبيداء تعرفني * والسيف والرمح والقرطاس والقلم"؟',
      en: 'Which classical Arab poet wrote the famous verse "The horses, the night, and the desert know me"?',
    },
    options: [
      { ar: 'أبو الطيب المتنبي', en: 'Al-Mutanabbi' },
      { ar: 'امرؤ القيس', en: 'Imru al-Qais' },
      { ar: 'عنترة بن شداد', en: 'Antarah ibn Shaddad' },
      { ar: 'أحمد شوقي', en: 'Ahmad Shawqi' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'هذا البيت من أشهر أبيات الفخر للشاعر العربي العظيم أبي الطيب المتنبي.',
      en: 'This celebrated verse belongs to Abu al-Tayyib al-Mutanabbi, one of the greatest Arab poets.',
    },
    points: 140,
  },

  // ========================
  // CATEGORY 16: BRANDS & COMPANIES
  // ========================
  {
    id: 'brd_merc_1',
    categoryId: 'brands_companies',
    subcategory: { ar: 'شركات السيارات', en: 'Car Companies' },
    topicTag: 'Mercedes-Benz',
    questionType: 'guess_the_logo',
    difficulty: 'easy',
    prompt: {
      ar: 'النجمة الثلاثية داخل الدائرة هي الشعار الكلاسيكي لأي شركة سيارات ألمانية؟',
      en: 'Which German automaker uses this three-pointed star inside a circle?',
    },
    logoKey: 'mercedes_star',
    options: [
      { ar: 'مرسيدس-بنز (Mercedes-Benz)', en: 'Mercedes-Benz' },
      { ar: 'بي إم دبليو (BMW)', en: 'BMW' },
      { ar: 'أودي (Audi)', en: 'Audi' },
      { ar: 'بورشه (Porsche)', en: 'Porsche' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'ترمز النجمة الثلاثية لمرسيدس-بنز إلى طموح الشركة في تصنيع محركات للبر والبحر والجو.',
      en: 'Mercedes-Benz’s three-pointed star symbolizes dominance on land, sea, and air.',
    },
    points: 120,
  },
  {
    id: 'brd_sp_1',
    categoryId: 'brands_companies',
    subcategory: { ar: 'الشعارات', en: 'Logos' },
    topicTag: 'Spotify',
    questionType: 'guess_the_logo',
    difficulty: 'easy',
    prompt: {
      ar: 'الخطوط المنحنية الثلاثية داخل الدائرة تمثّل أي خدمة بث موسيقي عالمية؟',
      en: 'Which global music streaming platform is represented by these three curved sound waves?',
    },
    logoKey: 'spotify_waves',
    options: [
      { ar: 'سبوتيفاي (Spotify)', en: 'Spotify' },
      { ar: 'أنغامي (Anghami)', en: 'Anghami' },
      { ar: 'ساوند كلاود (SoundCloud)', en: 'SoundCloud' },
      { ar: 'أبل ميوزك (Apple Music)', en: 'Apple Music' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'الأقواس الصوتية المائلة داخل الدائرة الخضراء هي الهوية البصرية لمنصة Spotify.',
      en: 'The three tilted sound wave arcs inside a circle form the Spotify logo.',
    },
    points: 110,
  },

  // ========================
  // CATEGORY 17: CARS & VEHICLES
  // ========================
  {
    id: 'car_aud_1',
    categoryId: 'cars_vehicles',
    subcategory: { ar: 'الشركات المصنعة', en: 'Manufacturers' },
    topicTag: 'Audi',
    questionType: 'guess_the_logo',
    difficulty: 'easy',
    prompt: {
      ar: 'الحلقات الأربع المتشابكة أفقياً هي شعار أي شركة سيارات؟',
      en: 'Which automobile manufacturer is identified by four horizontally interlocking rings?',
    },
    logoKey: 'audi_rings',
    options: [
      { ar: 'أودي (Audi)', en: 'Audi' },
      { ar: 'فولكسفاغن (Volkswagen)', en: 'Volkswagen' },
      { ar: 'فولفو (Volvo)', en: 'Volvo' },
      { ar: 'فيراري (Ferrari)', en: 'Ferrari' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'تمثل الحلقات الأربع اتحاد أربع شركات ألمانية عام 1932 لتشكيل Auto Union التي أصبحت Audi.',
      en: 'Audi’s four rings symbolize the 1932 merger of four Saxon automakers into Auto Union.',
    },
    points: 110,
  },

  // ========================
  // CATEGORY 18: GENERAL KNOWLEDGE
  // ========================
  {
    id: 'gk_fact_1',
    categoryId: 'general_knowledge',
    subcategory: { ar: 'حقائق علمية', en: 'Scientific Facts' },
    topicTag: 'General Knowledge',
    questionType: 'true_false',
    difficulty: 'medium',
    prompt: {
      ar: 'تتمتع حيوانات الأخطبوط بثلاثة قلوب ودم أزرق اللون يعتمد على النحاس.',
      en: 'Octopuses have three hearts and copper-based blue blood.',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، يمتلك الأخطبوط قلبين لضخ الدم عبر الخياشيم وقلباً ثالثاً لبقية الجسم، ويمنحه الهيموسيانين لوناً أزرق.',
      en: 'True. Two hearts pump blood through the gills, one circulates it, and hemocyanin turns it blue.',
    },
    points: 120,
  },

  // ========================
  // CATEGORY 19: LANGUAGE & WORDS
  // ========================
  {
    id: 'lang_ar_1',
    categoryId: 'language_words',
    subcategory: { ar: 'المفرد والجمع', en: 'Singular and Plural' },
    topicTag: 'Arabic Vocabulary',
    questionType: 'speed_round',
    difficulty: 'hard',
    prompt: {
      ar: 'ما الجمع الفصيح الصحيح لكلمة "عندليب" في اللغة العربية؟',
      en: 'What is the classical Arabic plural of the word "Andaleeb" (Nightingale)?',
    },
    options: [
      { ar: 'عنادل', en: 'Anadil (عنادل)' },
      { ar: 'عندلبات', en: 'Andalibat (عندلبات)' },
      { ar: 'عنادلون', en: 'Anadiloon (عنادلون)' },
      { ar: 'أعنادل', en: 'A’anadil (أعنادل)' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'تُجمع كلمة عندليب جمع تكسير على وزن فعالل فتصبح: عنادل.',
      en: 'In Arabic morphology, the broken plural of Andaleeb (عندليب) is Anadil (عنادل).',
    },
    points: 160,
  },

  // ========================
  // CATEGORY 20: RELIGION & CULTURE (Verified & Respectful)
  // ========================
  {
    id: 'rel_cul_1',
    categoryId: 'religion_culture',
    subcategory: { ar: 'السيرة النبوية', en: 'Seerah' },
    topicTag: 'Islamic History',
    questionType: 'true_false',
    difficulty: 'easy',
    prompt: {
      ar: 'كانت الهجرة النبوية الشريفة من مكة المكرمة إلى المدينة المنورة هي نقطة بداية التقويم الهجري.',
      en: 'The Prophet’s migration (Hijrah) from Makkah to Madinah marks the starting point of the Islamic Hijri calendar.',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، اعتمد الخليفة عمر بن الخطاب رضي الله عنه عام الهجرة بدايةً للتقويم الهجري.',
      en: 'True. Caliph Umar ibn al-Khattab established the Hijri calendar beginning in the year of the Hijrah.',
    },
    points: 100,
  },
  {
    id: 'rel_mos_1',
    categoryId: 'religion_culture',
    subcategory: { ar: 'المساجد التاريخية', en: 'Mosques' },
    topicTag: 'Mosques',
    questionType: 'speed_round',
    difficulty: 'medium',
    prompt: {
      ar: 'في أي مدينة مغربية يقع جامع القرويين التاريخي الذي أسسته فاطمة الفهرية عام 859 م؟',
      en: 'In which Moroccan city is the historic Al-Qarawiyyin Mosque and University, founded in 859 CE?',
    },
    options: [
      { ar: 'فاس', en: 'Fez (فاس)' },
      { ar: 'مراكش', en: 'Marrakesh' },
      { ar: 'الرباط', en: 'Rabat' },
      { ar: 'طنجة', en: 'Tangier' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'يقع جامع القرويين في مدينة فاس وتُصنفه اليونسكو أقدم مؤسسة تعليم عالٍ مستمرة في العالم.',
      en: 'Located in Fez, Al-Qarawiyyin is recognized by UNESCO as the oldest continually operating university.',
    },
    points: 140,
  },

  // ========================
  // CATEGORY 22: FASHION & LIFESTYLE
  // ========================
  {
    id: 'fash_nike_1',
    categoryId: 'fashion_lifestyle',
    subcategory: { ar: 'الأحذية', en: 'Shoes' },
    topicTag: 'Fashion',
    questionType: 'true_false',
    difficulty: 'easy',
    prompt: {
      ar: 'يعود أصل كلمة "عطر" أو "Perfume" في اللغة اللاتينية إلى عبارة تعني "عبر الدخان" (Per Fumum).',
      en: 'The word "Perfume" originates from the Latin phrase "per fumum", meaning "through smoke".',
    },
    options: [
      { ar: 'صح', en: 'True' },
      { ar: 'خطأ', en: 'False' },
    ],
    correctIndex: 0,
    explanation: {
      ar: 'صحيح، ارتبطت العطور قديماً بحرق البخور والعود لإطلاق الروائح الزكية.',
      en: 'True. Early aromatics were largely released by burning incense and fragrant woods.',
    },
    points: 120,
  },
];
