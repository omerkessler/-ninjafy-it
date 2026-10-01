import { useEffect, useState } from 'react';
import { api } from './api';
import { Clock, Link2, ClipboardPaste, Sparkles, X, Trash2 } from 'lucide-react';
import ResultView from './components/ResultView';
import type { HistoryItem, Recipe } from './types';
import { PROGRAM_HE } from './types';

const SAMPLE = `עוגת שוקולד בחושה של סבתא
מרכיבים:
2 כוסות קמח
2 כוסות סוכר
3/4 כוס קקאו
2 כפיות אבקת אפייה
1 כפית סודה לשתייה
4 ביצים
1 כוס שמן
1 כוס מים רותחים
1 כוס חלב
1 כפית תמצית וניל

הוראות:
1. מחממים תנור ל-180 מעלות ומשמנים תבנית עגולה בקוטר 26 ס"מ.
2. מערבבים בקערה את כל היבשים.
3. מוסיפים ביצים, שמן, חלב ווניל ומערבבים. בסוף מוסיפים את המים הרותחים ומערבבים לבלילה חלקה.
4. יוצקים לתבנית ואופים 40-45 דקות עד שקיסם יוצא עם פירורים לחים.
5. מצננים ומגישים.`;

const LOADING_LINES = [
  'קוראים את המתכון…',
  'מודדים את התבנית מול הסיר…',
  'מתרגמים טמפרטורות לתכניות…',
  'מקצרים זמנים לקונבקציה…',
  'בודקים שהכל נכנס מתחת למכסה…',
  'מלטשים את ההוראות…'
];

const HISTORY_KEY = 'ninjafy.history.v1';

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20)));
  } catch {
    /* storage unavailable */
  }
}

function errorMessage(err: unknown): string {
  const e = (err || {}) as {
    response?: { status?: number; data?: { error?: string; message?: string } };
    data?: { error?: string; message?: string };
    status?: number;
    message?: string;
    code?: string;
  };
  const d = (e.response && e.response.data) || e.data;
  const status = (e.response && e.response.status) || e.status;
  if (d && typeof d === 'object' && d.error) return String(d.error);
  const msg = String((d && d.message) || e.message || '');
  if (status === 504 || /timeout|timed out/i.test(msg) || e.code === 'ECONNABORTED') {
    return 'ההמרה לקחה יותר מדי זמן. נסו שוב.';
  }
  if (status === 429) return 'יש עומס רגעי. נסו שוב בעוד דקה.';
  return 'משהו השתבש בדרך לנינג׳ה' + (status ? ' (קוד ' + status + ')' : '') + '. נסו שוב.';
}

async function postWithRetry(path: string, payload: unknown): Promise<Record<string, unknown>> {
  try {
    const res = await api.post(path, payload);
    return (res.data || {}) as Record<string, unknown>;
  } catch (first) {
    const e = first as { response?: { status?: number }; status?: number };
    const status = (e.response && e.response.status) || e.status || 0;
    if (status >= 400 && status < 500 && status !== 429) throw first;
    const res = await api.post(path, payload);
    return (res.data || {}) as Record<string, unknown>;
  }
}

function numOrUndef(v: unknown): number | undefined {
  return typeof v === 'number' && isFinite(v) ? v : undefined;
}

type Mode = 'text' | 'url';

