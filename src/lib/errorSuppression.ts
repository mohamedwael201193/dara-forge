// Global fetch wrapper to handle FormData properly
const orig = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const body: any = init?.body;
  const isFD = typeof FormData !== 'undefined' && body instanceof FormData;
  if (isFD) {
    const headers = new Headers(init?.headers || {});
    headers.delete('content-type');
    return orig(input, { ...init, headers });
  }
  return orig(input, init);
};

