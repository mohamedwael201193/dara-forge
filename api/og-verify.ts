import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method not allowed' });
  const hash = (req.query.hash as string) || '';
  // Optional: look up hash status on your indexer or chain
  return res.status(200).json({ ok: true, hash, status: 'stub' });
}


