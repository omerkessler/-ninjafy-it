import { extract, AiError, type Env } from '../../lib/gemini';
import { readRecipePage } from '../../lib/reader';
import { json, error, readBody, type Ctx } from '../../lib/http';
import { NINJA_SPEC, PLAN_SCHEMA, MAX_CONTENT, LIMITS, clampTemp, contextFor } from '../../lib/ninja';

export async function onRequestPost({ request, env }: Ctx<Env>): Promise<Response> {
  const b = await readBody(request);
  let content = String(b.text || '').trim();
  let sourceTitle = '';
  const url = String(b.url || '').trim();

  if (!content && !url) return error('צריך להדביק מתכון או קישור.', 400);

  if (url) {
    if (!/^https?:\/\/\S+\.\S+/i.test(url)) {
      return error('הקישור לא תקין. ודאו שהוא מתחיל ב-https://', 400);
    }
    try {
      const page = await readRecipePage(url);
      if (page.text.length < 80) throw new Error('empty');
      content = page.text;
      sourceTitle = page.title;
    } catch (err) {
      console.error('read page failed', String(err));
      return error('לא הצלחנו לקרוא את העמוד. נסו להעתיק ולהדביק את המתכון כטקסט.', 422);
    }
  }

  if (content.length < 30) return error('המתכון קצר מדי. הדביקו מתכון מלא עם מרכיבים והוראות.', 400);
  content = content.slice(0, MAX_CONTENT);

  let plan: Record<string, unknown>;
  try {
    plan = await extract(env, {
      system: NINJA_SPEC,
      prompt:
        'שלב 1: קבל את כל החלטות ההמרה ל-AG301 (תכנית, טמפ׳, תבנית, מקדם כמויות, סבבים, זמנים) וכתוב תקציר טכני קצר של שיטת ההכנה. אם אין בתוכן מתכון — isRecipe=false ונמק.\n' +
        contextFor([], sourceTitle),
      content,
      schema: PLAN_SCHEMA,
      maxTokens: 2048
    });
  } catch (err) {
    const e = err as AiError;
    return error(e.message || 'ההמרה נכשלה. נסו שוב.', e.status || 502);
  }

  if (plan.isRecipe === false) {
    return json({ ok: false, reason: String(plan.notRecipeReason || 'לא זיהינו כאן מתכון.') });
  }
  if (!plan.title || !plan.primaryProgram) return error('ההמרה נכשלה. נסו שוב.', 502);
  const prog = String(plan.primaryProgram);
  if (LIMITS[prog]) plan.mainTempC = clampTemp(prog, plan.mainTempC);

  return json({ ok: true, plan, content, sourceTitle, sourceUrl: url || null });
}
