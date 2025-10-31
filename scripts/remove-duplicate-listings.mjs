import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
const signer = new ethers.Wallet(process.env.OG_MAINNET_PRIVATE_KEY, provider);

const abi = [
  "function cancelListing(uint256 listingId) external",
  "function getListingDetails(uint256) view returns (tuple(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price, uint256 quantity, uint256 totalSupply, bool active, uint256 createdAt), tuple(string title, string category, string researchType, uint256 quality, uint256 citations, string imageUrl, bytes32 verificationHash))",
];

const MARKETPLACE_CONTRACT = "0x57e463BF845cf328715446b9246fFa536B671A10";
const marketplace = new ethers.Contract(MARKETPLACE_CONTRACT, abi, signer);

console.log("\n🗑️  Deactivating duplicate marketplace listings...\n");
console.log("Wallet:", await signer.getAddress());
console.log("");

// Listings 5, 6, 7, 8 are duplicates of 1, 2, 3, 4
const duplicateListings = [5, 6, 7, 8];

for (const listingId of duplicateListings) {
  try {
    const [listing, metadata] = await marketplace.getListingDetails(listingId);
    
    console.log(`📋 Listing ${listingId}: ${metadata.title}`);
    console.log(`   Token ID: ${listing.tokenId.toString()}`);
    console.log(`   Active: ${listing.active}`);
    
    if (!listing.active) {
      console.log(`   ⏭️  Already inactive, skipping\n`);
      continue;
    }
    
    console.log(`   🔄 Canceling...`);
    const tx = await marketplace.cancelListing(listingId);
    console.log(`   📤 TX: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Canceled in block ${receipt.blockNumber}\n`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

console.log("✅ Done! Duplicate listings have been deactivated.");
console.log("Now only listings 1-4 and 9 will be active.\n");
