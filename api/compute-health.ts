import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBroker, listServices } from '../src/server/compute/broker.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const broker = await getBroker();
    const account = await broker.ledger.getLedger();
    const services = await listServices();
    
    return res.status(200).json({
      status: 'healthy',
      sdk: '0G Compute SDK loaded',
      account: {
        address: account.address,
        balance: account.totalBalance.toString()
      },
      services: {
        count: services.length,
        providers: services.map((s: any) => ({
          provider: s.provider,
          model: s.model
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}