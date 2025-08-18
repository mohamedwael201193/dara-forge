export const INDEXER =
(import.meta.env.VITE_OG_INDEXER || 'https://indexer-storage-testnet-turbo.0g.ai').replace(/\/$/, '');
export function gatewayUrlForRoot(root: string, name?: string) {
return `${INDEXER}/file?root=${encodeURIComponent(root)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
}
export type UploadResponse = {
ok: boolean;
filename: string;
mimetype: string;
rootHash: string;
alreadyStored?: boolean;
storageTx?: any;
chainTx?: string;
downloadUrl?: string;
error?: string;
};
export function uploadBlobTo0GStorage(
blob: Blob,
filename: string,
onProgress?: (percent: number) => void
): Promise<UploadResponse> {
return new Promise((resolve, reject) => {
const fd = new FormData();
fd.append('file', blob, filename || 'upload.bin');
const xhr = new XMLHttpRequest();
xhr.open('POST', '/api/og-upload');

xhr.upload.onprogress = (evt) => {
  if (onProgress && evt.lengthComputable) onProgress(Math.round((evt.loaded / evt.total) * 100));
};

xhr.onload = () => {
  try {
    const json = JSON.parse(xhr.responseText || '{}');
    if (xhr.status >= 200 && xhr.status < 300 && json.ok) resolve(json);
    else reject(new Error(json.error || `HTTP ${xhr.status}`));
  } catch (e: any) {
    reject(e);
  }
};

xhr.onerror = () => reject(new Error('Network error during upload'));
xhr.send(fd); // don’t set Content-Type manually

});
}


