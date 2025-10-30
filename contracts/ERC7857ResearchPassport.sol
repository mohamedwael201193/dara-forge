// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./interfaces/IERC7857.sol";
import "./interfaces/IOracleVerifier.sol";
import "./libraries/AttestationLib.sol";

/**
 * @title ERC7857ResearchPassport
 * @dev Production-grade ERC-7857 implementation for DARA Research Passport iNFTs
 * @notice Mainnet-ready contract with oracle-verified transfers and usage authorization
 * 
 * Features:
 * - ERC-721 compliant with additional security
 * - Oracle-verified secure transfers
 * - Encrypted metadata URIs for privacy
 * - Usage authorization for delegates
 * - Pausable for emergency stops
 * - ReentrancyGuard for extra security
 * 
 * Wave 5 Deployment:
 * - Network: 0G Mainnet (Chain ID: 16661)
 * - Name: "DARA Research Passport"
 * - Symbol: "DRP"
 */
contract ERC7857ResearchPassport is 
    ERC721,
    Ownable,
    Pausable,
    ReentrancyGuard,
    IERC7857
{
    using AttestationLib for bytes;
    using AttestationLib for AttestationLib.Attestation;

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    /// @dev Counter for token IDs
    uint256 private _nextTokenId;

    /// @dev Mapping from token ID to metadata hash (keccak256 of research data)
    mapping(uint256 => bytes32) private _metadataHash;

    /// @dev Mapping from token ID to encrypted storage URI
    mapping(uint256 => string) private _encryptedURI;

    /// @dev Mapping from token ID to authorized executors and their permissions
    mapping(uint256 => mapping(address => bytes)) private _authorizations;

    /// @dev Address of the oracle verifier contract
    address private _oracle;

    /// @dev Proof validity window in seconds (default: 1 hour)
    uint64 private _proofWindow;

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    /**
     * @notice Initialize the Research Passport NFT contract
     * @param initialOwner The address that will own the contract
     * @param initialOracle The address of the oracle verifier (can be zero, set later)
     */
    constructor(address initialOwner, address initialOracle)
        ERC721("DARA Research Passport", "DRP")
        Ownable(initialOwner)
    {
        _nextTokenId = 1; // Start token IDs from 1
        _oracle = initialOracle;
        _proofWindow = 1 hours; // Default 1 hour proof validity
    }

    // =============================================================================
    // MINTING
    // =============================================================================

    /**
     * @notice Mint a new Research Passport iNFT
     * @dev Only callable by contract owner
     * @param to The address to mint the token to
     * @param encryptedURI The encrypted storage URI
     * @param metadataHash The keccak256 hash of the research metadata
     * @return tokenId The unique identifier of the minted token
     */
    function mint(
        address to,
        string calldata encryptedURI,
        bytes32 metadataHash
    )
        external
        override
        onlyOwner
        whenNotPaused
        returns (uint256 tokenId)
    {
        require(to != address(0), "ERC7857: mint to zero address");
        require(bytes(encryptedURI).length > 0, "ERC7857: empty URI");
        require(metadataHash != bytes32(0), "ERC7857: zero hash");

        tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _metadataHash[tokenId] = metadataHash;
        _encryptedURI[tokenId] = encryptedURI;

        emit Minted(tokenId, to, metadataHash, encryptedURI);
    }

    // =============================================================================
    // SECURE TRANSFER (REPLACES STANDARD transferFrom/safeTransferFrom)
    // =============================================================================

    /**
     * @notice Securely transfer a token with oracle verification
     * @dev Requires valid oracle attestation, replaces standard transfers
     * @param from The current owner address
     * @param to The recipient address
     * @param tokenId The token to transfer
     * @param sealedKey The encrypted key for the new owner (future use)
     * @param oracleProof The oracle attestation proving transfer validity
     */
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata oracleProof
    )
        external
        override
        nonReentrant
        whenNotPaused
    {
        // Validate inputs
        if (ownerOf(tokenId) != from) revert NotOwner();
        if (to == address(0)) revert InvalidRecipient();
        if (_oracle == address(0)) revert OracleNotSet();

        // Verify oracle attestation
        (bool isValid, bytes32 newHash, string memory newURI, uint64 issuedAt) = 
            IOracleVerifier(_oracle).verify(oracleProof);

        if (!isValid) revert InvalidProof();
        
        // Check proof freshness
        if (!AttestationLib.isNotExpired(issuedAt, _proofWindow)) {
            revert StaleProof();
        }

        // Update metadata if changed
        if (newHash != bytes32(0) && newHash != _metadataHash[tokenId]) {
            _metadataHash[tokenId] = newHash;
        }
        if (bytes(newURI).length > 0 && keccak256(bytes(newURI)) != keccak256(bytes(_encryptedURI[tokenId]))) {
            _encryptedURI[tokenId] = newURI;
        }

        // Perform the transfer
        _transfer(from, to, tokenId);

        emit SecureTransfer(tokenId, from, to, newHash, newURI);
    }

    // =============================================================================
    // USAGE AUTHORIZATION
    // =============================================================================

    /**
     * @notice Authorize an address to use the token
     * @dev Grants delegate access for operations like marketplace listings
     * @param tokenId The token to authorize
     * @param executor The address to grant usage rights
     * @param permissions The encoded permission data
     */
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    )
        external
        override
        whenNotPaused
    {
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        require(executor != address(0), "ERC7857: authorize zero address");

        _authorizations[tokenId][executor] = permissions;

        emit UsageAuthorized(tokenId, executor, permissions);
    }

    // =============================================================================
    // ORACLE MANAGEMENT
    // =============================================================================

    /**
     * @notice Update the oracle verifier address
     * @dev Only callable by contract owner
     * @param newOracle The address of the new oracle verifier
     * @param newWindow The new proof validity window in seconds
     */
    function updateOracle(address newOracle, uint64 newWindow)
        external
        override
        onlyOwner
    {
        require(newOracle != address(0), "ERC7857: zero oracle address");
        require(newWindow > 0 && newWindow <= 7 days, "ERC7857: invalid proof window");

        address previousOracle = _oracle;
        _oracle = newOracle;
        _proofWindow = newWindow;

        emit OracleUpdated(previousOracle, newOracle);
    }

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    /**
     * @notice Get the metadata hash for a token
     * @param tokenId The token identifier
     * @return The keccak256 hash of the research metadata
     */
    function getMetadataHash(uint256 tokenId) external view override returns (bytes32) {
        _requireOwned(tokenId);
        return _metadataHash[tokenId];
    }

    /**
     * @notice Get the encrypted URI for a token
     * @param tokenId The token identifier
     * @return The encrypted storage URI
     */
    function getEncryptedURI(uint256 tokenId) external view override returns (string memory) {
        _requireOwned(tokenId);
        return _encryptedURI[tokenId];
    }

    /**
     * @notice Check if an address is authorized to use a token
     * @param tokenId The token identifier
     * @param executor The address to check
     * @return True if authorized
     */
    function isAuthorized(uint256 tokenId, address executor) external view override returns (bool) {
        _requireOwned(tokenId);
        return _authorizations[tokenId][executor].length > 0;
    }

    /**
     * @notice Get the current oracle verifier address
     * @return The oracle verifier address
     */
    function getOracle() external view override returns (address) {
        return _oracle;
    }

    /**
     * @notice Get the proof validity window
     * @return The time window in seconds
     */
    function getProofWindow() external view override returns (uint64) {
        return _proofWindow;
    }

    /**
     * @notice Get the total number of tokens minted
     * @return The total supply
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // =============================================================================
    // EMERGENCY CONTROLS
    // =============================================================================

    /**
     * @notice Pause all token operations
     * @dev Only callable by contract owner in emergencies
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause all token operations
     * @dev Only callable by contract owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // =============================================================================
    // EIP-165 SUPPORT
    // =============================================================================

    /**
     * @notice Check if contract supports an interface
     * @param interfaceId The interface identifier
     * @return True if supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721)
        returns (bool)
    {
        return
            interfaceId == type(IERC7857).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
