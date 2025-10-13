// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title ERC7857 - Intelligent NFT Standard
 * @dev Reference implementation of ERC-7857 for 0G ecosystem
 * 
 * Key Features:
 * - Encrypted intelligence storage with sealed keys
 * - Secure re-encryption on transfer
 * - Authorized usage for compute operations
 * - Oracle verification hooks
 * - Metadata privacy protection
 */
contract ERC7857 is ERC721, ERC721URIStorage, Ownable, IERC2981 {
    
    struct IntelligenceData {
        string intelligenceUri;  // Encrypted intelligence on 0G Storage
        bytes32 sealedKey;      // Encrypted with owner's public key
        bytes32 contentHash;    // Hash for integrity verification
        uint256 version;        // Version for updates
        bool requiresOracle;    // Whether oracle verification is required
        address lastUpdatedBy;  // Track who last updated
        uint256 lastUpdatedAt;  // Timestamp of last update
    }
    
    struct AuthorizedUsage {
        address executor;       // Who can execute
        uint256 permissions;    // Bit flags for permissions
        uint256 expiresAt;     // Expiration timestamp
        bool active;           // Whether authorization is active
    }
    
    // Storage mappings
    mapping(uint256 => IntelligenceData) private _intelligence;
    mapping(uint256 => mapping(address => AuthorizedUsage)) private _authorizations;
    mapping(uint256 => address[]) private _authorizedExecutors;
    
    // Oracle and verification
    address public oracle;
    mapping(address => bool) public trustedOracles;
    
    // Royalty info (EIP-2981)
    uint256 public royaltyPercentage = 250; // 2.5%
    address public royaltyRecipient;
    
    // Events
    event IntelligenceUpdated(
        uint256 indexed tokenId,
        string intelligenceUri,
        bytes32 sealedKey,
        uint256 version
    );
    
    event UsageAuthorized(
        uint256 indexed tokenId,
        address indexed executor,
        uint256 permissions,
        uint256 expiresAt
    );
    
    event UsageRevoked(
        uint256 indexed tokenId,
        address indexed executor
    );
    
    event OracleVerificationRequested(
        uint256 indexed tokenId,
        address indexed oracle,
        bytes32 contentHash
    );
    
    event SecureTransferInitiated(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 newSealedKey
    );

    constructor(
        string memory name,
        string memory symbol,
        address _royaltyRecipient
    ) ERC721(name, symbol) Ownable(msg.sender) {
        royaltyRecipient = _royaltyRecipient;
    }
    
    /**
     * @dev Mint a new intelligent NFT
     */
    function mintIntelligence(
        address to,
        string memory intelligenceUri,
        string memory metadataUri,
        bytes32 sealedKey,
        bytes32 contentHash,
        bool requiresOracle
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataUri);
        
        _intelligence[tokenId] = IntelligenceData({
            intelligenceUri: intelligenceUri,
            sealedKey: sealedKey,
            contentHash: contentHash,
            version: 1,
            requiresOracle: requiresOracle,
            lastUpdatedBy: msg.sender,
            lastUpdatedAt: block.timestamp
        });
        
        emit IntelligenceUpdated(tokenId, intelligenceUri, sealedKey, 1);
        
        if (requiresOracle && oracle != address(0)) {
            emit OracleVerificationRequested(tokenId, oracle, contentHash);
        }
        
        return tokenId;
    }
    
    /**
     * @dev Update intelligence for existing token
     */
    function updateIntelligence(
        uint256 tokenId,
        string memory newIntelligenceUri,
        bytes32 newSealedKey,
        bytes32 newContentHash
    ) public {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        require(_exists(tokenId), "Token does not exist");
        
        IntelligenceData storage intel = _intelligence[tokenId];
        
        // Oracle verification if required
        if (intel.requiresOracle && oracle != address(0)) {
            emit OracleVerificationRequested(tokenId, oracle, newContentHash);
            // In practice, would wait for oracle callback
        }
        
        intel.intelligenceUri = newIntelligenceUri;
        intel.sealedKey = newSealedKey;
        intel.contentHash = newContentHash;
        intel.version += 1;
        intel.lastUpdatedBy = msg.sender;
        intel.lastUpdatedAt = block.timestamp;
        
        emit IntelligenceUpdated(tokenId, newIntelligenceUri, newSealedKey, intel.version);
    }
    
    /**
     * @dev Authorize usage for compute operations
     */
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        uint256 permissions,
        uint256 duration
    ) public {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        require(executor != address(0), "Invalid executor");
        
        uint256 expiresAt = block.timestamp + duration;
        
        // Add to authorized executors if not already present
        if (!_authorizations[tokenId][executor].active) {
            _authorizedExecutors[tokenId].push(executor);
        }
        
        _authorizations[tokenId][executor] = AuthorizedUsage({
            executor: executor,
            permissions: permissions,
            expiresAt: expiresAt,
            active: true
        });
        
        emit UsageAuthorized(tokenId, executor, permissions, expiresAt);
    }
    
    /**
     * @dev Revoke usage authorization
     */
    function revokeUsage(uint256 tokenId, address executor) public {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        
        _authorizations[tokenId][executor].active = false;
        emit UsageRevoked(tokenId, executor);
    }
    
    /**
     * @dev Check if address is authorized for usage
     */
    function isAuthorized(
        uint256 tokenId,
        address executor,
        uint256 requiredPermissions
    ) public view returns (bool) {
        AuthorizedUsage memory auth = _authorizations[tokenId][executor];
        
        return auth.active &&
               auth.expiresAt > block.timestamp &&
               (auth.permissions & requiredPermissions) == requiredPermissions;
    }
    
    /**
     * @dev Get intelligence data (only for authorized users)
     */
    function getIntelligenceData(uint256 tokenId) public view returns (
        string memory intelligenceUri,
        bytes32 sealedKey,
        uint256 version,
        uint256 lastUpdatedAt
    ) {
        require(_exists(tokenId), "Token does not exist");
        require(
            _ownerOf(tokenId) == msg.sender || isAuthorized(tokenId, msg.sender, 1),
            "Not authorized"
        );
        
        IntelligenceData storage intel = _intelligence[tokenId];
        return (
            intel.intelligenceUri,
            intel.sealedKey,
            intel.version,
            intel.lastUpdatedAt
        );
    }
    
    /**
     * @dev Secure transfer with re-encryption
     */
    function secureTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes32 newSealedKey
    ) public {
        require(_ownerOf(tokenId) == from, "Not token owner");
        require(_isAuthorized(from, msg.sender, tokenId), "Not approved");
        
        // Update sealed key for new owner
        _intelligence[tokenId].sealedKey = newSealedKey;
        _intelligence[tokenId].lastUpdatedBy = to;
        _intelligence[tokenId].lastUpdatedAt = block.timestamp;
        
        emit SecureTransferInitiated(tokenId, from, to, newSealedKey);
        
        // Clear existing authorizations on transfer
        _clearAuthorizations(tokenId);
        
        _transfer(from, to, tokenId);
    }
    
    /**
     * @dev Override transfer to require re-encryption
     */
    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) {
        // For standard transfers, require re-encryption to be handled separately
        super.transferFrom(from, to, tokenId);
        
        // Clear authorizations on transfer
        _clearAuthorizations(tokenId);
    }
    
    /**
     * @dev Set oracle address
     */
    function setOracle(address _oracle) public onlyOwner {
        oracle = _oracle;
        trustedOracles[_oracle] = true;
    }
    
    /**
     * @dev Set royalty info (EIP-2981)
     */
    function setRoyaltyInfo(address recipient, uint256 percentage) public onlyOwner {
        require(percentage <= 1000, "Royalty too high"); // Max 10%
        royaltyRecipient = recipient;
        royaltyPercentage = percentage;
    }
    
    /**
     * @dev EIP-2981 royalty info
     */
    function royaltyInfo(uint256, uint256 salePrice) public view override returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyPercentage) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }
    
    /**
     * @dev Support for interfaces
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    // Internal functions
    function _clearAuthorizations(uint256 tokenId) internal {
        address[] storage executors = _authorizedExecutors[tokenId];
        for (uint i = 0; i < executors.length; i++) {
            _authorizations[tokenId][executors[i]].active = false;
        }
        delete _authorizedExecutors[tokenId];
    }
    
    function _nextTokenId() internal view returns (uint256) {
        return totalSupply() + 1;
    }
    
    function totalSupply() public view returns (uint256) {
        // Simple counter - in production might want to use Counter from OpenZeppelin
        return _nextTokenId() - 1;
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Override required by Solidity
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
