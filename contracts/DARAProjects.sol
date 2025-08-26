// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DARAProjects
 * @dev Project management contract for multi-institution collaboration
 */
contract DARAProjects is AccessControl, ReentrancyGuard {
    
    bytes32 public constant PROJECT_ADMIN = keccak256("PROJECT_ADMIN");
    bytes32 public constant PROJECT_VERIFIER = keccak256("PROJECT_VERIFIER");
    bytes32 public constant PROJECT_MEMBER = keccak256("PROJECT_MEMBER");
    
    struct Project {
        bytes32 id;
        string name;
        string description;
        address creator;
        uint256 createdAt;
        bool active;
        uint256 memberCount;
        uint256 datasetCount;
    }
    
    struct ProjectMember {
        address member;
        bytes32 role;
        uint256 joinedAt;
        bool active;
    }
    
    // Storage
    mapping(bytes32 => Project) public projects;
    mapping(bytes32 => mapping(address => ProjectMember)) public projectMembers;
    mapping(bytes32 => address[]) public projectMemberList;
    mapping(address => bytes32[]) public userProjects;
    bytes32[] public allProjects;
    
    // Events
    event ProjectCreated(
        bytes32 indexed projectId,
        string name,
        address indexed creator,
        uint256 timestamp
    );
    
    event MemberAdded(
        bytes32 indexed projectId,
        address indexed member,
        bytes32 indexed role,
        address addedBy,
        uint256 timestamp
    );
    
    event MemberRemoved(
        bytes32 indexed projectId,
        address indexed member,
        address removedBy,
        uint256 timestamp
    );
    
    event RoleChanged(
        bytes32 indexed projectId,
        address indexed member,
        bytes32 oldRole,
        bytes32 newRole,
        address changedBy,
        uint256 timestamp
    );
    
    event ProjectUpdated(
        bytes32 indexed projectId,
        string name,
        string description,
        address updatedBy,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new project
     * @param projectId Unique project identifier
     * @param name Project name
     * @param description Project description
     */
    function createProject(
        bytes32 projectId,
        string memory name,
        string memory description
    ) external nonReentrant {
        require(projectId != bytes32(0), "Invalid project ID");
        require(bytes(name).length > 0, "Name required");
        require(projects[projectId].creator == address(0), "Project exists");
        
        projects[projectId] = Project({
            id: projectId,
            name: name,
            description: description,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true,
            memberCount: 1,
            datasetCount: 0
        });
        
        // Add creator as admin
        projectMembers[projectId][msg.sender] = ProjectMember({
            member: msg.sender,
            role: PROJECT_ADMIN,
            joinedAt: block.timestamp,
            active: true
        });
        
        projectMemberList[projectId].push(msg.sender);
        userProjects[msg.sender].push(projectId);
        allProjects.push(projectId);
        
        emit ProjectCreated(projectId, name, msg.sender, block.timestamp);
        emit MemberAdded(projectId, msg.sender, PROJECT_ADMIN, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add a member to a project
     * @param projectId Project ID
     * @param member Member address
     * @param role Member role
     */
    function addMember(
        bytes32 projectId,
        address member,
        bytes32 role
    ) external {
        require(projects[projectId].active, "Project not active");
        require(hasRole(projectId, msg.sender, PROJECT_ADMIN), "Not authorized");
        require(!projectMembers[projectId][member].active, "Already a member");
        require(
            role == PROJECT_ADMIN || 
            role == PROJECT_VERIFIER || 
            role == PROJECT_MEMBER,
            "Invalid role"
        );
        
        projectMembers[projectId][member] = ProjectMember({
            member: member,
            role: role,
            joinedAt: block.timestamp,
            active: true
        });
        
        projectMemberList[projectId].push(member);
        userProjects[member].push(projectId);
        projects[projectId].memberCount++;
        
        emit MemberAdded(projectId, member, role, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Remove a member from a project
     * @param projectId Project ID
     * @param member Member address
     */
    function removeMember(
        bytes32 projectId,
        address member
    ) external {
        require(projects[projectId].active, "Project not active");
        require(hasRole(projectId, msg.sender, PROJECT_ADMIN), "Not authorized");
        require(projectMembers[projectId][member].active, "Not a member");
        require(member != projects[projectId].creator, "Cannot remove creator");
        
        projectMembers[projectId][member].active = false;
        projects[projectId].memberCount--;
        
        emit MemberRemoved(projectId, member, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Change a member's role
     * @param projectId Project ID
     * @param member Member address
     * @param newRole New role
     */
    function changeRole(
        bytes32 projectId,
        address member,
        bytes32 newRole
    ) external {
        require(projects[projectId].active, "Project not active");
        require(hasRole(projectId, msg.sender, PROJECT_ADMIN), "Not authorized");
        require(projectMembers[projectId][member].active, "Not a member");
        require(
            newRole == PROJECT_ADMIN || 
            newRole == PROJECT_VERIFIER || 
            newRole == PROJECT_MEMBER,
            "Invalid role"
        );
        
        bytes32 oldRole = projectMembers[projectId][member].role;
        projectMembers[projectId][member].role = newRole;
        
        emit RoleChanged(projectId, member, oldRole, newRole, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update project details
     * @param projectId Project ID
     * @param name New name
     * @param description New description
     */
    function updateProject(
        bytes32 projectId,
        string memory name,
        string memory description
    ) external {
        require(projects[projectId].active, "Project not active");
        require(hasRole(projectId, msg.sender, PROJECT_ADMIN), "Not authorized");
        require(bytes(name).length > 0, "Name required");
        
        projects[projectId].name = name;
        projects[projectId].description = description;
        
        emit ProjectUpdated(projectId, name, description, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Increment dataset count for a project
     * @param projectId Project ID
     */
    function incrementDatasetCount(bytes32 projectId) external {
        // This should be called by the DARARegistry contract
        require(projects[projectId].active, "Project not active");
        projects[projectId].datasetCount++;
    }
    
    /**
     * @dev Check if user has a specific role in a project
     * @param projectId Project ID
     * @param user User address
     * @param role Role to check
     */
    function hasRole(
        bytes32 projectId,
        address user,
        bytes32 role
    ) public view returns (bool) {
        ProjectMember memory member = projectMembers[projectId][user];
        return member.active && member.role == role;
    }
    
    /**
     * @dev Check if user is a member of a project
     * @param projectId Project ID
     * @param user User address
     */
    function isMember(bytes32 projectId, address user) external view returns (bool) {
        return projectMembers[projectId][user].active;
    }
    
    /**
     * @dev Get project details
     * @param projectId Project ID
     */
    function getProject(bytes32 projectId) external view returns (Project memory) {
        require(projects[projectId].creator != address(0), "Project not found");
        return projects[projectId];
    }
    
    /**
     * @dev Get project members
     * @param projectId Project ID
     */
    function getProjectMembers(bytes32 projectId) external view returns (address[] memory) {
        return projectMemberList[projectId];
    }
    
    /**
     * @dev Get user's projects
     * @param user User address
     */
    function getUserProjects(address user) external view returns (bytes32[] memory) {
        return userProjects[user];
    }
    
    /**
     * @dev Get all projects with pagination
     * @param offset Starting index
     * @param limit Number of projects to return
     */
    function getProjects(
        uint256 offset,
        uint256 limit
    ) external view returns (Project[] memory result) {
        uint256 total = allProjects.length;
        if (offset >= total) {
            return new Project[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        result = new Project[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = projects[allProjects[i]];
        }
    }
    
    /**
     * @dev Get total number of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return allProjects.length;
    }
}

