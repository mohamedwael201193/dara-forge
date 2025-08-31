import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withIronSessionApiRoute } from 'iron-session/next';

const sessionOptions = {
  cookieName: 'siwe_session',
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export default withIronSessionApiRoute(async function handler(req: VercelRequest, res: VercelResponse) {
  req.session.destroy();
  res.json({ ok: true });
}, sessionOptions);

