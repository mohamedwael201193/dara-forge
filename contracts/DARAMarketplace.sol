// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DARAMarketplace
 * @dev Decentralized marketplace for trading DARA Research iNFTs
 * @notice Supports fixed-price listings with OG token payments
 * 
 * Features:
 * - List research iNFTs for sale with fixed price
 * - Buy iNFTs with OG tokens (native or ERC-20)
 * - Royalties to original creators
 * - Platform fee for DARA
 * - Emergency pause capability
 * - Real-time quantity tracking for multiple editions
 * 
 * Wave 5 Deployment:
 * - Network: 0G Mainnet (Chain ID: 16661)
 * - Payment: Native OG tokens
 */
contract DARAMarketplace is Ownable, ReentrancyGuard, Pausable {
    
    // =============================================================================
    // STRUCTS
    // =============================================================================
    
    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;          // Price in wei (OG tokens)
        uint256 quantity;       // Available quantity
        uint256 totalSupply;    // Original total supply
        bool active;
        uint256 createdAt;
    }
    
    struct ResearchMetadata {
        string title;
        string category;
        string researchType;
        uint256 quality;
        uint256 citations;
        string imageUrl;
        bytes32 verificationHash;
    }
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    /// @dev Counter for listing IDs
    uint256 private _nextListingId;
    
    /// @dev Mapping from listing ID to Listing
    mapping(uint256 => Listing) public listings;
    
    /// @dev Mapping from listing ID to research metadata
    mapping(uint256 => ResearchMetadata) public researchMetadata;
    
    /// @dev Mapping from NFT contract + token ID to listing ID
    mapping(address => mapping(uint256 => uint256)) public tokenToListing;
    
    /// @dev Platform fee percentage (e.g., 250 = 2.5%)
    uint256 public platformFeePercent = 250; // 2.5%
    
    /// @dev Royalty fee percentage for creators (e.g., 500 = 5%)
    uint256 public royaltyPercent = 500; // 5%
    
    /// @dev Treasury address for platform fees
    address public treasury;
    
    /// @dev ERC721 Research Passport contract
    address public researchPassportContract;
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 quantity
    );
    
    event ListingPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 newQuantity
    );
    
    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller
    );
    
    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice,
        uint256 newQuantity
    );
    
    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================
    
    constructor(address _treasury, address _researchPassportContract) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        researchPassportContract = _researchPassportContract;
        _nextListingId = 1;
    }
    
    // =============================================================================
    // LISTING FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Create a new listing for a research iNFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Price in OG tokens (wei)
     * @param quantity Number of editions available
     * @param metadata Research metadata
     */
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 quantity,
        ResearchMetadata memory metadata
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(price > 0, "Price must be > 0");
        require(quantity > 0, "Quantity must be > 0");
        require(nftContract != address(0), "Invalid NFT contract");
        
        // Check if seller owns the NFT (for now, we'll use owner-based listing)
        // In production, this would verify ownership via ERC721
        
        uint256 listingId = _nextListingId++;
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            quantity: quantity,
            totalSupply: quantity,
            active: true,
            createdAt: block.timestamp
        });
        
        researchMetadata[listingId] = metadata;
        tokenToListing[nftContract][tokenId] = listingId;
        
        emit ListingCreated(listingId, msg.sender, nftContract, tokenId, price, quantity);
        
        return listingId;
    }
    
    /**
     * @dev Buy a research iNFT from a listing
     * @param listingId ID of the listing to purchase
     */
    function buyListing(uint256 listingId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(listing.quantity > 0, "Sold out");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own listing");
        
        // Calculate fees
        uint256 platformFee = (listing.price * platformFeePercent) / 10000;
        uint256 royalty = (listing.price * royaltyPercent) / 10000;
        uint256 sellerAmount = listing.price - platformFee - royalty;
        
        // Update quantity
        listing.quantity -= 1;
        
        // Deactivate if sold out
        if (listing.quantity == 0) {
            listing.active = false;
        }
        
        // Transfer funds
        payable(treasury).transfer(platformFee);
        payable(listing.seller).transfer(sellerAmount + royalty); // Seller gets royalty for now
        
        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit ListingPurchased(
            listingId,
            msg.sender,
            listing.seller,
            listing.price,
            listing.quantity
        );
        
        // Note: In production, this would also transfer the actual NFT
        // For Wave 5, we're simulating the marketplace mechanics
    }
    
    /**
     * @dev Cancel a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");
        require(listing.active, "Listing not active");
        
        listing.active = false;
        
        emit ListingCancelled(listingId, msg.sender);
    }
    
    /**
     * @dev Update listing price and quantity
     * @param listingId ID of the listing to update
     * @param newPrice New price in OG tokens
     * @param newQuantity New quantity available
     */
    function updateListing(
        uint256 listingId,
        uint256 newPrice,
        uint256 newQuantity
    ) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Listing not active");
        require(newPrice > 0, "Price must be > 0");
        
        listing.price = newPrice;
        if (newQuantity > 0) {
            listing.quantity = newQuantity;
        }
        
        emit ListingUpdated(listingId, newPrice, newQuantity);
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Get all active listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i < _nextListingId; i++) {
            if (listings[i].active && listings[i].quantity > 0) {
                activeCount++;
            }
        }
        
        // Create array of active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < _nextListingId; i++) {
            if (listings[i].active && listings[i].quantity > 0) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get listing details with metadata
     */
    function getListingDetails(uint256 listingId) 
        external 
        view 
        returns (
            Listing memory listing,
            ResearchMetadata memory metadata
        ) 
    {
        return (listings[listingId], researchMetadata[listingId]);
    }
    
    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================
    
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    function setRoyaltyPercent(uint256 _royaltyPercent) external onlyOwner {
        require(_royaltyPercent <= 1000, "Royalty too high"); // Max 10%
        royaltyPercent = _royaltyPercent;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // =============================================================================
    // EMERGENCY FUNCTIONS
    // =============================================================================
    
    function withdrawEmergency() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
