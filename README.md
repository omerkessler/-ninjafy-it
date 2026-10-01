# NINJAFY IT

ממיר מתכונים ל-Ninja Foodi AG301. React + Vite, Cloudflare Pages + Functions, Gemini API.

## מבנה

| תיקייה | מה יש בה |
|---|---|
| `src/` | הממשק (React) |
| `functions/api/plan.ts` | שלב 1 — קורא את המתכון (טקסט או קישור) ומחליט על תכנית, טמפ׳, תבנית וכמויות |
| `functions/api/details.ts` | שלב 2 — מרכיבים / הוראות (נקרא פעמיים במקביל) |
| `lib/ninja.ts` | מפרט ה-AG301, ההוראות ל-AI, הטווחים והתיקונים |
| `lib/gemini.ts` | החיבור ל-Gemini |
| `lib/reader.ts` | קריאת עמוד מתכון מקישור |

## הגדרות (משתני סביבה ב-Cloudflare)

| שם | חובה | הסבר |
|---|---|---|
| `GEMINI_API_KEY` | כן | המפתח מ-Google AI Studio. להגדיר כ-Secret |
| `GEMINI_MODEL` | לא | שם מודל אחר, אם רוצים להחליף. ברירת מחדל: `gemini-3.5-flash` |

## הרצה מקומית (לא חובה)

```bash
npm install
cp .dev.vars.example .dev.vars   # ולהדביק את המפתח בקובץ
npm run preview                  # http://localhost:8788
```
