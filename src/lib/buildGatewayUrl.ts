export function buildGatewayUrl(indexerBase: string, root: string, name?: string, relPath?: string) {
  // Remove trailing slash from indexer base URL
  const cleanIndexerBase = indexerBase.replace(/\/$/, '');
  
  // Build the base gateway URL
  let url = `${cleanIndexerBase}/download/${root}`;
  
  // Add name parameter if provided
  if (name) {
    url += `/${encodeURIComponent(name)}`;
  }
  
  // Add relative path if provided
  if (relPath) {
    url += `/${encodeURIComponent(relPath)}`;
  }
  
  return url;
}