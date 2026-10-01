// Small fetch wrapper with an axios-like shape ({ data } / error.response)
export interface ApiError extends Error {
  response?: { status: number; data: unknown };
}

async function post(path: string, body: unknown): Promise<{ data: unknown }> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = new Error('HTTP ' + res.status) as ApiError;
    err.response = { status: res.status, data };
    throw err;
  }
  return { data };
}

export const api = { post };
