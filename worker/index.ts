// Cloudflare Worker entry: /api/* goes to our handlers, everything else to the static site.
import { onRequestPost as plan } from '../functions/api/plan';
import { onRequestPost as details } from '../functions/api/details';
import type { Env as AiEnv } from '../lib/gemini';
import { error } from '../lib/http';

interface Env extends AiEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/')) {
      if (request.method !== 'POST') return error('Method not allowed', 405);
      if (pathname === '/api/plan') return plan({ request, env });
      if (pathname === '/api/details') return details({ request, env });
      return error('Not found', 404);
    }
    return env.ASSETS.fetch(request);
  }
};
