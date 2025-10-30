# Manual Network Setup - 0G Mainnet

## Issue: "Network Not Found" or Balance Not Showing

When you see "Network Not Found" in the wallet modal, it means MetaMask doesn't have the 0G Mainnet added yet.

## Solution 1: Use the Auto-Add Button (Easiest)

After you restart the dev server and refresh the page:

1. **Connect your wallet**
2. You'll see a **red alert** at the top saying "Wrong Network Detected"
3. Click the button: **"Switch to 0G Mainnet"**
4. MetaMask will pop up asking to add the network → Click **"Approve"**
5. MetaMask will then ask to switch to it → Click **"Switch network"**
6. Page will reload
7. ✅ Done! Balance should now show correctly

## Solution 2: Add Manually in MetaMask

If the button doesn't work, add the network manually:

### Step-by-Step:

1. **Open MetaMask**
2. Click the **network dropdown** at the top (shows current network)
3. Scroll down and click **"Add network"**
4. Click **"Add a network manually"**
5. Enter these details:

```
Network Name: 0G Mainnet
RPC URL: https://evmrpc.0g.ai
Chain ID: 16661
Currency Symbol: 0G
Block Explorer URL: https://chainscan.0g.ai
```

6. Click **"Save"**
7. MetaMask will automatically switch to 0G Mainnet
8. **Refresh the dApp page**
9. Connect wallet again
10. ✅ Balance should show correctly!

## Solution 3: Using Browser Console

Open DevTools (F12) and paste this in Console:

```javascript
await window.ethereum.request({
  method: "wallet_addEthereumChain",
  params: [
    {
      chainId: "0x4115", // 16661 in hex
      chainName: "0G Mainnet",
      nativeCurrency: {
        name: "0G",
        symbol: "0G",
        decimals: 18,
      },
      rpcUrls: ["https://evmrpc.0g.ai"],
      blockExplorerUrls: ["https://chainscan.0g.ai"],
    },
  ],
});
```

Press Enter. MetaMask will prompt to add the network.

## Verify It's Working

After adding the network, you should see:

✅ **In Wallet Modal:**

- Network name: "0G Mainnet" (or shows `0x1d...851B`)
- Balance: `1.565 OG` (or your actual balance)
- No more "Network Not Found" error

✅ **In MetaMask:**

- Top of MetaMask shows: "0G Mainnet"
- Balance shows your OG amount

✅ **Network Checker Alert:**

- Green alert: "Connected to 0G Mainnet"
- Shows "Chain ID: 16661 - You're on the correct network"

## Troubleshooting

### Still showing "Network Not Found"?

1. Make sure you're on 0G Mainnet in MetaMask (check the dropdown at top)
2. Disconnect wallet in the dApp
3. Clear cache: `localStorage.clear(); location.reload();` in console
4. Connect again

### Balance shows "0.00 OG"?

1. Check you're using the correct wallet address
2. Verify on explorer: https://chainscan.0g.ai/address/YOUR_ADDRESS
3. If explorer shows balance but dApp doesn't, try:
   - Disconnect and reconnect wallet
   - Hard refresh: Ctrl+Shift+R

### Wrong wallet address showing?

The wallet in screenshot shows `0x1dF8...851B` which is correct for your mainnet wallet with 1.567 OG.
If you see a different address, you might have multiple accounts in MetaMask - switch to the correct one.

## After Network is Added

Once 0G Mainnet is added to MetaMask:

1. **For Storage/Anchor/iNFT**: Stay on 0G Mainnet
2. **For Compute/DA** (future): You can manually switch to testnet if needed
3. The dApp will auto-prompt you to switch networks when needed

## Network Details Reference

**0G Mainnet (Primary - Chain ID 16661)**

- For: Storage, Chain Anchoring, iNFT Minting
- RPC: https://evmrpc.0g.ai
- Explorer: https://chainscan.0g.ai
- Your balance: 1.567 OG

**0G Testnet Galileo (Secondary - Chain ID 16602)**

- For: Compute, DA Layer
- RPC: https://evmrpc-testnet.0g.ai
- Explorer: https://chainscan-galileo.0g.ai
- Only needed for compute operations

---

**Current Status**: Network configuration is correct, just needs to be added to MetaMask once. After adding, everything will work smoothly!
