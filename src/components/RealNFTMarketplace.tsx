import confetti from "canvas-confetti";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Share2,
  ShoppingCart,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useBalance, useWalletClient } from "wagmi";

// Marketplace Contract ABI (minimal for buying)
const MARKETPLACE_ABI = [
  "function listings(uint256) view returns (uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price, uint256 quantity, uint256 totalSupply, bool active, uint256 createdAt)",
  "function researchMetadata(uint256) view returns (string title, string category, string researchType, uint256 quality, uint256 citations, string imageUrl, bytes32 verificationHash)",
  "function getActiveListings() view returns (uint256[])",
  "function buyListing(uint256 listingId) payable",
  "function getListingDetails(uint256 listingId) view returns (tuple(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price, uint256 quantity, uint256 totalSupply, bool active, uint256 createdAt) listing, tuple(string title, string category, string researchType, uint256 quality, uint256 citations, string imageUrl, bytes32 verificationHash) metadata)",
];

// Contract addresses
const MARKETPLACE_CONTRACT =
  import.meta.env.VITE_MARKETPLACE_CONTRACT ||
  "0x0000000000000000000000000000000000000000"; // Deploy first

const OG_RPC = import.meta.env.VITE_OG_RPC || "https://evmrpc.0g.ai";
const OG_EXPLORER =
  import.meta.env.VITE_OG_EXPLORER || "https://chainscan.0g.ai";

interface ListingData {
  listingId: number;
  seller: string;
  tokenId: number;
  price: string;
  priceWei: bigint;
  quantity: number;
  totalSupply: number;
  active: boolean;
  title: string;
  category: string;
  researchType: string;
  quality: number;
  citations: number;
  imageUrl: string;
}

