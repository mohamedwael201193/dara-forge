// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC7857
 * @dev Interface for ERC-7857: Dynamic NFT with Oracle-Verified Transfers
 * @notice Extends ERC-721 with secure transfer mechanisms and usage authorization
 * 
 * Key Features:
 * - Oracle-verified transfers with attestation proofs
 * - Encrypted metadata URIs for privacy
 * - Usage authorization system for delegate access
 * - Immutable metadata hashes for integrity verification
 */
interface IERC7857 {
    // =============================================================================
    // EVENTS
    // =============================================================================

    /**
     * @dev Emitted when a new Research Passport iNFT is minted
     * @param tokenId The unique identifier of the minted token
     * @param owner The address of the token owner
     * @param metadataHash The keccak256 hash of the research metadata
     * @param encryptedURI The encrypted IPFS or storage URI
     */
    event Minted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 metadataHash,
        string encryptedURI
    );

    /**
     * @dev Emitted when a secure transfer is completed
     * @param tokenId The unique identifier of the transferred token
     * @param from The previous owner address
     * @param to The new owner address
     * @param newHash The updated metadata hash (if changed)
     * @param newURI The updated encrypted URI (if changed)
     */
    event SecureTransfer(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 newHash,
        string newURI
    );

    /**
     * @dev Emitted when usage authorization is granted
     * @param tokenId The unique identifier of the token
     * @param executor The address authorized to use the token
     * @param permissions The encoded permission data
     */
    event UsageAuthorized(
        uint256 indexed tokenId,
        address indexed executor,
        bytes permissions
    );

    /**
     * @dev Emitted when the oracle verifier is updated
     * @param previousOracle The address of the previous oracle
     * @param newOracle The address of the new oracle
     */
    event OracleUpdated(address indexed previousOracle, address indexed newOracle);

    // =============================================================================
    // ERRORS
    // =============================================================================

    /// @dev Thrown when caller is not the token owner
    error NotOwner();

    /// @dev Thrown when transfer recipient is invalid (zero address or contract without receiver)
    error InvalidRecipient();

    /// @dev Thrown when oracle proof is expired
    error StaleProof();

    /// @dev Thrown when oracle proof signature is invalid
    error InvalidProof();

    /// @dev Thrown when oracle verifier is not set
    error OracleNotSet();

    /// @dev Thrown when caller lacks authorization for the operation
    error Unauthorized();

    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================

    /**
     * @notice Mint a new Research Passport iNFT
     * @dev Only callable by contract owner/minter role
     * @param to The address to mint the token to
     * @param encryptedURI The encrypted storage URI (IPFS, 0G Storage, etc.)
     * @param metadataHash The keccak256 hash of the research metadata
     * @return tokenId The unique identifier of the minted token
     */
    function mint(
        address to,
        string calldata encryptedURI,
        bytes32 metadataHash
    ) external returns (uint256 tokenId);

    /**
     * @notice Securely transfer a token with oracle verification
     * @dev Replaces standard transferFrom/safeTransferFrom
     * @param from The current owner address
     * @param to The recipient address
     * @param tokenId The unique identifier of the token
     * @param sealedKey The encrypted key for the new owner
     * @param oracleProof The oracle attestation proving transfer validity
     */
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata oracleProof
    ) external;

    /**
     * @notice Authorize an address to use the token (delegate access)
     * @dev Useful for research collaboration, marketplace listings, etc.
     * @param tokenId The unique identifier of the token
     * @param executor The address to grant usage rights
     * @param permissions The encoded permission data
     */
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external;

    /**
     * @notice Update the oracle verifier address
     * @dev Only callable by contract owner
     * @param newOracle The address of the new oracle verifier
     * @param newWindow The new proof validity window in seconds
     */
    function updateOracle(address newOracle, uint64 newWindow) external;

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    /**
     * @notice Get the metadata hash for a token
     * @param tokenId The unique identifier of the token
     * @return The keccak256 hash of the research metadata
     */
    function getMetadataHash(uint256 tokenId) external view returns (bytes32);

    /**
     * @notice Get the encrypted URI for a token
     * @param tokenId The unique identifier of the token
     * @return The encrypted storage URI
     */
    function getEncryptedURI(uint256 tokenId) external view returns (string memory);

    /**
     * @notice Check if an address is authorized to use a token
     * @param tokenId The unique identifier of the token
     * @param executor The address to check authorization for
     * @return True if authorized, false otherwise
     */
    function isAuthorized(uint256 tokenId, address executor) external view returns (bool);

    /**
     * @notice Get the current oracle verifier address
     * @return The address of the oracle verifier contract
     */
    function getOracle() external view returns (address);

    /**
     * @notice Get the proof validity window
     * @return The time window in seconds for proof validity
     */
    function getProofWindow() external view returns (uint64);
}
