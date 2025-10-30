// =============================================================================
// ERC-7857 Research Passport NFT Tests
// =============================================================================
// Comprehensive test suite for mainnet deployment verification

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC7857ResearchPassport", function () {
  let passport;
  let mockOracle;
  let owner;
  let researcher1;
  let researcher2;
  let unauthorized;

  const TEST_HASH = ethers.keccak256(ethers.toUtf8Bytes("test research data"));
  const TEST_URI = "ipfs://Qm...encrypted";

  beforeEach(async function () {
    [owner, researcher1, researcher2, unauthorized] = await ethers.getSigners();

    // Deploy mock oracle (simple contract that always returns valid)
    const MockOracle = await ethers.getContractFactory("MockOracleVerifier");
    mockOracle = await MockOracle.deploy();

    // Deploy passport contract
    const Passport = await ethers.getContractFactory("ERC7857ResearchPassport");
    passport = await Passport.deploy(owner.address, await mockOracle.getAddress());
  });

  // =============================================================================
  // DEPLOYMENT TESTS
  // =============================================================================

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await passport.name()).to.equal("DARA Research Passport");
      expect(await passport.symbol()).to.equal("DRP");
    });

    it("Should set the correct owner", async function () {
      expect(await passport.owner()).to.equal(owner.address);
    });

    it("Should set the oracle verifier", async function () {
      expect(await passport.getOracle()).to.equal(await mockOracle.getAddress());
    });

    it("Should set default proof window to 1 hour", async function () {
      expect(await passport.getProofWindow()).to.equal(3600);
    });
  });

  // =============================================================================
  // MINTING TESTS
  // =============================================================================

  describe("Minting", function () {
    it("Should mint token successfully", async function () {
      const tx = await passport.connect(owner).mint(researcher1.address, TEST_URI, TEST_HASH);
      
      await expect(tx)
        .to.emit(passport, "Minted")
        .withArgs(1, researcher1.address, TEST_HASH, TEST_URI);

      expect(await passport.ownerOf(1)).to.equal(researcher1.address);
      expect(await passport.getMetadataHash(1)).to.equal(TEST_HASH);
      expect(await passport.getEncryptedURI(1)).to.equal(TEST_URI);
      expect(await passport.totalSupply()).to.equal(1);
    });

    it("Should mint multiple tokens with incrementing IDs", async function () {
      await passport.connect(owner).mint(researcher1.address, TEST_URI, TEST_HASH);
      await passport.connect(owner).mint(researcher2.address, TEST_URI, TEST_HASH);

      expect(await passport.totalSupply()).to.equal(2);
      expect(await passport.ownerOf(1)).to.equal(researcher1.address);
      expect(await passport.ownerOf(2)).to.equal(researcher2.address);
    });

    it("Should revert if not owner tries to mint", async function () {
      await expect(
        passport.connect(researcher1).mint(researcher1.address, TEST_URI, TEST_HASH)
      ).to.be.revertedWithCustomError(passport, "OwnableUnauthorizedAccount");
    });

    it("Should revert when minting to zero address", async function () {
      await expect(
        passport.connect(owner).mint(ethers.ZeroAddress, TEST_URI, TEST_HASH)
      ).to.be.revertedWith("ERC7857: mint to zero address");
    });

    it("Should revert when minting with empty URI", async function () {
      await expect(
        passport.connect(owner).mint(researcher1.address, "", TEST_HASH)
      ).to.be.revertedWith("ERC7857: empty URI");
    });

    it("Should revert when minting with zero hash", async function () {
      await expect(
        passport.connect(owner).mint(researcher1.address, TEST_URI, ethers.ZeroHash)
      ).to.be.revertedWith("ERC7857: zero hash");
    });

    it("Should revert when paused", async function () {
      await passport.connect(owner).pause();

      await expect(
        passport.connect(owner).mint(researcher1.address, TEST_URI, TEST_HASH)
      ).to.be.revertedWithCustomError(passport, "EnforcedPause");
    });
  });

  // =============================================================================
  // SECURE TRANSFER TESTS
  // =============================================================================

  describe("Secure Transfer", function () {
    beforeEach(async function () {
      await passport.connect(owner).mint(researcher1.address, TEST_URI, TEST_HASH);
    });

    it("Should transfer token with valid oracle proof", async function () {
      const proof = await mockOracle.createValidProof(
        1,
        researcher1.address,
        researcher2.address,
        TEST_HASH,
        TEST_URI
      );

      const tx = await passport.connect(researcher1).transfer(
        researcher1.address,
        researcher2.address,
        1,
        "0x",
        proof
      );

      await expect(tx)
        .to.emit(passport, "SecureTransfer")
        .withArgs(1, researcher1.address, researcher2.address, TEST_HASH, TEST_URI);

      expect(await passport.ownerOf(1)).to.equal(researcher2.address);
    });

    it("Should revert when not owner tries to transfer", async function () {
      const proof = await mockOracle.createValidProof(
        1,
        researcher1.address,
        researcher2.address,
        TEST_HASH,
        TEST_URI
      );

      await expect(
        passport.connect(unauthorized).transfer(
          researcher1.address,
          researcher2.address,
          1,
          "0x",
          proof
        )
      ).to.be.revertedWithCustomError(passport, "NotOwner");
    });

    it("Should revert when transferring to zero address", async function () {
      const proof = await mockOracle.createValidProof(
        1,
        researcher1.address,
        ethers.ZeroAddress,
        TEST_HASH,
        TEST_URI
      );

      await expect(
        passport.connect(researcher1).transfer(
          researcher1.address,
          ethers.ZeroAddress,
          1,
          "0x",
          proof
        )
      ).to.be.revertedWithCustomError(passport, "InvalidRecipient");
    });

    it("Should revert with stale proof", async function () {
      const proof = await mockOracle.createExpiredProof(
        1,
        researcher1.address,
        researcher2.address,
        TEST_HASH,
        TEST_URI
      );

      await expect(
        passport.connect(researcher1).transfer(
          researcher1.address,
          researcher2.address,
          1,
          "0x",
          proof
        )
      ).to.be.revertedWithCustomError(passport, "StaleProof");
    });

    it("Should revert when paused", async function () {
      await passport.connect(owner).pause();

      const proof = await mockOracle.createValidProof(
        1,
        researcher1.address,
        researcher2.address,
        TEST_HASH,
        TEST_URI
      );

      await expect(
        passport.connect(researcher1).transfer(
          researcher1.address,
          researcher2.address,
          1,
          "0x",
          proof
        )
      ).to.be.revertedWithCustomError(passport, "EnforcedPause");
    });
  });

  // =============================================================================
  // USAGE AUTHORIZATION TESTS
  // =============================================================================

  describe("Usage Authorization", function () {
    beforeEach(async function () {
      await passport.connect(owner).mint(researcher1.address, TEST_URI, TEST_HASH);
    });

    it("Should authorize usage successfully", async function () {
      const permissions = ethers.toUtf8Bytes("marketplace:list,read");

      const tx = await passport.connect(researcher1).authorizeUsage(
        1,
        researcher2.address,
        permissions
      );

      await expect(tx)
        .to.emit(passport, "UsageAuthorized")
        .withArgs(1, researcher2.address, permissions);

      expect(await passport.isAuthorized(1, researcher2.address)).to.be.true;
    });

    it("Should revert when not owner tries to authorize", async function () {
      const permissions = ethers.toUtf8Bytes("marketplace:list");

      await expect(
        passport.connect(unauthorized).authorizeUsage(1, researcher2.address, permissions)
      ).to.be.revertedWithCustomError(passport, "NotOwner");
    });

    it("Should revert when authorizing zero address", async function () {
      const permissions = ethers.toUtf8Bytes("marketplace:list");

      await expect(
        passport.connect(researcher1).authorizeUsage(1, ethers.ZeroAddress, permissions)
      ).to.be.revertedWith("ERC7857: authorize zero address");
    });
  });

  // =============================================================================
  // ORACLE MANAGEMENT TESTS
  // =============================================================================

  describe("Oracle Management", function () {
    it("Should update oracle successfully", async function () {
      const newOracle = ethers.Wallet.createRandom().address;
      const newWindow = 7200; // 2 hours

      const tx = await passport.connect(owner).updateOracle(newOracle, newWindow);

      await expect(tx)
        .to.emit(passport, "OracleUpdated")
        .withArgs(await mockOracle.getAddress(), newOracle);

      expect(await passport.getOracle()).to.equal(newOracle);
      expect(await passport.getProofWindow()).to.equal(newWindow);
    });

    it("Should revert when not owner tries to update oracle", async function () {
      const newOracle = ethers.Wallet.createRandom().address;

      await expect(
        passport.connect(unauthorized).updateOracle(newOracle, 3600)
      ).to.be.revertedWithCustomError(passport, "OwnableUnauthorizedAccount");
    });

    it("Should revert when updating to zero oracle address", async function () {
      await expect(
        passport.connect(owner).updateOracle(ethers.ZeroAddress, 3600)
      ).to.be.revertedWith("ERC7857: zero oracle address");
    });

    it("Should revert with invalid proof window", async function () {
      const newOracle = ethers.Wallet.createRandom().address;

      await expect(
        passport.connect(owner).updateOracle(newOracle, 0)
      ).to.be.revertedWith("ERC7857: invalid proof window");

      await expect(
        passport.connect(owner).updateOracle(newOracle, 8 * 24 * 3600) // 8 days
      ).to.be.revertedWith("ERC7857: invalid proof window");
    });
  });

  // =============================================================================
  // PAUSE/UNPAUSE TESTS
  // =============================================================================

  describe("Pause/Unpause", function () {
    it("Should pause successfully", async function () {
      await passport.connect(owner).pause();
      
      await expect(
        passport.connect(owner).mint(researcher1.address, TEST_URI, TEST_HASH)
      ).to.be.revertedWithCustomError(passport, "EnforcedPause");
    });

    it("Should unpause successfully", async function () {
      await passport.connect(owner).pause();
      await passport.connect(owner).unpause();

      await expect(
        passport.connect(owner).mint(researcher1.address, TEST_URI, TEST_HASH)
      ).to.not.be.reverted;
    });

    it("Should revert when non-owner tries to pause", async function () {
      await expect(
        passport.connect(unauthorized).pause()
      ).to.be.revertedWithCustomError(passport, "OwnableUnauthorizedAccount");
    });
  });

  // =============================================================================
  // ERC-165 INTERFACE SUPPORT
  // =============================================================================

  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      expect(await passport.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("Should support ERC165 interface", async function () {
      expect(await passport.supportsInterface("0x01ffc9a7")).to.be.true;
    });

    it("Should support ERC7857 interface", async function () {
      // Calculate interface ID from function signatures
      const iface = passport.interface;
      const sigs = [
        "mint(address,string,bytes32)",
        "transfer(address,address,uint256,bytes,bytes)",
        "authorizeUsage(uint256,address,bytes)",
        "updateOracle(address,uint64)",
        "getMetadataHash(uint256)",
        "getEncryptedURI(uint256)",
        "isAuthorized(uint256,address)",
        "getOracle()",
        "getProofWindow()"
      ];
      
      let interfaceId = "0x00000000";
      for (const sig of sigs) {
        const selector = iface.getFunction(sig).selector;
        interfaceId = ethers.toBeHex(
          BigInt(interfaceId) ^ BigInt(selector)
        );
      }

      expect(await passport.supportsInterface(interfaceId)).to.be.true;
    });
  });
});

// =============================================================================
// MOCK ORACLE VERIFIER CONTRACT
// =============================================================================

const MockOracleVerifierSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IOracleVerifier.sol";

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

        assembly {
            issuedAt := calldataload(add(attestation.offset, 128))
        }

        if (block.timestamp > issuedAt + 1 hours) {
            return (false, bytes32(0), "", issuedAt);
        }

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
`;
