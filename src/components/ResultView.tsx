import { useState } from 'react';
import {
  ArrowRight,
  Share2,
  Copy,
  Check,
  Flame,
  AlertTriangle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import type { HistoryItem, Recipe, Step } from '../types';
import { PROGRAM_HE, GRILL_HE } from '../types';

const VERDICT_TONE: Record<string, string> = {
  perfect: 'ok',
  adapted: 'ok',
  batches: 'warn',
  partial: 'warn',
  unsuitable: 'bad'
};

const VERDICT_LABEL: Record<string, string> = {
  perfect: 'מתאים בדיוק',
  adapted: 'הותאם בהצלחה',
  batches: 'בסבבים',
  partial: 'התאמה חלקית',
  unsuitable: 'לא מומלץ בנינג׳ה'
};

function fmtMin(m?: number): string {
  if (!m || m <= 0) return '—';
  if (m < 60) return `${Math.round(m)} דק׳`;
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return r ? `${h}:${String(r).padStart(2, '0')} ש׳` : `${h} ש׳`;
}

function tempLabel(s: Step): string {
  if (s.program === 'GRILL' && s.grillLevel) {
    return `${GRILL_HE[s.grillLevel] || s.grillLevel} · ${s.tempC || ''}°`;
  }
  return s.tempC ? `${s.tempC}°` : '';
}

function toPlainText(r: Recipe): string {
  const lines: string[] = [];
  lines.push(`${r.title} — גרסת Ninja AG301`);
  if (r.subtitle) lines.push(r.subtitle);
  lines.push('');
  lines.push(`תכנית: ${PROGRAM_HE[r.primaryProgram] || r.primaryProgram}${r.mainTempC ? ` ${r.mainTempC}°C` : ''} | ${r.accessory || ''}`);
  if (r.servingsNinja) lines.push(`כמות: ${r.servingsNinja}`);
  lines.push('');
  lines.push('מרכיבים:');
  r.ingredients.forEach((i) => lines.push(`• ${i.amount} ${i.item}${i.note ? ` (${i.note})` : ''}`));
  lines.push('');
  lines.push('הוראות:');
  r.steps.forEach((s, idx) => {
    const set = s.program !== 'NONE' ? ` [${s.program} ${tempLabel(s)} ${s.minutes ? s.minutes + ' דק׳' : ''}]` : '';
    lines.push(`${idx + 1}. ${s.text}${set}`);
  });
  if (r.tips && r.tips.length) {
    lines.push('');
    lines.push('טיפים:');
    r.tips.forEach((t) => lines.push(`• ${t}`));
  }
  lines.push('');
  lines.push('נוצר ב-NINJAFY IT');
  return lines.join('\n');
}

export default function ResultView({ item, onBack }: { item: HistoryItem; onBack: () => void }) {
  const r = item.recipe;
  const [checkedIng, setCheckedIng] = useState<number[]>([]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const tone = VERDICT_TONE[r.verdict?.level] || 'ok';
  const steps = Array.isArray(r.steps) ? r.steps : [];
  const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
  const batchCount = r.batches && r.batches.count > 1 ? r.batches.count : 0;

  function toggle(list: number[], set: (v: number[]) => void, i: number) {
    set(list.includes(i) ? list.filter((x) => x !== i) : [...list, i]);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(toPlainText(r));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  async function share() {
    const text = toPlainText(r);
    if (navigator.share) {
      try {
        await navigator.share({ title: r.title, text });
        return;
      } catch {
        return;
      }
    }
    copy();
  }

  return (
    <main className="result">
      <button className="back" onClick={onBack}>
        <ArrowRight size={18} /> מתכון חדש
      </button>

      <header className="r-head">
        <p className="eyebrow">גרסת AG301</p>
        <h1>{r.title}</h1>
        {r.subtitle && <p className="lede">{r.subtitle}</p>}
        {item.sourceUrl && (
          <a className="src" href={item.sourceUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={13} /> המתכון המקורי
          </a>
        )}
      </header>

      <section className={`verdict ${tone}`} aria-label="שורה תחתונה">
        <span className="verdict-tag">{VERDICT_LABEL[r.verdict?.level] || ''}</span>
        <strong>{r.verdict?.headline}</strong>
        <p>{r.verdict?.explanation}</p>
      </section>

      <section className="display" aria-label="הגדרות המכשיר">
        <div className="display-grid">
          <div className="cell wide">
            <span className="k">תכנית</span>
            <span className="v prog">{r.primaryProgram}</span>
            <span className="s">{PROGRAM_HE[r.primaryProgram]}</span>
          </div>
          <div className="cell">
            <span className="k">טמפ׳</span>
            <span className="v">{r.mainTempC ? `${r.mainTempC}°` : '—'}</span>
            <span className="s">צלזיוס</span>
          </div>
          <div className="cell">
            <span className="k">זמן במכשיר</span>
            <span className="v">{r.ninjaMinutes ? Math.round(r.ninjaMinutes) : '—'}</span>
            <span className="s">דקות{r.totalMinutes ? ` · סה״כ ${fmtMin(r.totalMinutes)}` : ''}</span>
          </div>
        </div>
        {r.accessory && (
          <div className="display-foot">
            <Flame size={15} /> {r.accessory}
          </div>
        )}
      </section>

      <section className="stats">
        {(r.servingsOriginal || r.servingsNinja) && (
          <div>
            <span className="k">כמות</span>
            <span className="v">
              {r.servingsOriginal && r.servingsNinja && r.servingsOriginal !== r.servingsNinja ? (
                <>
                  <s>{r.servingsOriginal}</s> ← {r.servingsNinja}
                </>
              ) : (
                r.servingsNinja || r.servingsOriginal
              )}
            </span>
          </div>
        )}
        {batchCount ? (
          <div>
            <span className="k">סבבים</span>
            <span className="v">{batchCount}</span>
          </div>
        ) : null}
      </section>
      {r.batches && r.batches.note && batchCount > 0 && <p className="batch-note">{r.batches.note}</p>}

      <section className="block">
        <h2>
          מרכיבים <span className="count">{ingredients.length}</span>
        </h2>
        <ul className="ings">
          {ingredients.map((ing, i) => (
            <li key={i} className={checkedIng.includes(i) ? 'got' : ''}>
              <button onClick={() => toggle(checkedIng, setCheckedIng, i)} aria-pressed={checkedIng.includes(i)}>
                <span className="box" aria-hidden="true">{checkedIng.includes(i) && <Check size={13} />}</span>
                <span className="ing-body">
                  <span className="ing-line">
                    <b className={ing.changed ? 'amt changed' : 'amt'}>{ing.amount}</b> {ing.item}
                  </span>
                  {ing.note && <span className="ing-note">{ing.note}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="block">
        <h2>הוראות הכנה</h2>
        <ol className="steps">
          {steps.map((s, i) => {
            const ninja = s.program && s.program !== 'NONE';
            return (
              <li key={i} className={doneSteps.includes(i) ? 'done' : ''}>
                <button
                  className="step-num"
                  onClick={() => toggle(doneSteps, setDoneSteps, i)}
                  aria-label={`סימון שלב ${i + 1} כבוצע`}
                  aria-pressed={doneSteps.includes(i)}
                >
                  {doneSteps.includes(i) ? <Check size={15} /> : i + 1}
                </button>
                <div className="step-body">
                  {ninja && (
                    <div className="set">
                      <span className="set-prog">{s.program}</span>
                      {tempLabel(s) && <span className="set-temp">{tempLabel(s)}</span>}
                      {s.minutes > 0 && <span className="set-time">{fmtMin(s.minutes)}</span>}
                      {s.preheat && <span className="set-flag">חימום מוקדם</span>}
                    </div>
                  )}
                  {!ninja && s.outsideNinja && <div className="set off">מחוץ לנינג׳ה</div>}
                  <p>{s.text}</p>
                  {ninja && s.accessory && <p className="step-acc">{s.accessory}</p>}
                  {s.cue && <p className="cue">✓ {s.cue}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {r.warnings && r.warnings.length > 0 && (
        <section className="block note warn">
          <h2>
            <AlertTriangle size={18} /> שימו לב
          </h2>
          <ul>
            {r.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {r.tips && r.tips.length > 0 && (
        <section className="block note">
          <h2>
            <Lightbulb size={18} /> טיפים של נינג׳ה
          </h2>
          <ul>
            {r.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="actions">
        <button className="btn" onClick={share}>
          <Share2 size={17} /> שיתוף
        </button>
        <button className="btn" onClick={copy}>
          {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'הועתק' : 'העתקה'}
        </button>
        <button className="btn primary" onClick={onBack}>
          מתכון חדש
        </button>
      </div>
    </main>
  );
}
