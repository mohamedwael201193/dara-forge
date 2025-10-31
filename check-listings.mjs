import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");

const abi = [
  "function getListingDetails(uint256) view returns (tuple(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price, uint256 quantity, uint256 totalSupply, bool active, uint256 createdAt), tuple(string title, string category, string researchType, uint256 quality, uint256 citations, string imageUrl, bytes32 verificationHash))",
];

const marketplace = new ethers.Contract(
  "0x57e463BF845cf328715446b9246fFa536B671A10",
  abi,
  provider
);

console.log("\n🔍 Checking all marketplace listings...\n");

for (let i = 1; i <= 9; i++) {
  try {
    const [listing, metadata] = await marketplace.getListingDetails(i);
    console.log(`Listing ${i}:`);
    console.log(`  Title: ${metadata.title}`);
    console.log(`  Active: ${listing.active}`);
    console.log(`  Quantity: ${listing.quantity.toString()}`);
    console.log(`  Price: ${ethers.formatEther(listing.price)} OG`);
    console.log(`  Token ID: ${listing.tokenId.toString()}`);
    console.log("");
  } catch (e) {
    console.log(`Listing ${i}: ❌ ERROR - ${e.message}\n`);
  }
}
