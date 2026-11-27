import { QuestionModeDefinition } from '../types/game';

export const QUESTION_MODES: QuestionModeDefinition[] = [
  {
    id: 'guess_the_game',
    name: { ar: 'خمّن اللعبة', en: 'Guess The Game' },
    tagline: {
      ar: 'أدلة بصرية وتلميحات متدرجة',
      en: 'Visual clues & progressive hints',
    },
    description: {
      ar: 'تُعرض لقطات وتلميحات نصية متصاعدة عن لعبة فيديو؛ كلما عرفت الإجابة مبكراً حصلت على نقاط أعلى.',
      en: 'Identify a video game from progressive text clues and visual frames before the timer expires.',
    },
    mechanics: [
      { ar: 'أدلة نصية متتابعة', en: 'Progressive text hints' },
      { ar: 'عرض بصري مؤقت', en: 'Timed visual reveal' },
      { ar: 'مضاعف نقاط للسرعة', en: 'Early-guess score bonus' },
    ],
    defaultTimeSec: 25,
    basePoints: 150,
    accentHex: '#8057FF',
  },
  {
    id: 'true_false',
    name: { ar: 'صح أم خطأ', en: 'True / False' },
    tagline: {
      ar: 'قرارات سريعة وتحدي دقة المعلومات',
      en: 'Fast factual verification',
    },
    description: {
      ar: 'عبارات مباشرة في مختلف التصنيفات ومستويات الصعوبة تتطلب حكماً سريعاً مع تأكيد فوري.',
      en: 'Rapid-fire statements across multiple difficulty tiers with immediate verification feedback.',
    },
    mechanics: [
      { ar: 'تأكيد فوري للإجابة', en: 'Instant answer feedback' },
      { ar: 'عدّاد زمني مضغوط', en: 'Compact countdown timer' },
      { ar: 'تدرج في الصعوبة', en: '4 difficulty tiers' },
    ],
    defaultTimeSec: 12,
    basePoints: 100,
    accentHex: '#29C7FF',
  },
  {
    id: 'guess_the_logo',
    name: { ar: 'خمّن الشعار', en: 'Guess The Logo' },
    tagline: {
      ar: 'شعارات الألعاب والشركات والأندية',
      en: 'Brands, studios & football clubs',
    },
    description: {
      ar: 'يظهر الشعار دون اسم العلامة التجارية أو النادي أو الاستوديو، وعلى اللاعبين تحديد الهوية الصحيحة.',
      en: 'Identify a company, game franchise, sports club, or brand from an unlabelled emblem.',
    },
    mechanics: [
      { ar: 'إخفاء النصوص الأصلية', en: 'Wordmark stripped cleanly' },
      { ar: 'أشكال بديلة مقبولة', en: 'Accepted alias matching' },
      { ar: 'تلميحات قطاع الشركة', en: 'Optional sector hint' },
    ],
    defaultTimeSec: 20,
    basePoints: 130,
    accentHex: '#FFB547',
  },
  {
    id: 'guess_the_sound',
    name: { ar: 'خمّن الصوت', en: 'Guess The Sound' },
    tagline: {
      ar: 'مؤثرات صوتية ومقاطع موسيقية',
      en: 'Audio clips, OSTs & sound FX',
    },
    description: {
      ar: 'استمع إلى مقطع صوتي من لعبة أو فيلم أو موسيقى أو صوت طبيعي وحدد المصدر قبل انتهاء الوقت.',
      en: 'Listen to curated audio cues from games, films, music, or nature and name the source.',
    },
    mechanics: [
      { ar: 'مشغّل صوتي متزامن', en: 'Synchronized audio player' },
      { ar: 'إعادة تشغيل محدودة', en: 'Controlled replay counter' },
      { ar: 'مسار بديل عند التعذر', en: 'Graceful text fallback' },
    ],
    defaultTimeSec: 25,
    basePoints: 160,
    accentHex: '#8057FF',
  },
  {
    id: 'who_am_i',
    name: { ar: 'من أنا؟', en: 'Who Am I?' },
    tagline: {
      ar: 'تلميحات متدرجة لشخصيات وأعلام',
      en: 'Progressive character clues',
    },
    description: {
      ar: 'بطاقة تتكشف تلميحاتها سطراً بعد سطر عن شخصية تاريخية، بطل خيالي، لاعب، أو كائن.',
      en: 'Layered identity clues reveal traits step-by-step for fictional heroes, historical figures, or creatures.',
    },
    mechanics: [
      { ar: 'كشف متدرج للتلميحات', en: 'Step-by-step clue reveal' },
      { ar: 'نقاط أعلى مع التلميح الأول', en: 'Higher reward on Clue 1' },
      { ar: 'شخصيات عالمية وعربية', en: 'Global & Arab figures' },
    ],
    defaultTimeSec: 30,
    basePoints: 180,
    accentHex: '#29C7FF',
  },
  {
    id: 'speed_round',
    name: { ar: 'جولة السرعة', en: 'Speed Round' },
    tagline: {
      ar: 'سلسلة أسئلة متلاحقة ومضاعف الكومبو',
      en: 'Rapid streak & combo multiplier',
    },
    description: {
      ar: 'أكبر عدد من الإجابات الصحيحة المتتالية في وقت قصير لبناء سلسلة الكومبو ومضاعفة الرصيد.',
      en: 'Answer a rapid burst of short questions under a strict clock to build streak combo multipliers.',
    },
    mechanics: [
      { ar: 'مضاعف سلسلة الانتصارات', en: 'Streak combo multiplier' },
      { ar: 'أسئلة قصيرة متتابعة', en: 'Back-to-back rapid prompts' },
      { ar: 'مكافأة الوقت المتبقي', en: 'Speed bonus scoring' },
    ],
    defaultTimeSec: 45,
    basePoints: 200,
    accentHex: '#FFB547',
  },
];
