// Reads a recipe page. Prefers schema.org Recipe JSON-LD (cheap and clean),
// falls back to plain page text.

const MAX_HTML = 800_000;

function findRecipe(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findRecipe(n);
      if (r) return r;
    }
    return null;
  }
  const o = node as Record<string, unknown>;
  const t = o['@type'];
  if (t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'))) return o;
  if (o['@graph']) return findRecipe(o['@graph']);
  return null;
}

function stepsText(ins: unknown): string[] {
  if (!ins) return [];
  if (typeof ins === 'string') return [ins];
  if (Array.isArray(ins)) return ins.flatMap(stepsText);
  if (typeof ins === 'object') {
    const o = ins as Record<string, unknown>;
    if (o.itemListElement) {
      const name = typeof o.name === 'string' ? [o.name + ':'] : [];
      return [...name, ...stepsText(o.itemListElement)];
    }
    if (typeof o.text === 'string') return [o.text];
  }
  return [];
}

function decode(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function recipeToText(r: Record<string, unknown>): string {
  const lines: string[] = [];
  if (r.name) lines.push(String(r.name));
  if (r.recipeYield) lines.push('כמות: ' + (Array.isArray(r.recipeYield) ? r.recipeYield.join(', ') : String(r.recipeYield)));
  for (const k of ['prepTime', 'cookTime', 'totalTime']) if (r[k]) lines.push(k + ': ' + String(r[k]));
  const ing = Array.isArray(r.recipeIngredient) ? r.recipeIngredient : [];
  if (ing.length) {
    lines.push('', 'מרכיבים:');
    ing.forEach((i) => lines.push('- ' + String(i)));
  }
  const steps = stepsText(r.recipeInstructions);
  if (steps.length) {
    lines.push('', 'הוראות:');
    steps.forEach((s, i) => lines.push(i + 1 + '. ' + s));
  }
  return decode(lines.join('\n'));
}

export async function readRecipePage(url: string): Promise<{ text: string; title: string }> {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; NinjafyIt/1.0; recipe reader)',
      accept: 'text/html,application/xhtml+xml'
    },
    redirect: 'follow'
  });
  if (!res.ok) throw new Error('status ' + res.status);
  const html = (await res.text()).slice(0, MAX_HTML);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decode(titleMatch[1].trim()) : '';

  const blocks = html.match(/<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || [];
  for (const b of blocks) {
    const json = b.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
    try {
      const recipe = findRecipe(JSON.parse(json));
      if (recipe) {
        const text = recipeToText(recipe);
        if (text.length > 80) return { text, title };
      }
    } catch {
      /* ignore broken JSON-LD */
    }
  }

  const body = html
    .replace(/<(script|style|noscript|svg|header|footer|nav)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|li|h\d|div)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  const text = decode(body).replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
  return { text, title };
}
