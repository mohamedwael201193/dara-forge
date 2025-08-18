export const INDEXER =
  (import.meta.env.VITE_OG_INDEXER || 'https://indexer-storage-testnet-turbo.0g.ai').replace(/\/$/, '');

export function gatewayUrlForRoot(root: string, name?: string) {
  const qs = `root=${encodeURIComponent(root)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
  return `/api/og-file?${qs}`; // ← proxy that waits then streams
}

export type UploadResponse = {
  ok: boolean;
  filename: string;
  mimetype: string;
  rootHash: string;
  alreadyStored?: boolean;
  storageTx?: any;
  chainTx?: string;
  txHash?: string;
  downloadUrl?: string;
  gatewayReady?: boolean;
  error?: string;
};

export function uploadBlobTo0GStorage(
  blob: Blob,
  filename: string,
  onProgress?: (percent0to100: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', blob, filename || 'upload.bin');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/og-upload');

    xhr.upload.onprogress = (evt) => {
      if (onProgress && evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = () => {
      const text = xhr.responseText || '';
      try {
        const json = JSON.parse(text || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && json.ok) resolve(json);
        else reject(new Error(json.error || `HTTP ${xhr.status}`));
      } catch {
        const snippet = text.slice(0, 200).replace(/\s+/g, ' ');
        reject(new Error(`Server error (${xhr.status}). ${snippet || 'No response body.'}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fd);
  });
}

