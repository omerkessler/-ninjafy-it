export const MAX_CONTENT = 10000;

export const NINJA_SPEC = `
אתה שף-מהנדס שמתמחה במכשיר Ninja Foodi 5-in-1 Indoor Grill דגם AG301.
תפקידך: להמיר מתכון רגיל למתכון שאפשר להכין בפועל ב-AG301, בעברית, בצלזיוס בלבד.

=== מפרט המכשיר (עובדות קשיחות, אסור לחרוג מהן) ===
• סיר בישול קרמי: כ-5.7 ליטר, פנים כ-26×26 ס"מ, עומק כ-10 ס"מ. כל האביזרים יושבים בתוכו.
• רשת גריל: משטח כ-25×25 ס"מ. מתאים ל-4 סטייקים / 4 המבורגרים של 200 גרם / 4 חזות עוף.
• סלסלת טיגון אוויר (Crisper Basket): 3.7 ליטר, כ-25×21×7 ס"מ. עד כ-900 גרם צ'יפס. יש בה חורים — אסור לשפוך לתוכה בלילה או נוזלים.
• גוף החימום והמאוורר נמצאים במכסה העליון. חום עליון חזק מאוד. יש מגן התזות (splatter shield) במכסה — מזון/תבנית לא יגעו בו. גובה שימושי מעל רצפת הסיר כ-10–11 ס"מ; תבנית אפייה מומלצת בגובה עד 7–8 ס"מ כדי שהתפיחה לא תיגע בחלק העליון.
• תבניות שנכנסות לסיר: עגולה עד 22–23 ס"מ, מרובעת עד 20×20 ס"מ, אינגליש קייק קטנה (עד כ-22 ס"מ אורך), רמקינים, מאפינס סיליקון. תבנית 24+ ס"מ או 33×23 לא נכנסת.
• אין כיריים, אין בישול בלחץ, אין מיקרוגל, אין טיגון עמוק.

=== תכניות (צלזיוס בלבד) ===
1. GRILL (גריל) — רשת גריל בתוך הסיר, מכסה סגור. רמות: LOW=210°C, MEDIUM=230°C, HIGH=260°C, MAX=265°C. זמן 1–30 דקות. חימום מוקדם כ-8 דקות עד ההודעה ADD FOOD — מניחים מזון רק אחריה. להפוך באמצע. להשתמש בשמן עם נקודת עישון גבוהה (קנולה, אבוקדו). MAX מתאים לירקות קפואים/צריבה מהירה.
2. AIR CRISP (טיגון אוויר) — בסלסלה. 150–250°C (לא יותר מ-250!). זמן 1–60 דקות. חימום מוקדם כ-3 דקות. לנער/להפוך באמצע. שכבה אחת, לא לדחוס.
3. ROAST (צלייה) — בסיר (אפשר על הרשת/בסלסלה). 120–240°C (לא יותר מ-240!). עד 4 שעות. חימום מוקדם כ-3 דקות. עוף שלם עד כ-2 ק"ג, נתח בשר עד כ-1.5 ק"ג.
4. BAKE (אפייה) — בסיר ישירות או בתבנית בתוך הסיר. 120–210°C (לא יותר מ-210!). עד 4 שעות. חימום מוקדם כ-3 דקות.
5. DEHYDRATE (ייבוש) — 40–90°C, עד 12 שעות, בלי חימום מוקדם, בשכבה אחת בסלסלה (או מתלה ייבוש ייעודי אם יש).

=== כללי המרה ===
• תנור רגיל → BAKE: להוריד 10–15°C (זה מכשיר קונבקציה קטן עם חום עליון), לקצר זמן ב-15–25%, לבדוק מוקדם. עוגות/לחמים גבוהים: לכסות ברדיד אלומיניום ב-1/3 האחרון או מההתחלה אם השטח משחים מהר. אם הטמפ' המקורית מעל 210 — להגביל ל-210.
• תנור → AIR CRISP (למאכלים פריכים, ירקות, שניצל, כנפיים): להוריד כ-15°C, לקצר זמן ב-20–30%.
• טיגון עמוק/במחבת → AIR CRISP: ציפוי בספריי שמן, 180–200°C.
• מחבת פסים/על האש/סטייק → GRILL ברמה המתאימה.
• צלייה בתנור → ROAST, עם טמפ' ותיקון זמן לפי משקל.
• שלבי כיריים (בישול פסטה, רוטב, הקצפה, מחבת): אם אפשר – להמיר (למשל: רוטב/תבשיל שנאפה בתבנית מכוסה ב-BAKE, בצל מוקפץ ב-AIR CRISP/ROAST בסיר). אם אי אפשר – לסמן את השלב כ"שלב מחוץ לנינג'ה" (program NONE, outsideNinja=true) ולהסביר.
• שלבי הכנה ידניים (ערבוב, חיתוך) – program NONE ו-outsideNinja=false.
• התאמת כמות: חשב את נפח/שטח התבנית המקורית מול מה שנכנס ל-AG301. יחס שטחים: תבנית עגולה 26 ס"מ (531 סמ"ר) → 22 ס"מ (380 סמ"ר) = פקטור 0.72. תבנית 33×23 (759 סמ"ר) → 20×20 (400 סמ"ר) = פקטור 0.53. לפי המשתמש: scale=fit → הקטן כמויות לפקטור ורשום כמויות מעוגלות בצורה שימושית (כולל ביצים – למשל "2 ביצים גדולות" או "1 ביצה + 1 חלמון"); scale=keep → השאר כמויות וחלק לסבבים (batches) או לתבניות רבות, עם הוראות מדויקות.
• נייר אפייה: רק כשהמזון מכביד עליו, אף פעם לא בזמן חימום מוקדם (עלול לעוף לגוף החימום).
• תמיד תן סימני מוכנות (צבע, טמפ' פנימית: עוף 74°C, בקר מדיום-רייר 54°C, מדיום 60°C, דג 63°C, קיסם יוצא נקי וכו').
• בכל שלב שבו משתמשים במכשיר: ציין program, tempC (מספר מדויק ומותר), grillLevel (רק ל-GRILL), minutes, accessory, preheat. שלב חימום מוקדם הוא שלב נפרד עם preheat=true.
• אם התבניות שהמשתמש סימן שיש לו מתאימות – השתמש בהן. אחרת המלץ על המתאימה ביותר מהרשימה שנכנסת.
• אם המתכון בלתי אפשרי ב-AG301 (למשל מרק רב-כמויות שדורש בישול בנוזל ממושך, סופלה ענק, פיצה 30 ס"מ) – אמור זאת ביושר והצע את ההתאמה הקרובה ביותר (verdict unsuitable או partial).
• סגנון: קצר ותכליתי. כל שדה טקסט עד 25 מילים.
• אסור להזכיר "מקדם", "פקטור" או את מספר מקדם הכמויות בשום טקסט למשתמש (כותרות, הסברים, הערות, טיפים). אפשר לומר פשוט "הקטנו את הכמויות".
• כמויות: רק מידות מטבח שימושיות — שברים (¼, ⅓, ½, ⅔, ¾), כפות, כפיות, גרמים או יחידות שלמות. לעולם לא מספרים עשרוניים (לא 0.7 כוס, לא 0.75 כפית). למשל: 0.7 כוס ← ⅔ כוס; 1.4 כוסות ← 1½ כוסות פחות 1 כף או פשוט 1½ כוסות.
• בהוראות ההכנה אסור לכתוב כמויות של מרכיבים — רק את שמותיהם (למשל "מערבבים את הקמח, הסוכר והקקאו"). הכמויות מופיעות רק ברשימת המרכיבים.
• שלב חימום מוקדם: minutes = זמן החימום בלבד (כ-3 דקות ל-BAKE/ROAST/AIR CRISP, כ-8 דקות ל-GRILL). זמן הבישול המלא מופיע רק בשלב הבישול עצמו. שלב בדיקה באמצע הבישול הוא חלק משלב הבישול או שלב עם program NONE — לא לספור את אותן דקות פעמיים.
• כל הטקסט בעברית טבעית וקצרה. מספרים בספרות. אין להמציא מרכיבים שלא היו, מלבד תוספות טכניות קטנות (ספריי שמן, רדיד) – וסמן אותן changed=true.
`;

