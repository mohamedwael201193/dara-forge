# Clear Wallet Connection Cache

## Problem

Even after fixing network configuration, MetaMask still asks for "Galileo (Testnet)" approval because of cached permissions.

## Solution: Clear Browser Storage

### Method 1: Clear Site Data (Recommended)

1. Open DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Find "Local Storage" in left sidebar
4. Click on `http://localhost:5173`
5. Right-click → "Clear"
6. Find "Session Storage"
7. Click on `http://localhost:5173`
8. Right-click → "Clear"
9. Find "IndexedDB"
10. Expand it and delete any Reown/WalletConnect databases
11. Close DevTools
12. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Method 2: Incognito/Private Window

1. Open new Incognito/Private window
2. Go to http://localhost:5173
3. Connect wallet (should show mainnet)

### Method 3: Clear All Site Data via Browser Settings

**Chrome:**

1. F12 → DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Or:**

1. Settings → Privacy and Security → Clear browsing data
2. Select "Cookies and other site data" and "Cached images and files"
3. Time range: "Last hour"
4. Clear data

### Method 4: Reset MetaMask Permissions

1. Open MetaMask
2. Click three dots (⋮) → Settings
3. Advanced → Clear activity and nonce data
4. Connected sites → localhost:5173 → Disconnect
5. Close MetaMask
6. Refresh page
7. Connect again

## After Clearing Cache

1. **Refresh page** (Ctrl+Shift+R)
2. Click "Connect Wallet"
3. Select wallet (MetaMask)
4. **Should now show**: "Use your enabled networks - Requested now for 0G Mainnet"
5. **NOT**: "Requested now for Galileo (Testnet)"

## Verify It's Fixed

Open browser console (F12) and run:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Then reconnect wallet and check the permission popup.

## If Still Shows Testnet

The issue might be that MetaMask has testnet as the active network. Switch manually:

1. Open MetaMask
2. Click network dropdown at top
3. Look for "0G Mainnet"
4. If you don't see it, add it manually:
   - Network Name: 0G Mainnet
   - RPC URL: https://evmrpc.0g.ai
   - Chain ID: 16661
   - Currency Symbol: 0G
   - Block Explorer: https://chainscan.0g.ai
5. Select "0G Mainnet"
6. Refresh dApp page
7. Connect wallet

## Prevention

After connecting successfully to mainnet:

- Don't manually switch to testnet in MetaMask while using the dApp
- If you need testnet for other apps, use a different browser profile

---

**Quick Fix Command** (Paste in browser console):

```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();
indexedDB
  .databases()
  .then((dbs) => dbs.forEach((db) => indexedDB.deleteDatabase(db.name)));
console.log("Cleared! Now refresh the page (Ctrl+Shift+R)");
```
