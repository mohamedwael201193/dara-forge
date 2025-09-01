export const COMPUTE_CONTRACTS = {
  ledger: "0x4808e4CC6a2Ba764778D0062227E1A7758276989",
  serving: "0x1CF262cfA68D98Ce04cF1247E9f4B6d32e206bf4"
};

export const LEDGER_ABI = [
  "function deposit(address account) external payable",
  "function getAccount(address account) external view returns (uint256 balance, uint256 locked)",
  "function withdraw(address account, uint256 amount) external"
];

export const SERVING_ABI = [
  "function getService(address provider) external view returns (tuple(string name, string serviceType, string url, string model, uint256 inputPrice, uint256 outputPrice, uint256 updatedAt))",
  "function getAllServices() external view returns (address[] providers)",
  "function settleFees(address provider, uint256 addedFee) external"
];

