// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ChainlinkHelper
 * @notice Chainlink VRF and Automation interfaces and base contracts
 */

// Chainlink VRF interfaces
interface VRFCoordinatorV2Interface {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}

// Chainlink Automation interface
interface AutomationCompatibleInterface {
    function checkUpkeep(bytes calldata checkData) external view returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

// VRF Consumer Base Contract
abstract contract VRFConsumerBaseV2 {
    error OnlyCoordinatorCanFulfill(address have, address want);
    address private immutable vrfCoordinator;

    constructor(address _vrfCoordinator) {
        vrfCoordinator = _vrfCoordinator;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;

    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        if (msg.sender != vrfCoordinator) {
            revert OnlyCoordinatorCanFulfill(msg.sender, vrfCoordinator);
        }
        fulfillRandomWords(requestId, randomWords);
    }
}

/**
 * @title ChainlinkFeaturedListings
 * @notice Handles VRF and Automation for featured listings selection
 */
abstract contract ChainlinkFeaturedListings is VRFConsumerBaseV2, AutomationCompatibleInterface {
    // VRF Configuration
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint32 private constant NUM_WORDS = 3;

    // Featured listings state
    uint256[] public featuredListings;
    uint256 public lastFeaturedUpdate;
    uint256 public constant FEATURED_UPDATE_INTERVAL = 1 days;
    uint256 private s_requestId;
    bool public vrfRequestPending;

    // Abstract functions to be implemented by marketplace
    function getActiveListings() external view virtual returns (uint256[] memory);
    function getOwner() external view virtual returns (address);

    // Events
    event FeaturedListingsRequested(uint256 indexed requestId, uint256 totalListings);
    event FeaturedListingsUpdated(uint256[] featuredTokenIds, uint256 timestamp);
    event RandomWordsReceived(uint256 indexed requestId, uint256[] randomWords);

    constructor(
        address _vrfCoordinator,
        bytes32 _gasLane,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_gasLane = _gasLane;
        i_subscriptionId = _subscriptionId;
        lastFeaturedUpdate = block.timestamp;
    }

    /**
     * @notice Request new featured listings using Chainlink VRF
     */
    function requestFeaturedListings() external {
        require(
            block.timestamp >= lastFeaturedUpdate + FEATURED_UPDATE_INTERVAL,
            "Too early to update featured listings"
        );
        require(!vrfRequestPending, "VRF request already pending");
        
        uint256[] memory activeListings = this.getActiveListings();
        require(activeListings.length >= 3, "Need at least 3 active listings");

        vrfRequestPending = true;
        s_requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        emit FeaturedListingsRequested(s_requestId, activeListings.length);
    }

    /**
     * @notice Emergency VRF request (owner only)
     */
    function emergencyRequestFeaturedListings() external {
        require(msg.sender == this.getOwner(), "Not owner");
        require(!vrfRequestPending, "VRF request already pending");
        
        uint256[] memory activeListings = this.getActiveListings();
        require(activeListings.length >= 3, "Need at least 3 active listings");

        vrfRequestPending = true;
        s_requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        emit FeaturedListingsRequested(s_requestId, activeListings.length);
    }

    /**
     * @notice VRF callback function
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        require(requestId == s_requestId, "Invalid request ID");
        
        vrfRequestPending = false;
        emit RandomWordsReceived(requestId, randomWords);
        
        uint256[] memory activeListings = this.getActiveListings();
        _updateFeaturedListings(activeListings, randomWords);
    }

    /**
     * @notice Internal function to update featured listings
     */
    function _updateFeaturedListings(uint256[] memory activeListings, uint256[] memory randomWords) internal {
        delete featuredListings;
        uint256 totalListings = activeListings.length;
        
        if (totalListings >= 3) {
            bool[] memory used = new bool[](totalListings);
            
            for (uint256 i = 0; i < 3; i++) {
                uint256 randomIndex;
                uint256 attempts = 0;
                
                do {
                    randomIndex = randomWords[i] % totalListings;
                    attempts++;
                } while (used[randomIndex] && attempts < totalListings);
                
                if (used[randomIndex]) {
                    for (uint256 j = 0; j < totalListings; j++) {
                        if (!used[j]) {
                            randomIndex = j;
                            break;
                        }
                    }
                }
                
                used[randomIndex] = true;
                featuredListings.push(activeListings[randomIndex]);
            }
            
            lastFeaturedUpdate = block.timestamp;
            emit FeaturedListingsUpdated(featuredListings, block.timestamp);
        }
    }

    /**
     * @notice Chainlink Automation - Check if upkeep is needed
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        uint256[] memory activeListings = this.getActiveListings();
        upkeepNeeded = (
            block.timestamp >= lastFeaturedUpdate + FEATURED_UPDATE_INTERVAL &&
            !vrfRequestPending &&
            activeListings.length >= 3
        );
        return (upkeepNeeded, "");
    }

    /**
     * @notice Chainlink Automation - Perform the upkeep
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        uint256[] memory activeListings = this.getActiveListings();
        require(
            block.timestamp >= lastFeaturedUpdate + FEATURED_UPDATE_INTERVAL,
            "Too early for upkeep"
        );
        require(!vrfRequestPending, "VRF request already pending");
        require(activeListings.length >= 3, "Not enough active listings");

        vrfRequestPending = true;
        s_requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        emit FeaturedListingsRequested(s_requestId, activeListings.length);
    }

    // View functions
    function getFeaturedListings() external view returns (uint256[] memory) {
        return featuredListings;
    }

    function canUpdateFeatured() external view returns (bool) {
        uint256[] memory activeListings = this.getActiveListings();
        return (
            block.timestamp >= lastFeaturedUpdate + FEATURED_UPDATE_INTERVAL &&
            !vrfRequestPending &&
            activeListings.length >= 3
        );
    }

    function getAutomationStatus() external view returns (
        bool needsUpkeep,
        uint256 timeSinceLastUpdate,
        uint256 timeUntilNextUpdate,
        uint256 activeListingsCount
    ) {
        uint256 currentTime = block.timestamp;
        timeSinceLastUpdate = currentTime - lastFeaturedUpdate;
        
        if (currentTime >= lastFeaturedUpdate + FEATURED_UPDATE_INTERVAL) {
            timeUntilNextUpdate = 0;
        } else {
            timeUntilNextUpdate = (lastFeaturedUpdate + FEATURED_UPDATE_INTERVAL) - currentTime;
        }
        
        uint256[] memory activeListings = this.getActiveListings();
        needsUpkeep = (
            timeUntilNextUpdate == 0 &&
            !vrfRequestPending &&
            activeListings.length >= 3
        );
        
        activeListingsCount = activeListings.length;
        return (needsUpkeep, timeSinceLastUpdate, timeUntilNextUpdate, activeListingsCount);
    }

    function getFeaturedInfo() external view returns (
        uint256[] memory tokenIds,
        uint256 lastUpdate,
        bool canUpdate
    ) {
        uint256[] memory activeListings = this.getActiveListings();
        return (
            featuredListings,
            lastFeaturedUpdate,
            block.timestamp >= lastFeaturedUpdate + FEATURED_UPDATE_INTERVAL &&
            !vrfRequestPending &&
            activeListings.length >= 3
        );
    }

    function getVRFConfig() external view returns (
        address coordinator,
        bytes32 gasLane,
        uint64 subscriptionId
    ) {
        return (address(i_vrfCoordinator), i_gasLane, i_subscriptionId);
    }

    /**
     * @notice Emergency set featured listings (owner only)
     */
    function emergencySetFeaturedListings(uint256[] calldata tokenIds) external {
        require(msg.sender == this.getOwner(), "Not owner");
        require(tokenIds.length == 3, "Must provide exactly 3 token IDs");
        
        delete featuredListings;
        for (uint256 i = 0; i < 3; i++) {
            featuredListings.push(tokenIds[i]);
        }
        
        lastFeaturedUpdate = block.timestamp;
        emit FeaturedListingsUpdated(featuredListings, block.timestamp);
    }
}