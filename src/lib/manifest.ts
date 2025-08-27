export type DatasetManifest = {
  title: string;
  description: string;
  hash: string;
  timestamp: number;
};

export function createManifest(data: Partial<DatasetManifest>): DatasetManifest {
  return {
    title: data.title ?? 'Untitled Dataset',
    description: data.description ?? '',
    hash: data.hash ?? '',
    timestamp: Date.now()
  };
}

export function validateManifest(m: DatasetManifest) {
  return Boolean(m.title && m.hash);
}