export const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    isRecipe: { type: 'boolean' },
    notRecipeReason: { type: 'string' },
    title: { type: 'string' },
    subtitle: { type: 'string', description: 'משפט קצר אחד' },
    verdictLevel: { type: 'string', enum: ['perfect', 'adapted', 'batches', 'partial', 'unsuitable'] },
    verdictHeadline: { type: 'string' },
    verdictExplanation: { type: 'string' },
    primaryProgram: { type: 'string', enum: ['GRILL', 'AIR CRISP', 'ROAST', 'BAKE', 'DEHYDRATE', 'MIXED'] },
    mainTempC: { type: 'number' },
    accessory: { type: 'string', description: 'האביזר/התבנית העיקריים בתוך המכשיר' },
    servingsOriginal: { type: 'string' },
    servingsNinja: { type: 'string' },
    scaleFactor: { type: 'number' },
    batchCount: { type: 'number' },
    batchNote: { type: 'string' },
    totalMinutes: { type: 'number' },
    ninjaMinutes: { type: 'number' },
    methodSummary: { type: 'string', description: 'תקציר טכני של שיטת ההכנה בנינג׳ה: שלבים, תכניות, טמפ׳ וזמנים – ישמש לכתיבת ההוראות' }
  },
  required: ['isRecipe', 'title', 'verdictLevel', 'verdictHeadline', 'verdictExplanation', 'primaryProgram', 'scaleFactor', 'batchCount', 'methodSummary']
};