export default function RealNFTMarketplace() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();

  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingData | null>(
    null
  );
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    listing?: ListingData;
    txHash?: string;
  }>({ show: false });

  // Confetti animation function
  const fireConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  // Share purchase on social media
  const handleShare = (listing: ListingData, txHash: string) => {
    const text = `🎉 I just purchased "${listing.title}" iNFT on DARA Forge! ${OG_EXPLORER}/tx/${txHash}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  };

  // Save purchase to localStorage
  const savePurchaseHistory = (listing: ListingData, txHash: string) => {
    const purchase = {
      listingId: listing.listingId,
      title: listing.title,
      imageUrl: listing.imageUrl,
      category: listing.category,
      price: listing.price,
      txHash,
      timestamp: Date.now(),
      buyer: address,
    };

    const history = JSON.parse(
      localStorage.getItem("nftPurchaseHistory") || "[]"
    );
    history.unshift(purchase);
    localStorage.setItem("nftPurchaseHistory", JSON.stringify(history));

    // Update user achievements
    const achievements = JSON.parse(
      localStorage.getItem("userAchievements") || "[]"
    );
    const purchaseCount = history.filter(
      (p: any) => p.buyer === address
    ).length;

    // Add achievements based on purchase count
    if (
      purchaseCount === 1 &&
      !achievements.find((a: any) => a.id === "first-nft")
    ) {
      achievements.push({
        id: "first-nft",
        title: "First iNFT Collector",
        description: "Purchased your first research iNFT",
        icon: "🎯",
        unlockedAt: Date.now(),
      });
    }

    if (
      purchaseCount === 5 &&
      !achievements.find((a: any) => a.id === "collector-5")
    ) {
      achievements.push({
        id: "collector-5",
        title: "Research Enthusiast",
        description: "Collected 5 research iNFTs",
        icon: "📚",
        unlockedAt: Date.now(),
      });
    }

    if (
      purchaseCount === 10 &&
      !achievements.find((a: any) => a.id === "collector-10")
    ) {
      achievements.push({
        id: "collector-10",
        title: "Master Collector",
        description: "Collected 10 research iNFTs",
        icon: "🏆",
        unlockedAt: Date.now(),
      });
    }

    localStorage.setItem("userAchievements", JSON.stringify(achievements));
  };

  // Fetch active listings from blockchain
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);

      if (
        MARKETPLACE_CONTRACT === "0x0000000000000000000000000000000000000000"
      ) {
        console.log("⚠️ Marketplace not deployed yet");
        setLoading(false);
        return;
      }

      const provider = new ethers.JsonRpcProvider(OG_RPC);
      const marketplace = new ethers.Contract(
        MARKETPLACE_CONTRACT,
        MARKETPLACE_ABI,
        provider
      );

      // Get all active listing IDs
      const listingIds = await marketplace.getActiveListings();
      console.log("📋 Raw listing IDs from contract:", listingIds);

      // Remove duplicates and filter out invalid IDs
      const numberIds = listingIds.map((id: unknown) => Number(id));
      const uniqueNumberArray: number[] = Array.from(new Set(numberIds));
      const uniqueIds = uniqueNumberArray.filter((id) => id > 0 && !isNaN(id));

      console.log("📋 Converted to numbers:", numberIds);
      console.log("📋 After Set deduplication:", uniqueNumberArray);
      console.log("📋 Unique listing IDs to fetch:", uniqueIds);

      // Fetch details for each listing
      const listingPromises = uniqueIds.map(async (id) => {
        try {
          const [listing, metadata] = await marketplace.getListingDetails(id);

          console.log(`🔍 Checking listing ${id}:`, {
            active: listing.active,
            quantity: Number(listing.quantity),
            title: metadata.title,
          });

          // Only include active listings with quantity > 0
          if (!listing.active || Number(listing.quantity) === 0) {
            console.log(`⏭️ Skipping inactive/sold out listing ${id}`);
            return null;
          }

          console.log(`✅ Including active listing ${id}: ${metadata.title}`);

          return {
            listingId: Number(listing.listingId),
            seller: listing.seller,
            tokenId: Number(listing.tokenId),
            price: ethers.formatEther(listing.price),
            priceWei: listing.price,
            quantity: Number(listing.quantity),
            totalSupply: Number(listing.totalSupply),
            active: listing.active,
            title: metadata.title,
            category: metadata.category,
            researchType: metadata.researchType,
            quality: Number(metadata.quality),
            citations: Number(metadata.citations),
            imageUrl: metadata.imageUrl,
          };
        } catch (error: any) {
          console.error(`❌ Error fetching listing ${id}:`, error.message);
          return null;
        }
      });

      const fetchedListings = (await Promise.all(listingPromises)).filter(
        (listing): listing is ListingData => listing !== null
      );

      // Remove duplicates by tokenId (keep the first listing for each unique NFT)
      const uniqueListings = fetchedListings.filter(
        (listing, index, self) =>
          index === self.findIndex((l) => l.tokenId === listing.tokenId)
      );

      console.log(
        "✅ Successfully loaded",
        uniqueListings.length,
        "unique NFTs (filtered",
        fetchedListings.length - uniqueListings.length,
        "duplicates)"
      );
      console.log(
        "📋 Unique NFTs:",
        uniqueListings.map((l) => ({
          listingId: l.listingId,
          tokenId: l.tokenId,
          title: l.title,
          qty: l.quantity,
        }))
      );

      setListings(uniqueListings);
    } catch (error) {
      console.error("❌ Error fetching listings:", error);
      toast.error("Failed to load marketplace listings");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listing: ListingData) => {
    if (!isConnected || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!address) return;

    try {
      setBuying(listing.listingId);

      // Check balance
      const userBalance = balance?.value || BigInt(0);
      if (userBalance < listing.priceWei) {
        toast.error(
          `Insufficient balance. You need ${
            listing.price
          } OG but have ${ethers.formatEther(userBalance)} OG`
        );
        setBuying(null);
        return;
      }

      console.log("💳 Buying NFT...");
      console.log("📦 Listing details:", {
        listingId: listing.listingId,
        title: listing.title,
        price: listing.price,
        quantity: listing.quantity,
        seller: listing.seller,
      });

      // Verify listing still exists and is active
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const marketplace = new ethers.Contract(
        MARKETPLACE_CONTRACT,
        MARKETPLACE_ABI,
        signer
      );

      // Double-check listing before buying
      try {
        const [listingData] = await marketplace.getListingDetails(
          listing.listingId
        );
        if (!listingData.active || Number(listingData.quantity) === 0) {
          toast.error("This listing is no longer available");
          setBuying(null);
          await fetchListings(); // Refresh listings
          return;
        }
      } catch (verifyError: any) {
        toast.error(
          "Failed to verify listing: " +
            (verifyError.shortMessage || verifyError.message)
        );
        setBuying(null);
        await fetchListings();
        return;
      }

      console.log("✅ Listing verified, proceeding with purchase...");

      // Call buyListing with payment
      const tx = await marketplace.buyListing(listing.listingId, {
        value: listing.priceWei,
      });

      toast.loading("Transaction sent, waiting for confirmation...", {
        id: "buy-tx",
      });

      console.log("📤 Transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      toast.success("🎉 NFT Purchased Successfully!", { id: "buy-tx" });

      console.log("✅ Transaction confirmed:", receipt.hash);
      console.log("🔗 Explorer:", `${OG_EXPLORER}/tx/${receipt.hash}`);

      // Refresh listings to show updated quantity
      await fetchListings();

      // Save purchase to history and trigger confetti
      savePurchaseHistory(listing, receipt.hash);
      fireConfetti();

      // Show success modal
      setSuccessModal({
        show: true,
        listing,
        txHash: receipt.hash,
      });
    } catch (error: any) {
      console.error("❌ Buy error:", error);

      let errorMessage = "Purchase failed";
      if (error.code === "ACTION_REJECTED") {
        errorMessage = "Transaction was rejected";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient OG balance";
      } else if (
        error.message?.includes("Cannot buy own listing") ||
        error.reason?.includes("Cannot buy own listing")
      ) {
        errorMessage =
          "❌ You can't buy your own NFT! Please use a different wallet to test the marketplace.";
      } else if (error.message) {
        // Extract the revert reason if available
        const revertMatch = error.message.match(/reverted: "([^"]+)"/);
        errorMessage = revertMatch ? revertMatch[1] : error.message;
      }

      toast.error(errorMessage);
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No listings available</h3>
        <p className="text-gray-400 mb-6">
          Be the first to list your research iNFT!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-green-500 max-w-lg w-full p-8 shadow-2xl"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-green-500 rounded-full p-6">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Purchase Successful!
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Your NFT has been transferred to your wallet
            </p>

            {/* NFT Details */}
            {successModal.listing && (
              <div className="bg-black/30 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="flex items-start gap-4">
                  <img
                    src={successModal.listing.imageUrl}
                    alt={successModal.listing.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {successModal.listing.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {successModal.listing.category}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-xl">
                        {successModal.listing.price} OG
                      </span>
                      <span className="text-gray-500 text-sm">paid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Hash */}
            {successModal.txHash && (
              <div className="bg-black/30 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Transaction</span>
                  <a
                    href={`${OG_EXPLORER}/tx/${successModal.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
                  >
                    View on Explorer
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <code className="text-xs text-gray-500 break-all block">
                  {successModal.txHash}
                </code>
              </div>
            )}

            {/* Info Message */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-300 text-center">
                🎉 The iNFT is now in your wallet and includes full research
                ownership rights!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => {
                  if (successModal.listing && successModal.txHash) {
                    handleShare(successModal.listing, successModal.txHash);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => {
                  setSuccessModal({ show: false });
                  navigate("/profile");
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                My NFTs
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSuccessModal({ show: false })}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105"
            >
              Awesome! Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Live Marketplace
            <span className="text-sm font-normal text-green-500 ml-2">
              • {listings.length} iNFT{listings.length !== 1 ? "s" : ""}{" "}
              Available
            </span>
          </h2>
          <p className="text-gray-400 mt-1">
            Purchase research iNFTs with real OG tokens
          </p>
        </div>

        {isConnected && balance && (
          <div className="text-right">
            <p className="text-sm text-gray-400">Your Balance</p>
            <p className="text-lg font-semibold text-green-400">
              {parseFloat(ethers.formatEther(balance.value)).toFixed(4)} OG
            </p>
          </div>
        )}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <motion.div
            key={listing.listingId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500 transition-all"
          >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/80 px-3 py-1 rounded-full text-xs font-semibold">
                {listing.category}
              </div>
              <div className="absolute top-2 left-2 bg-green-500/90 px-3 py-1 rounded-full text-xs font-bold">
                {listing.quantity} / {listing.totalSupply} Available
              </div>
              {listing.seller.toLowerCase() === address?.toLowerCase() && (
                <div className="absolute bottom-2 left-2 bg-yellow-500/90 px-3 py-1 rounded-full text-xs font-bold text-black flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Your Listing
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-lg line-clamp-2">
                {listing.title}
              </h3>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Quality</span>
                <span className="font-semibold text-purple-400">
                  {listing.quality}/100
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Citations</span>
                <span className="font-semibold">{listing.citations}</span>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">Price</span>
                  <span className="text-2xl font-bold text-green-400">
                    {listing.price} OG
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(listing)}
                  disabled={
                    buying === listing.listingId ||
                    !isConnected ||
                    listing.seller.toLowerCase() === address?.toLowerCase()
                  }
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {buying === listing.listingId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Purchasing...
                    </>
                  ) : listing.seller.toLowerCase() ===
                    address?.toLowerCase() ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Your Listing
                    </>
                  ) : !isConnected ? (
                    <>Connect Wallet</>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>

              <a
                href={`${OG_EXPLORER}/address/${listing.seller}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400"
              >
                Seller: {listing.seller.slice(0, 6)}...
                {listing.seller.slice(-4)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      {!isConnected && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Wallet Not Connected</h4>
            <p className="text-sm text-gray-300">
              Connect your wallet to purchase research iNFTs. All transactions
              use real OG tokens on 0G Mainnet.
            </p>
          </div>
        </div>
      )}

      {/* Success Info */}
      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1">Real Blockchain Transactions</h4>
          <p className="text-sm text-gray-300">
            • Each purchase is a real transaction on 0G Mainnet
            <br />
            • NFTs are transferred directly to your wallet
            <br />
            • Quantity decreases automatically when sold
            <br />• 2.5% platform fee + 5% creator royalty
          </p>
        </div>
      </div>
    </div>
  );
}
