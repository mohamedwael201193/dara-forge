import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SiweMessage } from 'siwe';
import { withIronSessionApiRoute } from 'iron-session/next';

declare module 'iron-session' {
  interface IronSessionData {
    nonce?: string;
    siwe?: SiweMessage;
    // Add other session data here if needed
  }
}

const sessionOptions = {
  cookieName: 'siwe_session',
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export default withIronSessionApiRoute(async function handler(req: VercelRequest, res: VercelResponse) {
  const { message, signature } = req.body;

  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({
      signature,
      nonce: req.session.nonce,
    });

    req.session.siwe = fields;
    await req.session.save();
    res.json({ ok: true });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ ok: false, message: error.message });
  }
}, sessionOptions);

