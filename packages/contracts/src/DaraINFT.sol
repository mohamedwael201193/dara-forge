// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC7857.sol";

/**
 * @title DaraINFT - DARA Research Intelligent NFT
 * @dev Extends ERC7857 with research-specific features
 * 
 * Features:
 * - Passport URI for reproducibility documentation
 * - Research metadata and provenance tracking  
 * - Integration with 0G ecosystem (Storage, DA, Chain, Compute)
 * - Royalty split between researcher and platform
 */
contract DaraINFT is ERC7857 {
    
    struct ResearchData {
        string passportUri;           // Reproducibility passport on 0G Storage
        string datasetMerkleRoot;     // Original dataset root
        string daBlob;               // DA blob hash for availability
        string chainAnchor;          // Chain anchor transaction
        address researcher;          // Original researcher
        uint256 createdAt;           // Creation timestamp
        bytes32 researchHash;        // Hash of research methodology
    }
    
    // Research-specific storage
    mapping(uint256 => ResearchData) private _researchData;
    mapping(address => uint256[]) private _researcherTokens;
    
    // Platform configuration
    address public platformAddress;
    uint256 public platformRoyalty = 100; // 1% platform fee
    uint256 public researcherRoyalty = 150; // 1.5% to researcher
    
    // Events
    event IntelligenceMinted(
        uint256 indexed tokenId,
        address indexed researcher,
        string intelligenceUri,
        string passportUri,
        string datasetRoot
    );
    
    event PassportUpdated(
        uint256 indexed tokenId,
        string newPassportUri,
        uint256 version
    );
    
    event ResearchVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bool storageVerified,
        bool daVerified,
        bool chainVerified,
        bool computeVerified
    );

    constructor(
        string memory name,
        string memory symbol,
        address _platformAddress
    ) ERC7857(name, symbol, _platformAddress) {
        platformAddress = _platformAddress;
    }
    
    /**
     * @dev Mint research iNFT with full metadata
     */
    function mintIntelligence(
        address to,
        string memory intelligenceUri,
        string memory passportUri,
        bytes32 sealedKey,
        string memory datasetRoot,
        string memory daBlob,
        string memory chainAnchor,
        bytes32 researchHash
    ) public returns (uint256) {
        // Create metadata URI from passport
        string memory metadataUri = _buildMetadataUri(passportUri, datasetRoot);
        
        // Mint the base iNFT
        uint256 tokenId = super.mintIntelligence(
            to,
            intelligenceUri,
            metadataUri,
            sealedKey,
            researchHash, // Use research hash as content hash
            true // Research iNFTs require oracle verification
        );
        
        // Store research-specific data
        _researchData[tokenId] = ResearchData({
            passportUri: passportUri,
            datasetMerkleRoot: datasetRoot,
            daBlob: daBlob,
            chainAnchor: chainAnchor,
            researcher: to,
            createdAt: block.timestamp,
            researchHash: researchHash
        });
        
        // Track researcher's tokens
        _researcherTokens[to].push(tokenId);
        
        emit IntelligenceMinted(tokenId, to, intelligenceUri, passportUri, datasetRoot);
        
        return tokenId;
    }
    
    /**
     * @dev Update passport URI (for reproducibility updates)
     */
    function updatePassport(
        uint256 tokenId,
        string memory newPassportUri,
        bytes32 newResearchHash
    ) public {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        require(_exists(tokenId), "Token does not exist");
        
        _researchData[tokenId].passportUri = newPassportUri;
        _researchData[tokenId].researchHash = newResearchHash;
        
        // Update metadata URI
        string memory newMetadataUri = _buildMetadataUri(
            newPassportUri,
            _researchData[tokenId].datasetMerkleRoot
        );
        _setTokenURI(tokenId, newMetadataUri);
        
        // Get current intelligence version
        (, , uint256 version, ) = getIntelligenceData(tokenId);
        
        emit PassportUpdated(tokenId, newPassportUri, version);
    }
    
    /**
     * @dev Get research URIs and metadata
     */
    function getUris(uint256 tokenId) public view returns (
        string memory intelligenceUri,
        string memory passportUri,
        string memory metadataUri
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        // Get intelligence URI (requires authorization)
        (intelligenceUri, , , ) = getIntelligenceData(tokenId);
        
        ResearchData storage research = _researchData[tokenId];
        passportUri = research.passportUri;
        metadataUri = tokenURI(tokenId);
    }
    
    /**
     * @dev Get full research data (public for verification)
     */
    function getResearchData(uint256 tokenId) public view returns (
        string memory passportUri,
        string memory datasetRoot,
        string memory daBlob,
        string memory chainAnchor,
        address researcher,
        uint256 createdAt,
        bytes32 researchHash
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        ResearchData storage research = _researchData[tokenId];
        return (
            research.passportUri,
            research.datasetMerkleRoot,
            research.daBlob,
            research.chainAnchor,
            research.researcher,
            research.createdAt,
            research.researchHash
        );
    }
    
    /**
     * @dev Get tokens owned by researcher
     */
    function getResearcherTokens(address researcher) public view returns (uint256[] memory) {
        return _researcherTokens[researcher];
    }
    
    /**
     * @dev Verify research components (callable by oracles)
     */
    function verifyResearch(
        uint256 tokenId,
        bool storageVerified,
        bool daVerified,
        bool chainVerified,
        bool computeVerified
    ) public {
        require(trustedOracles[msg.sender] || msg.sender == oracle, "Not authorized oracle");
        require(_exists(tokenId), "Token does not exist");
        
        emit ResearchVerified(
            tokenId,
            msg.sender,
            storageVerified,
            daVerified,
            chainVerified,
            computeVerified
        );
    }
    
    /**
     * @dev Authorize compute usage with research context
     */
    function authorizeComputeUsage(
        uint256 tokenId,
        address computeProvider,
        uint256 duration
    ) public {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        
        // Permission flags: 1=read intelligence, 2=execute compute, 4=update results
        uint256 computePermissions = 1 | 2; // Read and execute
        
        super.authorizeUsage(tokenId, computeProvider, computePermissions, duration);
    }
    
    /**
     * @dev Set platform configuration
     */
    function setPlatformConfig(
        address _platformAddress,
        uint256 _platformRoyalty,
        uint256 _researcherRoyalty
    ) public onlyOwner {
        require(_platformRoyalty + _researcherRoyalty <= 1000, "Total royalty too high"); // Max 10%
        
        platformAddress = _platformAddress;
        platformRoyalty = _platformRoyalty;
        researcherRoyalty = _researcherRoyalty;
    }
    
    /**
     * @dev Enhanced royalty info with researcher split
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) public view override returns (address, uint256) {
        if (!_exists(tokenId)) {
            return (platformAddress, 0);
        }
        
        ResearchData storage research = _researchData[tokenId];
        uint256 totalRoyalty = platformRoyalty + researcherRoyalty;
        uint256 totalAmount = (salePrice * totalRoyalty) / 10000;
        
        // In a full implementation, this would handle splits
        // For now, return the researcher as primary recipient
        return (research.researcher, totalAmount);
    }
    
    /**
     * @dev Build metadata URI from passport and dataset
     */
    function _buildMetadataUri(
        string memory passportUri,
        string memory datasetRoot
    ) internal pure returns (string memory) {
        // In practice, this would construct a proper metadata JSON
        // For now, return the passport URI as metadata
        return passportUri;
    }
    
    /**
     * @dev Override transfer to maintain researcher tracking
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        super.transferFrom(from, to, tokenId);
        
        // Update researcher token tracking
        _removeFromResearcherTokens(from, tokenId);
        _researcherTokens[to].push(tokenId);
    }
    
    /**
     * @dev Remove token from researcher's list
     */
    function _removeFromResearcherTokens(address researcher, uint256 tokenId) internal {
        uint256[] storage tokens = _researcherTokens[researcher];
        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get contract metadata for OpenSea, etc.
     */
    function contractURI() public pure returns (string memory) {
        return "https://dara-forge.vercel.app/api/contract-metadata";
    }
}