// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DaraAnchor {
    struct Dataset {
        uint256 id;
        bytes32 root;
        bytes32 manifestHash;
        bytes32 projectId;
        address uploader;
        uint256 timestamp;
        bool verified;
        uint256 citationCount;
    }

    uint256 public nextId;
    mapping(uint256 => Dataset) public datasets;
    mapping(address => uint256[]) public ownerDatasets;

    event DatasetAnchored(
        uint256 indexed id,
        bytes32 indexed root,
        bytes32 indexed manifestHash,
        bytes32 projectId,
        address uploader,
        uint256 timestamp
    );

    function anchor(bytes32 root, bytes32 manifestHash, bytes32 projectId) external {
        uint256 id = ++nextId;
        datasets[id] = Dataset({
            id: id,
            root: root,
            manifestHash: manifestHash,
            projectId: projectId,
            uploader: msg.sender,
            timestamp: block.timestamp,
            verified: true,
            citationCount: 0
        });
        ownerDatasets[msg.sender].push(id);
        emit DatasetAnchored(id, root, manifestHash, projectId, msg.sender, block.timestamp);
    }

    function getDatasetsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerDatasets[owner];
    }
}