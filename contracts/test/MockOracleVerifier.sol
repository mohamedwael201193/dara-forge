// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IOracleVerifier.sol";

/**
 * @title MockOracleVerifier
 * @dev Mock oracle for testing - always returns valid for non-expired proofs
 */
contract MockOracleVerifier is IOracleVerifier {
    address public constant ORACLE_SIGNER = address(0x1234567890123456789012345678901234567890);

    function verify(bytes calldata attestation)
        external
        view
        override
        returns (bool isValid, bytes32 newHash, string memory newURI, uint64 issuedAt)
    {
        if (attestation.length < 32) {
            return (false, bytes32(0), "", 0);
        }

        // Decode issuedAt timestamp
        assembly {
            issuedAt := calldataload(add(attestation.offset, 128))
        }

        // Check if proof is expired (over 1 hour old)
        if (block.timestamp > issuedAt + 1 hours) {
            return (false, bytes32(0), "", issuedAt);
        }

        // Decode hash
        bytes32 hash;
        assembly {
            hash := calldataload(add(attestation.offset, 96))
        }

        return (true, hash, "ipfs://Qm...encrypted", issuedAt);
    }

    function getOracleSigner() external pure override returns (address) {
        return ORACLE_SIGNER;
    }

    function isValidSignature(bytes32, bytes calldata) external pure override returns (bool) {
        return true;
    }

    // Helper functions for testing
    function createValidProof(
        uint256 tokenId,
        address from,
        address to,
        bytes32 newHash,
        string memory newURI
    ) external view returns (bytes memory) {
        uint64 issuedAt = uint64(block.timestamp);
        return abi.encodePacked(tokenId, from, to, newHash, issuedAt, bytes(newURI), bytes("sig"));
    }

    function createExpiredProof(
        uint256 tokenId,
        address from,
        address to,
        bytes32 newHash,
        string memory newURI
    ) external view returns (bytes memory) {
        uint64 issuedAt = uint64(block.timestamp - 2 hours);
        return abi.encodePacked(tokenId, from, to, newHash, issuedAt, bytes(newURI), bytes("sig"));
    }
}
