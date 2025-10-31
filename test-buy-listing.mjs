import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
const signer = new ethers.Wallet(process.env.OG_MAINNET_PRIVATE_KEY, provider);

const abi = [
  "function getListingDetails(uint256) view returns (tuple(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price, uint256 quantity, uint256 totalSupply, bool active, uint256 createdAt), tuple(string title, string category, string researchType, uint256 quality, uint256 citations, string imageUrl, bytes32 verificationHash))",
  "function buyListing(uint256 listingId) payable",
];

const MARKETPLACE_CONTRACT = "0x57e463BF845cf328715446b9246fFa536B671A10";
const marketplace = new ethers.Contract(MARKETPLACE_CONTRACT, abi, signer);

console.log("\n🧪 Testing buy listing 9...\n");
console.log("Wallet:", await signer.getAddress());
console.log("Balance:", ethers.formatEther(await provider.getBalance(await signer.getAddress())), "OG\n");

try {
  // Get listing details
  const [listing, metadata] = await marketplace.getListingDetails(9);
  
  console.log("📋 Listing 9 Details:");
  console.log("  Title:", metadata.title);
  console.log("  Price:", ethers.formatEther(listing.price), "OG");
  console.log("  Quantity:", listing.quantity.toString());
  console.log("  Active:", listing.active);
  console.log("  Seller:", listing.seller);
  console.log("");
  
  // Try to estimate gas first
  console.log("🔍 Estimating gas...");
  try {
    const gasEstimate = await marketplace.buyListing.estimateGas(9, {
      value: listing.price,
    });
    console.log("✅ Gas estimate:", gasEstimate.toString());
  } catch (estimateError) {
    console.log("❌ Gas estimation failed:", estimateError.message);
    console.log("\nTrying to get revert reason...");
    
    // Try to call it statically to get the revert reason
    try {
      await marketplace.buyListing.staticCall(9, {
        value: listing.price,
      });
    } catch (callError) {
      console.log("Revert reason:", callError.message);
      if (callError.data) {
        console.log("Error data:", callError.data);
      }
    }
  }
  
} catch (error) {
  console.log("❌ Error:", error.message);
}
