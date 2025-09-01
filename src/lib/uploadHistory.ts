export interface UploadRecord {
  rootHash: string;
  txHash: string;
  fileName: string;
  fileSize: number;
  timestamp: number;
  explorer?: string;
}

const STORAGE_KEY = 'dara_forge_upload_history';
const MAX_RECORDS = 10;

export function saveUploadRecord(record: UploadRecord): void {
  try {
    const existing = getUploadHistory();
    const updated = [record, ...existing].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save upload record:', error);
  }
}

export function getUploadHistory(): UploadRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load upload history:', error);
    return [];
  }
}

export function clearUploadHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear upload history:', error);
  }
}

