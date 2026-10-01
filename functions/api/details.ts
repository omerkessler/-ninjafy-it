import { extract, AiError, type Env } from '../../lib/gemini';
import { json, error, readBody, type Ctx } from '../../lib/http';
import {
  NINJA_SPEC,
  ING_SCHEMA,
  STEPS_SCHEMA,
  MAX_CONTENT,
  asObj,
  asArr,
  sanitizeSteps,
  contextFor,
  decidedText
} from '../../lib/ninja';

export async function onRequestPost({ request, env }: Ctx<Env>): Promise<Response> {
  const b = await readBody(request);
  const content = String(b.content || '').slice(0, MAX_CONTENT);
  const plan = asObj(b.plan);
  const part = b.part === 'steps' ? 'steps' : 'ingredients';
  if (content.length < 30 || !plan.primaryProgram) return error('חסר מידע להמשך ההמרה. נסו שוב.', 400);

  const decided = decidedText(plan) + '\n' + contextFor([], String(b.sourceTitle || ''));

  try {
    if (part === 'ingredients') {
      const ing = await extract(env, {
        system: NINJA_SPEC,
        prompt:
          'שלב 2: כתוב את רשימת המרכיבים המותאמת (לפי מקדם הכמויות, מעוגלת למידות שימושיות בשברים; changed=true לכל כמות ששונתה).\n' +
          decided,
        content,
        schema: ING_SCHEMA,
        maxTokens: 3000
      });
      const ingredients = asArr(ing.ingredients).filter((i) => i && typeof i === 'object');
      if (!ingredients.length) return error('ההמרה לא הושלמה. נסו שוב.', 502);
      return json({ ok: true, ingredients });
    }

    const method = await extract(env, {
      system: NINJA_SPEC,
      prompt:
        'שלב 3: כתוב את הוראות ההכנה ל-AG301 (עד 10 שלבים, כל שלב עד 25 מילים, בלי כמויות, עם program/tempC/grillLevel/minutes/accessory/preheat/cue), עד 3 טיפים ועד 3 אזהרות.\n' +
        decided,
      content,
      schema: STEPS_SCHEMA,
      maxTokens: 4000
    });
    const steps = sanitizeSteps(asArr(method.steps));
    if (!steps.length) return error('ההמרה לא הושלמה. נסו שוב.', 502);
    return json({
      ok: true,
      steps: steps.slice(0, 12),
      tips: asArr(method.tips).filter((t) => typeof t === 'string').slice(0, 4),
      warnings: asArr(method.warnings).filter((t) => typeof t === 'string').slice(0, 4)
    });
  } catch (err) {
    const e = err as AiError;
    return error(e.message || 'ההמרה נכשלה. נסו שוב.', e.status || 502);
  }
}
