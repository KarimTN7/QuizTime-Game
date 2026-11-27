import { Language } from '../types/game';

export interface TranslationBundle {
  brandName: string;
  brandSubtitle: string;
  nav: {
    home: string;
    singleplayer: string;
    multiplayer: string;
    categories: string;
    leaderboard: string;
    profile: string;
    settings: string;
    menuOpen: string;
    menuClose: string;
    selectedQueue: string;
    allModeActive: string;
    categoriesSelectedCount: string;
    startPlaying: string;
    signIn: string;
  };
  common: {
    arabic: string;
    english: string;
    viewAll: string;
    exploreCategories: string;
    configureMatch: string;
    selected: string;
    select: string;
    clearSelection: string;
    selectAllMode: string;
    subcategoriesLabel: string;
    secondsShort: string;
    pointsShort: string;
    openSettings: string;
    goToSingleplayer: string;
    goToMultiplayer: string;
    close: string;
    back: string;
    continueBtn: string;
    loading: string;
    retry: string;
  };
  playHub: {
    title: string;
    subtitle: string;
    singleplayerTitle: string;
    singleplayerDesc: string;
    multiplayerTitle: string;
    multiplayerDesc: string;
    friendsTitle: string;
    friendsDesc: string;
    joinRoomTitle: string;
    joinRoomDesc: string;
    joinCodePlaceholder: string;
    joinBtn: string;
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroLead: string;
    startPlayingCta: string;
    playSingleplayer: string;
    playMultiplayer: string;
    browseAllCategories: string;
    statsStrip: {
      categoriesTitle: string;
      categoriesValue: string;
      subcategoriesTitle: string;
      subcategoriesValue: string;
      modesTitle: string;
      modesValue: string;
      languagesTitle: string;
      languagesValue: string;
    };
    dailySection: {
      kicker: string;
      title: string;
      description: string;
      meta: string;
      action: string;
      completedToday: string;
    };
    featuredCategories: {
      title: string;
      subtitle: string;
      openExplorer: string;
    };
    questionModes: {
      title: string;
      subtitle: string;
      mechanicsHeading: string;
      timeLabel: string;
      pointsLabel: string;
    };
    communitySplit: {
      leaderboardTitle: string;
      leaderboardSubtitle: string;
      leaderboardSignInPrompt: string;
      leaderboardEmptyTitle: string;
      activityTitle: string;
      activitySubtitle: string;
      activityEmptyTitle: string;
      activityEmptyBody: string;
      viewLeaderboard: string;
      viewProfile: string;
    };
  };
  categoriesPage: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterGamesMedia: string;
    filterSportsMusic: string;
    filterKnowledgeTech: string;
    filterCultureLife: string;
    allModeTitle: string;
    allModeDescription: string;
    allModeMeta: string;
    selectedSummary: string;
    useInSingleplayer: string;
    useInMultiplayer: string;
    expandTopics: string;
    collapseTopics: string;
    noResultsTitle: string;
    noResultsBody: string;
    resetSearch: string;
    topicsCount: string;
    featuredMarker: string;
  };
  gameplay: {
    questionOf: string;
    scoreLabel: string;
    streakLabel: string;
    livesLabel: string;
    pauseBtn: string;
    resumeBtn: string;
    quitBtn: string;
    pausedTitle: string;
    pausedBody: string;
    revealHint: string;
    hintIndex: string;
    playSound: string;
    replaySound: string;
    soundFallbackLabel: string;
    correctFeedback: string;
    wrongFeedback: string;
    timeUpFeedback: string;
    nextQuestion: string;
    finishMatch: string;
    resultsTitle: string;
    accuracyLabel: string;
    bestStreakLabel: string;
    xpEarnedLabel: string;
    unlockedAchievementsLabel: string;
    playAgain: string;
    backToSetup: string;
    comboMultiplier: string;
    answeredBadge: string;
    waitingOthers: string;
    roundWinner: string;
    matchStarting: string;
  };
  singleplayerPage: {
    title: string;
    subtitle: string;
    startMatchNow: string;
    modesHeading: string;
    modes: {
      classic: { name: string; desc: string };
      endless: { name: string; desc: string };
      time_attack: { name: string; desc: string };
      practice: { name: string; desc: string };
      daily_challenge: { name: string; desc: string };
      category_challenge: { name: string; desc: string };
    };
    configHeading: string;
    difficultyLabel: string;
    difficulties: {
      easy: string;
      medium: string;
      hard: string;
      expert: string;
    };
    roundsLabel: string;
    timeLimitLabel: string;
    questionTypesLabel: string;
    categoriesLabel: string;
    specificTopicsLabel: string;
    allTopicsBtn: string;
    changeCategories: string;
    allCategoriesBadge: string;
    recentHistoryHeading: string;
    dailyAlreadyDone: string;
  };
  multiplayerPage: {
    title: string;
    subtitle: string;
    displayNameLabel: string;
    createPrivateTitle: string;
    createPrivateDesc: string;
    createPrivateBtn: string;
    joinRoomTitle: string;
    joinRoomDesc: string;
    joinRoomPlaceholder: string;
    joinRoomBtn: string;
    matchmakingTitle: string;
    matchmakingModes: {
      quick: { title: string; desc: string };
      competitive: { title: string; desc: string };
      casual: { title: string; desc: string };
    };
    lobbyRoomCode: string;
    copyInviteLink: string;
    copiedLink: string;
    playersHeading: string;
    hostBadge: string;
    readyBadge: string;
    notReadyBadge: string;
    toggleReady: string;
    startMatchBtn: string;
    rematchBtn: string;
    leaveRoomBtn: string;
    lockRoomBtn: string;
    unlockRoomBtn: string;
    kickPlayer: string;
    chatTitle: string;
    chatPlaceholder: string;
    sendChat: string;
    inviteFriendTitle: string;
    sendInviteBtn: string;
    invitedSent: string;
    podiumTitle: string;
    connectingError: string;
    roomNotFound: string;
    roomLocked: string;
    roomFull: string;
    matchInProgressErr: string;
    kickedNotice: string;
    signInForLiveRooms: string;
    signInNowBtn: string;
  };
  leaderboardPage: {
    title: string;
    subtitle: string;
    globalTab: string;
    dailyTab: string;
    signInToView: string;
    emptyTitle: string;
    emptyBody: string;
    columns: {
      rank: string;
      player: string;
      level: string;
      wins: string;
      score: string;
    };
  };
  profilePage: {
    title: string;
    subtitle: string;
    signInTitle: string;
    signInDesc: string;
    googleSignInBtn: string;
    emailTab: string;
    registerTab: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    usernamePlaceholder: string;
    emailSubmitBtn: string;
    registerSubmitBtn: string;
    emailProviderHelp: string;
    signOutBtn: string;
    editProfileTitle: string;
    saveProfileBtn: string;
    profileSaved: string;
    chooseAvatar: string;
    lockedAvatarLvl: string;
    statsHeading: string;
    levelLabel: string;
    xpLabel: string;
    winsLabel: string;
    lossesLabel: string;
    bestScoreLabel: string;
    streakLabel: string;
    achievementsHeading: string;
    achievements: Record<string, { title: string; desc: string }>;
    friendsHeading: string;
    searchFriendsPlaceholder: string;
    searchBtn: string;
    addFriendBtn: string;
    pendingRequestsHeading: string;
    acceptBtn: string;
    declineBtn: string;
    removeFriendBtn: string;
    joinInviteBtn: string;
    historyHeading: string;
    noHistory: string;
  };
  settingsPage: {
    title: string;
    subtitle: string;
    languageSection: string;
    languageDesc: string;
    audioSection: string;
    soundVolume: string;
    musicVolume: string;
    appearanceSection: string;
    darkTheme: string;
    darkThemeDesc: string;
    animations: string;
    animationsDesc: string;
    reducedMotion: string;
    reducedMotionDesc: string;
    accountSection: string;
    notifications: string;
    notificationsDesc: string;
    publicProfile: string;
    publicProfileDesc: string;
    resetDefaults: string;
    savedFeedback: string;
  };
  footer: {
    tagline: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  ar: {
    brandName: 'QuizTime',
    brandSubtitle: 'اختبر معلوماتك، وتحدّى أصحابك!',
    nav: {
      home: 'الرئيسية',
      singleplayer: 'اللعب الفردي',
      multiplayer: 'اللعب الجماعي',
      categories: 'التصنيفات',
      leaderboard: 'المتصدرون',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      menuOpen: 'فتح القائمة',
      menuClose: 'إغلاق القائمة',
      selectedQueue: 'التصنيفات المختارة',
      allModeActive: 'الوضع الشامل (ALL)',
      categoriesSelectedCount: 'تصنيفات محددة',
      startPlaying: 'ابدأ اللعب',
      signIn: 'تسجيل الدخول',
    },
    common: {
      arabic: 'العربية',
      english: 'English',
      viewAll: 'عرض الكل',
      exploreCategories: 'استعراض التصنيفات',
      configureMatch: 'تخصيص الجولة',
      selected: 'محدد',
      select: 'اختيار',
      clearSelection: 'إلغاء التحديد',
      selectAllMode: 'تفعيل الوضع الشامل (ALL)',
      subcategoriesLabel: 'تصنيفاً فرعياً',
      secondsShort: 'ث',
      pointsShort: 'نقطة',
      openSettings: 'الإعدادات',
      goToSingleplayer: 'اللعب الفردي',
      goToMultiplayer: 'اللعب الجماعي',
      close: 'إغلاق',
      back: 'رجوع',
      continueBtn: 'متابعة',
      loading: 'جاري التحميل...',
      retry: 'إعادة المحاولة',
    },
    playHub: {
      title: 'اختر وضع اللعب',
      subtitle: 'ابدأ جولة فردية فورية أو افتح غرفة حية مع أصدقائك.',
      singleplayerTitle: 'اللعب الفردي',
      singleplayerDesc: 'اختر التصنيفات أو الألعاب المحددة، الصعوبة، والمؤقت وابدأ اللعب فوراً.',
      multiplayerTitle: 'لعب جماعي عام',
      multiplayerDesc: 'ابحث عن لاعبين متصلين الآن وادخل مباراة متزامنة عبر الخادم.',
      friendsTitle: 'العب مع الأصدقاء',
      friendsDesc: 'أنشئ غرفة خاصة، شارك الرابط أو الرمز، وتحكم بقواعد المباراة.',
      joinRoomTitle: 'انضم لغرفة برمز',
      joinRoomDesc: 'أدخل رمز الغرفة المكوّن من 6 خانات للانضمام مباشرة إلى اللوبي.',
      joinCodePlaceholder: 'رمز الغرفة (مثال: K7M9XP)',
      joinBtn: 'انضمام الآن',
    },
    home: {
      heroEyebrow: 'منصة مسابقات عربية وعالمية في الوقت الحقيقي',
      heroTitle: 'ساحة تحديات ذكية للأصدقاء واللاعبين المنفردين',
      heroLead:
        'اختر من ٢٢ تصنيفاً رئيسياً ومئات المواضيع في الألعاب والأنمي وكرة القدم والعلوم والتاريخ، ونافس عبر ٦ أنماط أسئلة حية.',
      startPlayingCta: 'ابدأ اللعب',
      playSingleplayer: 'لعب فردي سريع',
      playMultiplayer: 'ساحة الجماعي',
      browseAllCategories: 'تصفح ٢٢ تصنيفاً',
      statsStrip: {
        categoriesTitle: 'التصنيفات الرئيسية',
        categoriesValue: '22',
        subcategoriesTitle: 'المواضيع الفرعية',
        subcategoriesValue: '300+',
        modesTitle: 'أنماط الأسئلة',
        modesValue: '6',
        languagesTitle: 'اللغات المدعومة',
        languagesValue: 'AR · EN',
      },
      dailySection: {
        kicker: 'التحدي اليومي',
        title: 'اختبار يومي موحّد لجميع اللاعبين',
        description:
          '١٠ أسئلة متجددة يومياً من تصنيفات مختلطة بصعوبة متوازنة ومحاولات مسجلة في لوحة الصدارة اليومية.',
        meta: '١٠ أسئلة مختلطة · نتيجة يومية مسجلة · سلسلة أيام اللعب',
        action: 'العب التحدي اليومي الآن',
        completedToday: 'تم إكمال تحدي اليوم',
      },
      featuredCategories: {
        title: 'التصنيفات الأكثر طلباً',
        subtitle:
          'اضغط على أي تصنيف لاستكشاف مواضيعه وألعابه الفرعية أو إضافته لقائمة اللعب.',
        openExplorer: 'دليل التصنيفات الكامل',
      },
      questionModes: {
        title: 'أنماط الأسئلة الستة',
        subtitle:
          'تتنوع الجولات بين تخمين الألعاب، الشعارات، الصوتيات الحية، السرعة، والتلميحات المتدرجة.',
        mechanicsHeading: 'آلية الجولة',
        timeLabel: 'الوقت الافتراضي',
        pointsLabel: 'الرصيد الأساسي',
      },
      communitySplit: {
        leaderboardTitle: 'لوحة الصدارة العالمية',
        leaderboardSubtitle: 'أعلى اللاعبين نقاطاً عبر المنصة',
        leaderboardSignInPrompt: 'سجّل الدخول بحسابك لعرض الترتيب العالمي المباشر ومنافسة الآخرين.',
        leaderboardEmptyTitle: 'سجّل أول نتيجة لتتصدر اللوحة',
        activityTitle: 'إحصائياتك وآخر المواجهات',
        activitySubtitle: 'نقاط الخبرة، المستوى، وسجل الانتصارات',
        activityEmptyTitle: 'ابدأ أول جولة لتسجيل إحصائياتك',
        activityEmptyBody: 'كل جولة تكملها تمنحك نقاط خبرة (XP) وتفتح لك إنجازات وصوراً جديدة.',
        viewLeaderboard: 'لوحة الصدارة',
        viewProfile: 'الملف الشخصي',
      },
    },
    categoriesPage: {
      title: 'دليل التصنيفات الشامل',
      subtitle:
        '٢٢ تصنيفاً رئيسياً وأكثر من ٣٠٠ موضوع فرعي بالعربية والإنجليزية، مع خيار الدمج العشوائي الشامل.',
      searchPlaceholder: 'ابحث عن لعبة، أنمي، دوري، أو موضوع (مثل: Minecraft أو كرة القدم)...',
      filterAll: 'الكل (22)',
      filterGamesMedia: 'الألعاب والترفيه',
      filterSportsMusic: 'الرياضة والموسيقى',
      filterKnowledgeTech: 'العلوم والتقنية',
      filterCultureLife: 'الثقافة والحياة',
      allModeTitle: 'الوضع الشامل (ALL)',
      allModeDescription:
        'سحب عشوائي متوازن من جميع التصنيفات الـ ٢٢ والمواضيع الفرعية، مع خلط مستويات الصعوبة وأنماط الأسئلة وتجنب التكرار.',
      allModeMeta: 'متاح للعب الفردي والغرف الجماعية',
      selectedSummary: 'التصنيفات المحددة للجولة',
      useInSingleplayer: 'ابدأ اللعب الفردي بها',
      useInMultiplayer: 'إنشاء غرفة جماعية بها',
      expandTopics: 'عرض المواضيع الفرعية',
      collapseTopics: 'إخفاء المواضيع',
      noResultsTitle: 'لم يتم العثور على تصنيف مطابق',
      noResultsBody: 'جرّب البحث بكلمة أخرى أو أعد ضبط المرشح.',
      resetSearch: 'إعادة ضبط البحث',
      topicsCount: 'موضوعاً فرعياً',
      featuredMarker: 'الأبرز',
    },
    gameplay: {
      questionOf: 'السؤال',
      scoreLabel: 'النقاط',
      streakLabel: 'السلسلة',
      livesLabel: 'الأرواح',
      pauseBtn: 'إيقاف مؤقت',
      resumeBtn: 'استئناف اللعب',
      quitBtn: 'إنهاء الجولة',
      pausedTitle: 'اللعبة متوقفة مؤقتاً',
      pausedBody: 'تم إخفاء السؤال وإيقاف المؤقت للحفاظ على نزاهة الجولة.',
      revealHint: 'كشف التلميح التالي',
      hintIndex: 'تلميح',
      playSound: 'تشغيل المقطع الصوتي',
      replaySound: 'إعادة التشغيل',
      soundFallbackLabel: 'وصف الصوت',
      correctFeedback: 'إجابة صحيحة!',
      wrongFeedback: 'إجابة غير صحيحة',
      timeUpFeedback: 'انتهى الوقت!',
      nextQuestion: 'السؤال التالي',
      finishMatch: 'عرض النتيجة النهائية',
      resultsTitle: 'النتائج النهائية',
      accuracyLabel: 'نسبة الدقة',
      bestStreakLabel: 'أعلى سلسلة',
      xpEarnedLabel: 'نقاط الخبرة المكتسبة',
      unlockedAchievementsLabel: 'إنجازات جديدة مفتوحة',
      playAgain: 'العب مجدداً',
      backToSetup: 'تغيير الإعدادات',
      comboMultiplier: 'مضاعف الكومبو',
      answeredBadge: 'تم التسليم',
      waitingOthers: 'بانتظار بقية اللاعبين...',
      roundWinner: 'أسرع إجابة في الجولة',
      matchStarting: 'تبدأ المباراة خلال ثوانٍ...',
    },
    singleplayerPage: {
      title: 'اللعب الفردي',
      subtitle: 'خصّص جولتك باختيار النمط والتصنيفات أو الألعاب المحددة واضغط بدء المباراة.',
      startMatchNow: 'ابدأ المباراة الآن',
      modesHeading: 'أنماط اللعب الفردي',
      modes: {
        classic: { name: 'النمط الكلاسيكي', desc: 'جولات محددة بمؤقت قياسي ونقاط سرعة.' },
        endless: { name: 'النمط اللانهائي', desc: 'استمر بالإجابة مع ٣ أرواح حتى نفادها.' },
        time_attack: { name: 'سباق الزمن', desc: 'أجب عن أكبر عدد من الأسئلة قبل انتهاء الوقت الكلي.' },
        practice: { name: 'وضع التدريب', desc: 'لعب حر بدون عداد زمني لمراجعة المعلومات.' },
        daily_challenge: { name: 'التحدي اليومي', desc: '١٠ أسئلة يومية موحدة لجميع اللاعبين.' },
        category_challenge: { name: 'تحدي التصنيف', desc: 'تعمّق في تصنيف واحد أو ألعاب محددة.' },
      },
      configHeading: 'إعدادات الجولة',
      difficultyLabel: 'مستوى الصعوبة',
      difficulties: { easy: 'سهل', medium: 'متوسط', hard: 'صعب', expert: 'خبير' },
      roundsLabel: 'عدد الأسئلة',
      timeLimitLabel: 'زمن السؤال',
      questionTypesLabel: 'أنواع الأسئلة',
      categoriesLabel: 'التصنيفات المختارة',
      specificTopicsLabel: 'ألعاب أو مواضيع محددة (اختياري)',
      allTopicsBtn: 'كل المواضيع',
      changeCategories: 'تعديل التصنيفات',
      allCategoriesBadge: 'جميع التصنيفات الـ ٢٢ عشوائياً (ALL)',
      recentHistoryHeading: 'سجل جولاتك الأخيرة',
      dailyAlreadyDone: 'لقد أكملت تحدي اليوم الرسمي مسبقاً (يمكنك اللعب للتدريب).',
    },
    multiplayerPage: {
      title: 'ساحة اللعب الجماعي',
      subtitle: 'أنشئ غرفة خاصة بأصدقائك، أو انضم برمز غرفة، أو ادخل البحث العام في الوقت الحقيقي.',
      displayNameLabel: 'اسمك داخل الغرفة',
      createPrivateTitle: 'إنشاء غرفة خاصة (العب مع الأصدقاء)',
      createPrivateDesc: 'تحصل على رمز من ٦ خانات ورابط دعوة مباشر مع تحكم كامل بإعدادات الجولة.',
      createPrivateBtn: 'إنشاء غرفة خاصة',
      joinRoomTitle: 'الانضمام برمز غرفة',
      joinRoomDesc: 'أدخل رمز الغرفة المكون من ٦ أحرف وأرقام للدخول الفوري.',
      joinRoomPlaceholder: 'مثال: K7M9XP',
      joinRoomBtn: 'دخول الغرفة',
      matchmakingTitle: 'البحث العام عن خصوم (Matchmaking)',
      matchmakingModes: {
        quick: { title: 'مباراة سريعة', desc: 'انضمام تلقائي لأقرب غرفة عامة متاحة.' },
        competitive: { title: 'مباراة تنافسية', desc: 'مواجهات مصنفة لرفع نقاطك في الصدارة.' },
        casual: { title: 'مباراة ودية', desc: 'جولات مريحة بمواضيع متنوعة.' },
      },
      lobbyRoomCode: 'رمز الغرفة',
      copyInviteLink: 'نسخ رابط الدعوة',
      copiedLink: 'تم نسخ الرابط!',
      playersHeading: 'اللاعبون في الغرفة',
      hostBadge: 'المضيف',
      readyBadge: 'جاهز',
      notReadyBadge: 'بالانتظار',
      toggleReady: 'تأكيد الجاهزية',
      startMatchBtn: 'بدء المباراة للجميع',
      rematchBtn: 'مباراة إعادة (Rematch)',
      leaveRoomBtn: 'مغادرة الغرفة',
      lockRoomBtn: 'قفل الغرفة',
      unlockRoomBtn: 'فتح الغرفة',
      kickPlayer: 'إزالة',
      chatTitle: 'محادثة الغرفة والتفاعل السريع',
      chatPlaceholder: 'اكتب رسالة سريعة...',
      sendChat: 'إرسال',
      inviteFriendTitle: 'دعوة صديق مسجل',
      sendInviteBtn: 'دعوة',
      invitedSent: 'تم الإرسال',
      podiumTitle: 'منصة التتويج النهائية',
      connectingError: 'تعذر الاتصال بخادم اللعب الجماعي.',
      roomNotFound: 'الغرفة غير موجودة أو انتهت صلاحيتها.',
      roomLocked: 'الغرفة مقفلة من قِبل المضيف.',
      roomFull: 'الغرفة ممتلئة حالياً.',
      matchInProgressErr: 'المباراة قد بدأت بالفعل في هذه الغرفة.',
      kickedNotice: 'تمت إزالتك من الغرفة بواسطة المضيف.',
      signInForLiveRooms: 'سجّل الدخول بحساب Google لإنشاء أو الانضمام إلى الغرف الجماعية المباشرة عبر السحابة.',
      signInNowBtn: 'تسجيل الدخول بـ Google',
    },
    leaderboardPage: {
      title: 'لوحة الصدارة',
      subtitle: 'الترتيب الفعلي للاعبين حسب مجموع النقاط ونتائج التحدي اليومي.',
      globalTab: 'الترتيب العالمي',
      dailyTab: 'لوحة التحدي اليومي',
      signInToView: 'سجّل الدخول بحسابك لعرض بيانات المتصدرين والمنافسة على المراكز الأولى.',
      emptyTitle: 'لا توجد نتائج مسجلة بعد',
      emptyBody: 'أنهِ جولة فردية أو تحدياً يومياً لتكون أول اسم يظهر في لوحة الصدارة!',
      columns: { rank: '#', player: 'اللاعب', level: 'المستوى', wins: 'الانتصارات', score: 'النقاط' },
    },
    profilePage: {
      title: 'الملف الشخصي والأصدقاء',
      subtitle: 'هويتك في QuizTime، مستواك، إنجازاتك، قائمة الأصدقاء، وسجل مبارياتك.',
      signInTitle: 'تسجيل الدخول وحفظ التقدم',
      signInDesc: 'سجّل دخولك عبر Google أو البريد الإلكتروني لحفظ نقاطك وإنجازاتك ومنافسة أصدقائك.',
      googleSignInBtn: 'المتابعة عبر Google',
      emailTab: 'دخول بالبريد',
      registerTab: 'إنشاء حساب',
      emailPlaceholder: 'البريد الإلكتروني',
      passwordPlaceholder: 'كلمة المرور (٦ أحرف فأكثر)',
      usernamePlaceholder: 'اسم اللاعب الظاهر',
      emailSubmitBtn: 'تسجيل الدخول',
      registerSubmitBtn: 'إنشاء الحساب',
      emailProviderHelp: 'ملاحظة: إذا لم يكن الدخول بالبريد مفعّلاً في مشروع Firebase، استخدم زر Google أو فعّل Email/Password من لوحة Firebase Auth.',
      signOutBtn: 'تسجيل الخروج',
      editProfileTitle: 'تخصيص الاسم والصورة الرمزية',
      saveProfileBtn: 'حفظ التغييرات',
      profileSaved: 'تم حفظ الملف الشخصي',
      chooseAvatar: 'الصور الرمزية المتاحة والمفتوحة',
      lockedAvatarLvl: 'يُفتح بالمستوى',
      statsHeading: 'إحصائيات اللاعب',
      levelLabel: 'المستوى',
      xpLabel: 'نقاط الخبرة (XP)',
      winsLabel: 'الانتصارات',
      lossesLabel: 'الخسائر',
      bestScoreLabel: 'أعلى نتيجة',
      streakLabel: 'سلسلة الأيام',
      achievementsHeading: 'الإنجازات',
      achievements: {
        first_victory: { title: 'الانتصار الأول', desc: 'تحقيق أول فوز رسمي.' },
        gaming_expert: { title: 'خبير الألعاب', desc: 'إجابة ٤ أسئلة صحيحة فأكثر في الألعاب.' },
        perfect_round: { title: 'الجولة المثالية', desc: 'إنهاء جولة بدقة ١٠٠٪.' },
        speed_master: { title: 'سيد السرعة', desc: 'تحقيق سلسلة من ٥ إجابات متتالية.' },
        trivia_legend: { title: 'أسطورة المعرفة', desc: 'الوصول إلى المستوى الخامس.' },
        daily_player: { title: 'اللاعب اليومي', desc: 'إكمال التحدي اليومي.' },
        category_master: { title: 'متقن التصنيف', desc: 'الفوز في تحدي التصنيف.' },
        party_host: { title: 'مضيف السهرة', desc: 'استضافة مباراة جماعية كاملة.' },
      },
      friendsHeading: 'الأصدقاء والدعوات',
      searchFriendsPlaceholder: 'ابحث باسم لاعب لإضافته...',
      searchBtn: 'بحث',
      addFriendBtn: 'إضافة صديق',
      pendingRequestsHeading: 'طلبات الصداقة ودعوات الغرف الواردة',
      acceptBtn: 'قبول',
      declineBtn: 'رفض',
      removeFriendBtn: 'إزالة',
      joinInviteBtn: 'انضمام للغرفة',
      historyHeading: 'سجل المباريات',
      noHistory: 'لم تسجل مباريات بعد. ابدأ اللعب الآن!',
    },
    settingsPage: {
      title: 'الإعدادات والتفضيلات',
      subtitle: 'تخصيص اللغة، الصوت، المظهر الداكن، والحركة مع حفظ تلقائي.',
      languageSection: 'لغة الواجهة والاتجاه',
      languageDesc: 'تبديل فوري بين العربية (RTL) والإنجليزية (LTR).',
      audioSection: 'الصوت والموسيقى',
      soundVolume: 'مستوى المؤثرات الصوتية',
      musicVolume: 'مستوى الموسيقى',
      appearanceSection: 'المظهر والحركة',
      darkTheme: 'المظهر الداكن',
      darkThemeDesc: 'لوحة ألوان ليلية مريحة للعب.',
      animations: 'التأثيرات الحركية',
      animationsDesc: 'تفعيل الانتقالات السلسة للبطاقات.',
      reducedMotion: 'تقليل الحركة',
      reducedMotionDesc: 'تعطيل الحركات الزائدة لراحة العين.',
      accountSection: 'الإشعارات والخصوصية',
      notifications: 'تنبيهات الدعوات والتحدي اليومي',
      notificationsDesc: 'استلام تنبيهات دعوات الأصدقاء.',
      publicProfile: 'إظهار الملف في لوحة الصدارة',
      publicProfileDesc: 'السماح بظهور اسمك وإحصائياتك في الترتيب العام.',
      resetDefaults: 'استعادة الإعدادات الافتراضية',
      savedFeedback: 'محفوظ تلقائياً',
    },
    footer: {
      tagline: 'QuizTime — اختبر معلوماتك، وتحدّى أصحابك!',
    },
  },
  en: {
    brandName: 'QuizTime',
    brandSubtitle: 'Think Fast. Play Together.',
    nav: {
      home: 'Home',
      singleplayer: 'Singleplayer',
      multiplayer: 'Multiplayer',
      categories: 'Categories',
      leaderboard: 'Leaderboard',
      profile: 'Profile',
      settings: 'Settings',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      selectedQueue: 'Active Categories',
      allModeActive: 'ALL Categories Mode',
      categoriesSelectedCount: 'categories selected',
      startPlaying: 'Start Playing',
      signIn: 'Sign In',
    },
    common: {
      arabic: 'العربية',
      english: 'English',
      viewAll: 'View All',
      exploreCategories: 'Explore Categories',
      configureMatch: 'Configure Match',
      selected: 'Selected',
      select: 'Select',
      clearSelection: 'Clear Selection',
      selectAllMode: 'Enable ALL Mode',
      subcategoriesLabel: 'subcategories',
      secondsShort: 's',
      pointsShort: 'pts',
      openSettings: 'Settings',
      goToSingleplayer: 'Singleplayer',
      goToMultiplayer: 'Multiplayer',
      close: 'Close',
      back: 'Back',
      continueBtn: 'Continue',
      loading: 'Loading...',
      retry: 'Retry',
    },
    playHub: {
      title: 'Choose How to Play',
      subtitle: 'Jump straight into a solo match or spin up a live multiplayer lobby.',
      singleplayerTitle: 'Singleplayer',
      singleplayerDesc: 'Pick categories, specific games, difficulty, and timer—then play immediately.',
      multiplayerTitle: 'Public Multiplayer',
      multiplayerDesc: 'Match with connected players right now in a synchronized server lobby.',
      friendsTitle: 'Play With Friends',
      friendsDesc: 'Create a private room, share a code or invite link, and host the match.',
      joinRoomTitle: 'Join a Room',
      joinRoomDesc: 'Enter a 6-character room code to jump straight into a live lobby.',
      joinCodePlaceholder: 'Room Code (e.g. K7M9XP)',
      joinBtn: 'Join Room',
    },
    home: {
      heroEyebrow: 'Bilingual Real-Time Arabic & English Trivia',
      heroTitle: 'A sharp party quiz arena built for solo mastery and live rooms',
      heroLead:
        'Explore 22 main categories and 300+ topics across Gaming, Anime, Football, Science, and History—played across 6 live question types.',
      startPlayingCta: 'Start Playing',
      playSingleplayer: 'Quick Solo',
      playMultiplayer: 'Multiplayer Arena',
      browseAllCategories: 'Browse 22 Categories',
      statsStrip: {
        categoriesTitle: 'Main Categories',
        categoriesValue: '22',
        subcategoriesTitle: 'Subcategories',
        subcategoriesValue: '300+',
        modesTitle: 'Question Modes',
        modesValue: '6',
        languagesTitle: 'Languages',
        languagesValue: 'AR · EN',
      },
      dailySection: {
        kicker: 'Daily Challenge',
        title: 'One shared daily gauntlet for all players',
        description:
          '10 curated mixed-category questions refreshed daily with balanced difficulty and a dedicated daily leaderboard.',
        meta: '10 Mixed Prompts · Recorded Daily Rank · Streak Tracking',
        action: 'Play Daily Challenge',
        completedToday: 'Completed Today',
      },
      featuredCategories: {
        title: 'Featured Categories',
        subtitle: 'Select any category to inspect its games and topics or load it into your match.',
        openExplorer: 'Full Category Directory',
      },
      questionModes: {
        title: 'Six Question Modes',
        subtitle: 'Rounds mix game trivia, unlabelled logos, synthesized audio cues, progressive clues, and speed streaks.',
        mechanicsHeading: 'Round Mechanics',
        timeLabel: 'Default Timer',
        pointsLabel: 'Base Points',
      },
      communitySplit: {
        leaderboardTitle: 'Global Leaderboard',
        leaderboardSubtitle: 'Top players ranked by verified total score',
        leaderboardSignInPrompt: 'Sign in to view live global rankings and compete for the top spots.',
        leaderboardEmptyTitle: 'Finish a match to claim the top rank',
        activityTitle: 'Your Stats & Match Log',
        activitySubtitle: 'XP, level progression, and match wins',
        activityEmptyTitle: 'Play your first round to start tracking',
        activityEmptyBody: 'Every completed match awards XP, advances your level, and unlocks achievements.',
        viewLeaderboard: 'Leaderboard',
        viewProfile: 'Profile',
      },
    },
    categoriesPage: {
      title: 'Complete Category Directory',
      subtitle: '22 main categories and 300+ bilingual topics, plus randomized ALL mode.',
      searchPlaceholder: 'Search any game, anime, league, or topic (e.g. Minecraft, Football)...',
      filterAll: 'All (22)',
      filterGamesMedia: 'Games & Media',
      filterSportsMusic: 'Sports & Music',
      filterKnowledgeTech: 'Science & Tech',
      filterCultureLife: 'Culture & Lifestyle',
      allModeTitle: 'ALL Categories Mode',
      allModeDescription:
        'Draws balanced questions across all 22 categories, mixing difficulties and all 6 question types without repeating recent prompts.',
      allModeMeta: 'Available in Singleplayer & Multiplayer',
      selectedSummary: 'Selected Category Queue',
      useInSingleplayer: 'Play Singleplayer With Selected',
      useInMultiplayer: 'Create Room With Selected',
      expandTopics: 'Show Topics',
      collapseTopics: 'Hide Topics',
      noResultsTitle: 'No matching categories found',
      noResultsBody: 'Try another Arabic or English keyword, or clear filters.',
      resetSearch: 'Reset Filters',
      topicsCount: 'subcategories',
      featuredMarker: 'Flagship',
    },
    gameplay: {
      questionOf: 'Question',
      scoreLabel: 'Score',
      streakLabel: 'Streak',
      livesLabel: 'Lives',
      pauseBtn: 'Pause',
      resumeBtn: 'Resume',
      quitBtn: 'Finish Match',
      pausedTitle: 'Match Paused',
      pausedBody: 'Question and countdown are paused until you resume.',
      revealHint: 'Reveal Next Hint',
      hintIndex: 'Hint',
      playSound: 'Play Audio Clue',
      replaySound: 'Replay Audio',
      soundFallbackLabel: 'Audio description',
      correctFeedback: 'Correct Answer!',
      wrongFeedback: 'Incorrect',
      timeUpFeedback: 'Time Up!',
      nextQuestion: 'Next Question',
      finishMatch: 'View Final Results',
      resultsTitle: 'Match Results',
      accuracyLabel: 'Accuracy',
      bestStreakLabel: 'Best Streak',
      xpEarnedLabel: 'XP Earned',
      unlockedAchievementsLabel: 'Achievements Unlocked',
      playAgain: 'Play Again',
      backToSetup: 'Back to Setup',
      comboMultiplier: 'Combo Multiplier',
      answeredBadge: 'Submitted',
      waitingOthers: 'Waiting for other players...',
      roundWinner: 'Round Winner',
      matchStarting: 'Match starting shortly...',
    },
    singleplayerPage: {
      title: 'Singleplayer Arena',
      subtitle: 'Pick your mode, categories, or specific games, adjust timer & difficulty, and play.',
      startMatchNow: 'Start Game Now',
      modesHeading: 'Singleplayer Modes',
      modes: {
        classic: { name: 'Classic Mode', desc: 'Fixed rounds with speed bonus scoring.' },
        endless: { name: 'Endless Mode', desc: 'Keep answering with 3 lives until they run out.' },
        time_attack: { name: 'Time Attack', desc: 'Score as many right answers before the clock hits zero.' },
        practice: { name: 'Practice Mode', desc: 'Untimed session focused on explanations.' },
        daily_challenge: { name: 'Daily Challenge', desc: '10 shared daily questions for all players.' },
        category_challenge: { name: 'Category Challenge', desc: 'Master a chosen category or specific game.' },
      },
      configHeading: 'Game Settings',
      difficultyLabel: 'Difficulty',
      difficulties: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' },
      roundsLabel: 'Questions',
      timeLimitLabel: 'Timer',
      questionTypesLabel: 'Question Types',
      categoriesLabel: 'Selected Categories',
      specificTopicsLabel: 'Specific Games / Topics (Optional)',
      allTopicsBtn: 'All Topics',
      changeCategories: 'Edit Categories',
      allCategoriesBadge: 'ALL 22 Categories Randomized',
      recentHistoryHeading: 'Recent Solo History',
      dailyAlreadyDone: 'You have already recorded today’s official Daily Challenge (playing now counts as practice).',
    },
    multiplayerPage: {
      title: 'Real-Time Multiplayer',
      subtitle: 'Create private rooms, join with a 6-char code, or enter public matchmaking.',
      displayNameLabel: 'Your In-Room Name',
      createPrivateTitle: 'Create Private Room (Play With Friends)',
      createPrivateDesc: 'Get a 6-character code and shareable link with full host controls.',
      createPrivateBtn: 'Create Private Room',
      joinRoomTitle: 'Join With Room Code',
      joinRoomDesc: 'Enter a 6-character code to join an active lobby.',
      joinRoomPlaceholder: 'e.g. K7M9XP',
      joinRoomBtn: 'Join Room',
      matchmakingTitle: 'Public Matchmaking',
      matchmakingModes: {
        quick: { title: 'Quick Match', desc: 'Instant placement into an open lobby.' },
        competitive: { title: 'Competitive Match', desc: 'Ranked play counting toward leaderboards.' },
        casual: { title: 'Casual Match', desc: 'Relaxed mixed-topic party play.' },
      },
      lobbyRoomCode: 'Room Code',
      copyInviteLink: 'Copy Invite Link',
      copiedLink: 'Copied!',
      playersHeading: 'Players in Lobby',
      hostBadge: 'Host',
      readyBadge: 'Ready',
      notReadyBadge: 'Waiting',
      toggleReady: 'Toggle Ready',
      startMatchBtn: 'Start Match',
      rematchBtn: 'Rematch',
      leaveRoomBtn: 'Leave Room',
      lockRoomBtn: 'Lock Room',
      unlockRoomBtn: 'Unlock Room',
      kickPlayer: 'Kick',
      chatTitle: 'Room Chat & Reactions',
      chatPlaceholder: 'Send a message...',
      sendChat: 'Send',
      inviteFriendTitle: 'Invite a Friend',
      sendInviteBtn: 'Invite',
      invitedSent: 'Sent',
      podiumTitle: 'Final Podium',
      connectingError: 'Could not connect to multiplayer server.',
      roomNotFound: 'Room not found or expired.',
      roomLocked: 'This room is locked by the host.',
      roomFull: 'This room is full.',
      matchInProgressErr: 'A match is already in progress in this room.',
      kickedNotice: 'You were removed from the room by the host.',
      signInForLiveRooms: 'Sign in with Google to host or join live multiplayer rooms synced via Firestore.',
      signInNowBtn: 'Sign In with Google',
    },
    leaderboardPage: {
      title: 'Leaderboards',
      subtitle: 'Verified player standings by total points and Daily Challenge performance.',
      globalTab: 'Global Rankings',
      dailyTab: 'Daily Challenge',
      signInToView: 'Sign in to load live rankings and compete on the leaderboard.',
      emptyTitle: 'No ranked scores yet',
      emptyBody: 'Complete a match or Daily Challenge to appear on the leaderboard!',
      columns: { rank: '#', player: 'Player', level: 'Level', wins: 'Wins', score: 'Score' },
    },
    profilePage: {
      title: 'Profile & Friends',
      subtitle: 'Your player card, XP level, achievements, friends list, and match history.',
      signInTitle: 'Sign In & Save Progress',
      signInDesc: 'Sign in with Google or Email to persist your stats, achievements, and friends.',
      googleSignInBtn: 'Continue with Google',
      emailTab: 'Email Sign In',
      registerTab: 'Create Account',
      emailPlaceholder: 'Email address',
      passwordPlaceholder: 'Password (min 6 chars)',
      usernamePlaceholder: 'Display Name',
      emailSubmitBtn: 'Sign In',
      registerSubmitBtn: 'Create Account',
      emailProviderHelp: 'Note: If Email/Password sign-in is disabled in Firebase Console, use Google Sign-In or enable Email/Password under Firebase Authentication.',
      signOutBtn: 'Sign Out',
      editProfileTitle: 'Customize Username & Avatar',
      saveProfileBtn: 'Save Changes',
      profileSaved: 'Profile saved',
      chooseAvatar: 'Unlocked & Upcoming Avatars',
      lockedAvatarLvl: 'Unlocks at Lv.',
      statsHeading: 'Player Statistics',
      levelLabel: 'Level',
      xpLabel: 'XP',
      winsLabel: 'Wins',
      lossesLabel: 'Losses',
      bestScoreLabel: 'Best Score',
      streakLabel: 'Daily Streak',
      achievementsHeading: 'Achievements',
      achievements: {
        first_victory: { title: 'First Victory', desc: 'Win your first match.' },
        gaming_expert: { title: 'Gaming Expert', desc: 'Answer 4+ Gaming prompts right.' },
        perfect_round: { title: 'Perfect Round', desc: 'Finish a match with 100% accuracy.' },
        speed_master: { title: 'Speed Master', desc: 'Reach a 5-answer streak.' },
        trivia_legend: { title: 'Trivia Legend', desc: 'Reach player Level 5.' },
        daily_player: { title: 'Daily Player', desc: 'Complete a Daily Challenge.' },
        category_master: { title: 'Category Master', desc: 'Win a Category Challenge.' },
        party_host: { title: 'Party Host', desc: 'Host a completed multiplayer room.' },
      },
      friendsHeading: 'Friends & Room Invites',
      searchFriendsPlaceholder: 'Search player by username...',
      searchBtn: 'Search',
      addFriendBtn: 'Add Friend',
      pendingRequestsHeading: 'Incoming Requests & Room Invites',
      acceptBtn: 'Accept',
      declineBtn: 'Decline',
      removeFriendBtn: 'Remove',
      joinInviteBtn: 'Join Room',
      historyHeading: 'Match History',
      noHistory: 'No recorded matches yet. Start playing!',
    },
    settingsPage: {
      title: 'Settings & Preferences',
      subtitle: 'Customize language, sound, theme, and motion preferences.',
      languageSection: 'Language & Direction',
      languageDesc: 'Instant switch between Arabic (RTL) and English (LTR).',
      audioSection: 'Audio Levels',
      soundVolume: 'Sound Effects Volume',
      musicVolume: 'Music Volume',
      appearanceSection: 'Appearance & Motion',
      darkTheme: 'Dark Theme',
      darkThemeDesc: 'Deep navy gaming canvas calibrated for long sessions.',
      animations: 'Interface Animations',
      animationsDesc: 'Smooth transitions across cards and interactive panels.',
      reducedMotion: 'Reduced Motion',
      reducedMotionDesc: 'Minimizes motion effects for visual comfort.',
      accountSection: 'Notifications & Privacy',
      notifications: 'Invites & Daily Challenge Alerts',
      notificationsDesc: 'Receive friend room invite notifications.',
      publicProfile: 'Show Profile on Public Leaderboards',
      publicProfileDesc: 'Display your username and score in public rankings.',
      resetDefaults: 'Reset to Defaults',
      savedFeedback: 'Saved locally',
    },
    footer: {
      tagline: 'QuizTime — Think Fast. Play Together.',
    },
  },
};
