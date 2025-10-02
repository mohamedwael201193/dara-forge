export const DARA_ANCHOR_ABI = [
  "function anchor(bytes32 root, bytes32 manifestHash, bytes32 projectId) external",
  "event DatasetAnchored(uint256 indexed id, bytes32 indexed root, bytes32 indexed manifestHash, bytes32 projectId, address uploader, uint256 timestamp)"
] as const;