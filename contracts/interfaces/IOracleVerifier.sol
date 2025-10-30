// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOracleVerifier
 * @dev Interface for oracle-based attestation verification
 * @notice Used to verify off-chain signed proofs for secure NFT transfers
 * 
 * The oracle verifier validates that:
 * 1. The attestation signature is valid and from a trusted oracle
 * 2. The proof is not expired (within proof window)
 * 3. The transfer parameters match the attestation
 * 4. Metadata integrity is maintained
 */
interface IOracleVerifier {
    /**
     * @notice Verify an oracle attestation for secure transfer
     * @dev Validates signature, timestamp, and transfer parameters
     * 
     * @param attestation The encoded attestation data containing:
     *   - tokenId: The unique identifier of the token
     *   - from: The current owner address
     *   - to: The recipient address
     *   - newHash: The updated metadata hash (if changed)
     *   - newURI: The updated encrypted URI (if changed)
     *   - issuedAt: The timestamp when attestation was issued
     *   - signature: The oracle's ECDSA signature
     * 
     * @return isValid True if the attestation is valid
     * @return newHash The metadata hash from the attestation
     * @return newURI The encrypted URI from the attestation
     * @return issuedAt The timestamp when the attestation was issued
     */
    function verify(bytes calldata attestation)
        external
        view
        returns (
            bool isValid,
            bytes32 newHash,
            string memory newURI,
            uint64 issuedAt
        );

    /**
     * @notice Get the trusted oracle signer address
     * @return The address authorized to sign attestations
     */
    function getOracleSigner() external view returns (address);

    /**
     * @notice Check if an attestation signature is valid
     * @param message The hash of the attestation message
     * @param signature The ECDSA signature to verify
     * @return True if the signature is valid
     */
    function isValidSignature(bytes32 message, bytes calldata signature)
        external
        view
        returns (bool);
}
