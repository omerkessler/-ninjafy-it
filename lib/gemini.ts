// Minimal Gemini REST client (generateContent + JSON schema output)

export interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

// Tried in order; the first one that the key can use wins.
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ExtractOptions {
  system: string;
  prompt: string;
  content: string;
  schema: Record<string, unknown>;
  maxTokens: number;
}

function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  return JSON.parse(cleaned);
}

async function callModel(env: Env, model: string, o: ExtractOptions): Promise<Response> {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';
  return fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY || ''
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: o.prompt + '\n\n=== המתכון ===\n' + o.content }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: o.maxTokens,
        responseMimeType: 'application/json',
        responseSchema: o.schema
      }
    })
  });
}

export async function extract(env: Env, o: ExtractOptions): Promise<Record<string, unknown>> {
  if (!env.GEMINI_API_KEY) {
    throw new AiError('חסר מפתח GEMINI_API_KEY בהגדרות האתר.', 500);
  }
  const models = env.GEMINI_MODEL ? [env.GEMINI_MODEL, ...FALLBACK_MODELS] : FALLBACK_MODELS;

  let lastErr: AiError | null = null;
  for (const model of models) {
    // up to 2 attempts per model (second attempt only for malformed JSON)
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await callModel(env, model, o);
      if (res.status === 404 || (res.status === 400 && attempt === 0 && /model/i.test(await res.clone().text()))) {
        lastErr = new AiError('model ' + model + ' unavailable', res.status);
        break; // try next model
      }
      if (res.status === 429) {
        throw new AiError('יש עומס או שנגמרה המכסה היומית החינמית של Gemini. נסו שוב מאוחר יותר.', 429);
      }
      if (!res.ok) {
        const t = await res.text();
        console.error('gemini error', model, res.status, t.slice(0, 500));
        throw new AiError('ההמרה נכשלה. נסו שוב.', 502);
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const parts = data.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p) => p.text || '').join('');
      try {
        const parsed = parseJson(text);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        /* retry */
      }
      lastErr = new AiError('ההמרה לא הושלמה. נסו שוב.', 502);
    }
  }
  throw lastErr || new AiError('ההמרה נכשלה. נסו שוב.', 502);
}
