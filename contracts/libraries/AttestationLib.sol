// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AttestationLib
 * @dev Library for encoding/decoding oracle attestation data
 * @notice Provides utilities for parsing and validating attestation proofs
 */
library AttestationLib {
    /**
     * @dev Attestation structure for oracle-verified transfers
     */
    struct Attestation {
        uint256 tokenId;      // The token being transferred
        address from;         // Current owner
        address to;           // New owner
        bytes32 newHash;      // Updated metadata hash
        string newURI;        // Updated encrypted URI
        uint64 issuedAt;      // Timestamp of attestation
        bytes signature;      // Oracle's ECDSA signature
    }

    /**
     * @notice Decode attestation bytes into structured data
     * @param data The encoded attestation data
     * @return attestation The decoded attestation struct
     */
    function decode(bytes calldata data) internal pure returns (Attestation memory attestation) {
        require(data.length >= 192, "AttestationLib: invalid data length");
        
        // Decode fixed-size fields (first 192 bytes)
        assembly {
            // Load tokenId (32 bytes)
            calldatacopy(mload(0x40), data.offset, 32)
            mstore(attestation, mload(mload(0x40)))
            
            // Load from address (32 bytes, right-aligned 20 bytes)
            calldatacopy(mload(0x40), add(data.offset, 32), 32)
            mstore(add(attestation, 0x20), mload(mload(0x40)))
            
            // Load to address (32 bytes, right-aligned 20 bytes)
            calldatacopy(mload(0x40), add(data.offset, 64), 32)
            mstore(add(attestation, 0x40), mload(mload(0x40)))
            
            // Load newHash (32 bytes)
            calldatacopy(mload(0x40), add(data.offset, 96), 32)
            mstore(add(attestation, 0x60), mload(mload(0x40)))
            
            // Load issuedAt (8 bytes, padded to 32)
            calldatacopy(mload(0x40), add(data.offset, 128), 32)
            mstore(add(attestation, 0xA0), mload(mload(0x40)))
        }
        
        // Decode variable-length fields (newURI and signature)
        uint256 offset = 160;
        
        // Decode newURI length
        uint256 uriLength;
        assembly {
            calldatacopy(mload(0x40), add(data.offset, offset), 32)
            uriLength := mload(mload(0x40))
        }
        offset += 32;
        
        // Decode newURI data
        bytes memory uriBytes = new bytes(uriLength);
        assembly {
            calldatacopy(add(uriBytes, 32), add(data.offset, offset), uriLength)
        }
        attestation.newURI = string(uriBytes);
        offset += uriLength;
        
        // Decode signature length
        uint256 sigLength;
        assembly {
            calldatacopy(mload(0x40), add(data.offset, offset), 32)
            sigLength := mload(mload(0x40))
        }
        offset += 32;
        
        // Decode signature data
        attestation.signature = new bytes(sigLength);
        assembly {
            calldatacopy(add(mload(attestation), add(attestation, 0xC0)), add(data.offset, offset), sigLength)
        }
    }

    /**
     * @notice Encode attestation struct into bytes
     * @param attestation The attestation struct to encode
     * @return data The encoded attestation data
     */
    function encode(Attestation memory attestation) internal pure returns (bytes memory data) {
        return abi.encodePacked(
            attestation.tokenId,
            attestation.from,
            attestation.to,
            attestation.newHash,
            attestation.issuedAt,
            uint256(bytes(attestation.newURI).length),
            attestation.newURI,
            uint256(attestation.signature.length),
            attestation.signature
        );
    }

    /**
     * @notice Compute the message hash for signature verification
     * @param attestation The attestation struct
     * @return messageHash The keccak256 hash to be signed
     */
    function computeMessageHash(Attestation memory attestation) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                attestation.tokenId,
                attestation.from,
                attestation.to,
                attestation.newHash,
                attestation.newURI,
                attestation.issuedAt
            )
        );
    }

    /**
     * @notice Recover the signer address from a signature
     * @param messageHash The hash that was signed
     * @param signature The ECDSA signature
     * @return signer The address that created the signature
     */
    function recoverSigner(bytes32 messageHash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "AttestationLib: invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        // EIP-2 still allows signature malleability for ecrecover()
        // Remove this possibility and make the signature unique
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            revert("AttestationLib: invalid signature 's' value");
        }
        
        if (v != 27 && v != 28) {
            revert("AttestationLib: invalid signature 'v' value");
        }
        
        // Compute eth_sign message hash
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        require(signer != address(0), "AttestationLib: invalid signature");
        
        return signer;
    }

    /**
     * @notice Verify that an attestation is not expired
     * @param issuedAt The timestamp when attestation was issued
     * @param proofWindow The maximum age of the proof in seconds
     * @return True if the attestation is still valid
     */
    function isNotExpired(uint64 issuedAt, uint64 proofWindow) internal view returns (bool) {
        return block.timestamp <= issuedAt + proofWindow;
    }
}