export default function App() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [err, setErr] = useState('');
  const [current, setCurrent] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const t = window.setInterval(() => {
      setLineIdx((i) => (i + 1 < LOADING_LINES.length ? i + 1 : i));
    }, 3000);
    return () => window.clearInterval(t);
  }, [loading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [current]);

  async function submit() {
    setErr('');
    if (mode === 'text' && text.trim().length < 30) {
      setErr('הדביקו מתכון מלא — מרכיבים והוראות הכנה.');
      return;
    }
    if (mode === 'url' && !/^https?:\/\/\S+\.\S+/i.test(url.trim())) {
      setErr('הקישור לא תקין. ודאו שהוא מתחיל ב-https://');
      return;
    }
    setLoading(true);
    try {
      setLineIdx(0);
      const p = await postWithRetry('/api/plan', {
        text: mode === 'text' ? text : '',
        url: mode === 'url' ? url.trim() : '',
        pans: []
      });
      if (!p.ok || !p.plan) {
        setErr(String(p.reason || 'לא זיהינו כאן מתכון. נסו טקסט אחר.'));
        return;
      }
      setLineIdx(3);
      const plan = p.plan as Record<string, unknown>;
      const detailsPayload = { content: p.content, plan, sourceTitle: p.sourceTitle || '' };
      const [ing, method] = await Promise.all([
        postWithRetry('/api/details', { ...detailsPayload, part: 'ingredients' }),
        postWithRetry('/api/details', { ...detailsPayload, part: 'steps' })
      ]);
      const recipe: Recipe = {
        title: String(plan.title || ''),
        subtitle: plan.subtitle ? String(plan.subtitle) : '',
        verdict: {
          level: (String(plan.verdictLevel || 'adapted') as Recipe['verdict']['level']),
          headline: String(plan.verdictHeadline || ''),
          explanation: String(plan.verdictExplanation || '')
        },
        primaryProgram: String(plan.primaryProgram) as Recipe['primaryProgram'],
        mainTempC: numOrUndef(plan.mainTempC),
        accessory: plan.accessory ? String(plan.accessory) : '',
        servingsOriginal: plan.servingsOriginal ? String(plan.servingsOriginal) : '',
        servingsNinja: plan.servingsNinja ? String(plan.servingsNinja) : '',
        totalMinutes: numOrUndef(plan.totalMinutes),
        ninjaMinutes: numOrUndef(plan.ninjaMinutes),
        batches: { count: numOrUndef(plan.batchCount) || 1, note: plan.batchNote ? String(plan.batchNote) : '' },
        changes: [],
        ingredients: (Array.isArray(ing.ingredients) ? ing.ingredients : []) as Recipe['ingredients'],
        steps: (Array.isArray(method.steps) ? method.steps : []) as Recipe['steps'],
        tips: (Array.isArray(method.tips) ? method.tips : []) as string[],
        warnings: (Array.isArray(method.warnings) ? method.warnings : []) as string[]
      };
      if (!recipe.steps.length || !recipe.ingredients.length) {
        setErr('ההמרה לא הושלמה. נסו שוב.');
        return;
      }
      const item: HistoryItem = {
        id: String(Date.now()),
        savedAt: Date.now(),
        sourceUrl: (p.sourceUrl as string) || null,
        recipe
      };
      const next = [item, ...history].slice(0, 20);
      setHistory(next);
      saveHistory(next);
      setCurrent(item);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    if (!window.confirm('למחוק את כל המתכונים השמורים?')) return;
    setHistory([]);
    saveHistory([]);
  }

  function removeItem(id: string) {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    saveHistory(next);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand" onClick={() => setCurrent(null)} aria-label="NINJAFY IT — מסך הבית">
          <span className="brand-mark" aria-hidden="true">
            <i /><i /><i />
          </span>
          <span className="brand-word">NINJAFY<span>IT</span></span>
        </button>
        <button className="icon-btn" onClick={() => setHistoryOpen(true)} aria-label="המתכונים שלי">
          <Clock size={20} />
          {history.length > 0 && <span className="dot">{history.length}</span>}
        </button>
      </header>

      {current ? (
        <ResultView item={current} onBack={() => setCurrent(null)} />
      ) : (
        <main className="home">
          <section className="hero">
            <div className="grate" aria-hidden="true" />
            <h1>
              כל מתכון.
              <br />
              <em>בנינג׳ה שלך.</em>
            </h1>
            <p className="lede">
              מדביקים מתכון רגיל — מקבלים תכנית, טמפרטורה, זמן, תבנית שנכנסת וכמויות מותאמות. בלי לנחש.
            </p>
          </section>

          <section className="panel" aria-label="הזנת מתכון">
            <div className="seg" role="tablist" aria-label="סוג קלט">
              <button role="tab" aria-selected={mode === 'text'} className={mode === 'text' ? 'on' : ''} onClick={() => { setMode('text'); setErr(''); }}>
                <ClipboardPaste size={16} /> הדבקת מתכון
              </button>
              <button role="tab" aria-selected={mode === 'url'} className={mode === 'url' ? 'on' : ''} onClick={() => { setMode('url'); setErr(''); }}>
                <Link2 size={16} /> קישור
              </button>
            </div>

            {mode === 'text' ? (
              <div className="field">
                <label htmlFor="recipe-text" className="sr-only">טקסט המתכון</label>
                <textarea
                  id="recipe-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={'הדביקו כאן מתכון — מרכיבים והוראות.\nכל שפה, כל פורמט.'}
                  rows={9}
                  disabled={loading}
                />
                <div className="field-foot">
                  <button className="link-btn" type="button" onClick={() => setText(SAMPLE)} disabled={loading}>
                    <Sparkles size={14} /> נסו מתכון לדוגמה
                  </button>
                  {text && (
                    <button className="link-btn muted" type="button" onClick={() => setText('')} disabled={loading}>
                      ניקוי
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="recipe-url" className="label">קישור למתכון</label>
                <input
                  id="recipe-url"
                  type="url"
                  inputMode="url"
                  dir="ltr"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  disabled={loading}
                />
                <p className="hint">עובד עם רוב אתרי המתכונים. אם עמוד חסום — פשוט העתיקו והדביקו את הטקסט.</p>
              </div>
            )}

            {err && (
              <div className="alert" role="alert">
                {err}
              </div>
            )}

            <div className="cta-wrap">
              <button className={loading ? 'cta busy' : 'cta'} onClick={submit} disabled={loading}>
                {loading ? (
                  <span className="cta-loading">
                    <span className="heat" aria-hidden="true"><i /><i /><i /><i /></span>
                    <span aria-live="polite">{LOADING_LINES[lineIdx]}</span>
                  </span>
                ) : (
                  <>Ninjafy it</>
                )}
              </button>
            </div>
          </section>

          <footer className="foot">NINJAFY IT · כלי עצמאי, לא מטעם Ninja / SharkNinja</footer>
        </main>
      )}

      {historyOpen && (
        <div className="sheet-backdrop" onClick={() => setHistoryOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="המתכונים שלי" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <h2>המתכונים שלי</h2>
              <button className="icon-btn" onClick={() => setHistoryOpen(false)} aria-label="סגירה">
                <X size={20} />
              </button>
            </div>
            {history.length === 0 ? (
              <p className="empty">עוד לא נינג׳פיתם כלום. המתכון הראשון יופיע כאן.</p>
            ) : (
              <>
                <ul className="hist">
                  {history.map((h) => (
                    <li key={h.id}>
                      <button
                        className="hist-open"
                        onClick={() => {
                          setCurrent(h);
                          setHistoryOpen(false);
                        }}
                      >
                        <strong>{h.recipe.title}</strong>
                        <span>
                          {PROGRAM_HE[h.recipe.primaryProgram] || h.recipe.primaryProgram}
                          {h.recipe.mainTempC ? ` · ${h.recipe.mainTempC}°C` : ''}
                          {' · '}
                          {new Date(h.savedAt).toLocaleDateString('he-IL')}
                        </span>
                      </button>
                      <button className="icon-btn sm" onClick={() => removeItem(h.id)} aria-label={`מחיקת ${h.recipe.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="link-btn muted danger" onClick={clearHistory}>
                  מחיקת הכל
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
