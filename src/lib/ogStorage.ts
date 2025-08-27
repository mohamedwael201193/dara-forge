type Hex = `0x${string}`;
type PublishResult = {
  rootHash: Hex;
  txHash: Hex;
  chainTx: string;
};

function randomHex(bytes = 32): Hex {
  const arr = Array.from({ length: bytes }, () => Math.floor(Math.random() * 256));
  return (
    '0x' + arr.map(b => b.toString(16).padStart(2, '0')).join('')
  ) as Hex;
}

export function gatewayUrlForRoot(root: string) {
  return `https://gateway.0g.example/${root}`;
}

export function downloadWithProofUrl(root: string) {
  return `https://gateway.0g.example/${root}?withProof=1`;
}

// Accept extra args to satisfy calls like (file, onProgress, onDone)
export async function uploadBlobTo0GStorageViaBrowser(
  _blob: Blob,
  ..._rest: any[]
): Promise<PublishResult> {
  return {
    rootHash: randomHex(),
    txHash: randomHex(),
    chainTx: 'https://chainscan-galileo.0g.ai/tx/' + randomHex(32)
  };
}

export async function uploadFileTo0GStorageViaBrowser(
  _file: File,
  ..._rest: any[]
): Promise<PublishResult> {
  return {
    rootHash: randomHex(),
    txHash: randomHex(),
    chainTx: 'https://chainscan-galileo.0g.ai/tx/' + randomHex(32)
  };
}

export async function uploadBlobTo0GStorage(
  _blob: Blob,
  ..._rest: any[]
): Promise<PublishResult> {
  return {
    rootHash: randomHex(),
    txHash: randomHex(),
    chainTx: 'https://chainscan-galileo.0g.ai/tx/' + randomHex(32)
  };
}


