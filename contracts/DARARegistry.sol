// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DARARegistry
 * @dev Registry contract for anchoring datasets and managing citations on 0G Chain
 */
contract DARARegistry is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    Counters.Counter private _datasetIds;
    
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
    
    struct Citation {
        uint256 fromId;
        bytes32 citedRoot;
        uint8 weight; // 1-10 scale
        address citer;
        uint256 timestamp;
    }
    
    // Storage
    mapping(uint256 => Dataset) public datasets;
    mapping(bytes32 => uint256) public rootToId;
    mapping(uint256 => Citation[]) public citations;
    mapping(bytes32 => uint256[]) public projectDatasets;
    
    // Events
    event DatasetAnchored(
        uint256 indexed id,
        bytes32 indexed root,
        bytes32 indexed manifestHash,
        bytes32 projectId,
        address uploader,
        uint256 timestamp
    );
    
    event DatasetVerified(
        uint256 indexed id,
        address indexed verifier,
        uint256 timestamp
    );
    
    event CitationAdded(
        uint256 indexed fromId,
        bytes32 indexed citedRoot,
        uint8 weight,
        address indexed citer,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Anchor a dataset on the blockchain
     * @param root Merkle root of the dataset
     * @param manifestHash Hash of the manifest JSON
     * @param projectId Project identifier
     * @return id The assigned dataset ID
     */
    function anchor(
        bytes32 root,
        bytes32 manifestHash,
        bytes32 projectId
    ) external nonReentrant returns (uint256 id) {
        require(root != bytes32(0), "Invalid root");
        require(manifestHash != bytes32(0), "Invalid manifest hash");
        require(rootToId[root] == 0, "Dataset already anchored");
        
        _datasetIds.increment();
        id = _datasetIds.current();
        
        datasets[id] = Dataset({
            id: id,
            root: root,
            manifestHash: manifestHash,
            projectId: projectId,
            uploader: msg.sender,
            timestamp: block.timestamp,
            verified: false,
            citationCount: 0
        });
        
        rootToId[root] = id;
        projectDatasets[projectId].push(id);
        
        emit DatasetAnchored(
            id,
            root,
            manifestHash,
            projectId,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Verify a dataset (only verifiers)
     * @param id Dataset ID to verify
     */
    function verifyDataset(uint256 id) external onlyRole(VERIFIER_ROLE) {
        require(datasets[id].id != 0, "Dataset not found");
        require(!datasets[id].verified, "Already verified");
        
        datasets[id].verified = true;
        
        emit DatasetVerified(id, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add a citation
     * @param fromId Source dataset ID
     * @param citedRoot Root hash of cited dataset
     * @param weight Citation weight (1-10)
     */
    function cite(
        uint256 fromId,
        bytes32 citedRoot,
        uint8 weight
    ) external {
        require(datasets[fromId].id != 0, "Source dataset not found");
        require(datasets[fromId].uploader == msg.sender, "Not authorized");
        require(weight >= 1 && weight <= 10, "Invalid weight");
        
        citations[fromId].push(Citation({
            fromId: fromId,
            citedRoot: citedRoot,
            weight: weight,
            citer: msg.sender,
            timestamp: block.timestamp
        }));
        
        // Update citation count if cited dataset exists
        uint256 citedId = rootToId[citedRoot];
        if (citedId != 0) {
            datasets[citedId].citationCount++;
        }
        
        emit CitationAdded(fromId, citedRoot, weight, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get dataset by ID
     */
    function getDataset(uint256 id) external view returns (Dataset memory) {
        require(datasets[id].id != 0, "Dataset not found");
        return datasets[id];
    }
    
    /**
     * @dev Get dataset by root hash
     */
    function getDatasetByRoot(bytes32 root) external view returns (Dataset memory) {
        uint256 id = rootToId[root];
        require(id != 0, "Dataset not found");
        return datasets[id];
    }
    
    /**
     * @dev Get citations for a dataset
     */
    function getCitations(uint256 id) external view returns (Citation[] memory) {
        return citations[id];
    }
    
    /**
     * @dev Get datasets for a project
     */
    function getProjectDatasets(bytes32 projectId) external view returns (uint256[] memory) {
        return projectDatasets[projectId];
    }
    
    /**
     * @dev Get total number of datasets
     */
    function getTotalDatasets() external view returns (uint256) {
        return _datasetIds.current();
    }
    
    /**
     * @dev Get datasets with pagination
     */
    function getDatasets(
        uint256 offset,
        uint256 limit
    ) external view returns (Dataset[] memory result) {
        uint256 total = _datasetIds.current();
        if (offset >= total) {
            return new Dataset[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        result = new Dataset[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = datasets[i + 1]; // IDs start from 1
        }
    }
}