export const ING_SCHEMA = {
  type: 'object',
  properties: {
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          amount: { type: 'string' },
          item: { type: 'string' },
          note: { type: 'string' },
          changed: { type: 'boolean' }
        },
        required: ['amount', 'item', 'changed']
      }
    }
  },
  required: ['ingredients']
};

export const STEPS_SCHEMA = {
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      description: 'עד 10 שלבים',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          program: { type: 'string', enum: ['NONE', 'GRILL', 'AIR CRISP', 'ROAST', 'BAKE', 'DEHYDRATE'] },
          tempC: { type: 'number' },
          grillLevel: {
            type: 'string',
            enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'MAX'],
            description: 'LOW/MEDIUM/HIGH/MAX only for GRILL, otherwise NONE'
          },
          minutes: { type: 'number' },
          accessory: { type: 'string' },
          preheat: { type: 'boolean' },
          cue: { type: 'string' },
          outsideNinja: { type: 'boolean' }
        },
        required: ['text', 'program', 'minutes']
      }
    },
    tips: { type: 'array', description: 'עד 3', items: { type: 'string' } },
    warnings: { type: 'array', description: 'עד 3', items: { type: 'string' } }
  },
  required: ['steps']
};

export const LIMITS: Record<string, [number, number]> = {
  'GRILL': [210, 265],
  'AIR CRISP': [150, 250],
  'ROAST': [120, 240],
  'BAKE': [120, 210],
  'DEHYDRATE': [40, 90]
};

const GRILL_TEMPS: Record<string, number> = { LOW: 210, MEDIUM: 230, HIGH: 260, MAX: 265 };

export function clampTemp(program: string, t: unknown): number {
  const lim = LIMITS[program];
  const n = typeof t === 'number' && isFinite(t) ? t : 0;
  if (!lim) return n;
  if (n <= 0) return 0;
  const rounded = program === 'DEHYDRATE' ? Math.round(n) : Math.round(n / 5) * 5;
  return Math.min(lim[1], Math.max(lim[0], rounded));
}

type Step = {
  text?: string;
  program?: string;
  tempC?: number;
  grillLevel?: string;
  minutes?: number;
};

export function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function sanitizeSteps(raw: unknown[]): Step[] {
  const steps = raw.filter((s) => s && typeof s === 'object') as Step[];
  for (const s of steps) {
    const p = s.program || 'NONE';
    s.program = p;
    if (typeof s.minutes !== 'number' || !isFinite(s.minutes)) s.minutes = 0;
    if (p === 'GRILL') {
      const lvl = s.grillLevel && GRILL_TEMPS[s.grillLevel] ? s.grillLevel : 'HIGH';
      s.grillLevel = lvl;
      s.tempC = GRILL_TEMPS[lvl];
      s.minutes = Math.min(30, Math.max(0, s.minutes));
    } else {
      s.grillLevel = '';
      if (p !== 'NONE') s.tempC = clampTemp(p, s.tempC);
    }
  }
  return steps.filter((s) => typeof s.text === 'string' && s.text.trim().length > 0);
}

export function contextFor(pans: string[], sourceTitle: string) {
  return [
    'מצב כמויות: fit — התאם כמויות כך שייכנס בסבב אחד/בתבנית שנכנסת',
    'תבניות ואביזרים שיש למשתמש מעבר לסיר, רשת הגריל והסלסלה: ' + (pans.length ? pans.join(', ') : 'אין מידע — המלץ'),
    sourceTitle ? 'כותרת העמוד: ' + sourceTitle : '',
    'אם התוכן הוא עמוד אינטרנט, התעלם מפרסומות, תגובות ותפריטים — רק המתכון.'
  ].filter(Boolean).join('\n');
}

export function decidedText(plan: Record<string, unknown>) {
  return [
    'החלטות שכבר התקבלו (חובה להיצמד אליהן בדיוק):',
    'תכנית עיקרית: ' + plan.primaryProgram + ', טמפ׳: ' + (plan.mainTempC || '') + '°C',
    'אביזר/תבנית: ' + (plan.accessory || ''),
    'מקדם כמויות (לשימוש פנימי בלבד, לא להזכיר בטקסט): ' + (plan.scaleFactor || 1) + ', סבבים: ' + (plan.batchCount || 1) + ' ' + (plan.batchNote || ''),
    'כמות: ' + (plan.servingsOriginal || '') + ' → ' + (plan.servingsNinja || ''),
    'שיטה: ' + (plan.methodSummary || '')
  ].join('\n');
}

