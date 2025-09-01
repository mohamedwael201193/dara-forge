export function buildGatewayUrl(indexerBase: string, root: string, name?: string, relPath?: string) {
  const base = indexerBase.replace(/\/$/, '');
  return relPath && relPath.length
    ? `${base}/file/${root}/${encodeURI(relPath)}`
    : `${base}/file?root=${encodeURIComponent(root)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
}

