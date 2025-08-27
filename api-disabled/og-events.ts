import { ethers } from 'ethers';
const ABI = [
{ anonymous:false, inputs:[
{ indexed:true,  internalType:'uint256', name:'logId', type:'uint256' },
{ indexed:true,  internalType:'address', name:'creator', type:'address' },
{ indexed:false, internalType:'string',  name:'fileId', type:'string' },
{ indexed:false, internalType:'uint256', name:'timestamp', type:'uint256' }
],
name:'LogCreated', type:'event'
}
];
export default async function handler(req: any, res: any) {
try {
const OG_RPC_URL    = process.env.OG_RPC_URL!;
const DARA_CONTRACT = process.env.DARA_CONTRACT!;
const provider      = new ethers.JsonRpcProvider(OG_RPC_URL);
const iface  = new ethers.Interface(ABI);
const topic0 = iface.getEvent('LogCreated').topicHash;

const latest    = await provider.getBlockNumber();
const fromBlock = Math.max(0, latest - 20_000); // last ~20k blocks for demo

const logs = await provider.getLogs({
  address: DARA_CONTRACT,
  topics: [topic0],
  fromBlock,
  toBlock: latest
});

const events = logs.map((l) => {
  const parsed = iface.parseLog(l);
  const [logId, creator, fileId, timestamp] = parsed.args as any[];
  return {
    txHash: l.transactionHash,
    blockNumber: l.blockNumber,
    logId: logId.toString(),
    creator,
    fileId,
    timestamp: Number(timestamp)
  };
});

res.status(200).json({ ok: true, events });

} catch (e: any) {
res.status(500).json({ ok: false, error: String(e?.message || e) });
}
}


