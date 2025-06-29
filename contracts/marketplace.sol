// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AssetToken} from "./AssetToken.sol";
import {CrossChainBurnAndMintERC1155} from "./CrossChainBurnAndMintERC1155.sol";
import {ChainlinkFeaturedListings} from "./chainlinkHelper.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

/**
 * @title Marketplace for AssetToken (ERC1155) with Chainlink VRF & Automation
 * @notice Optimized marketplace with automated daily featured selection
 */
contract Marketplace is ERC1155Receiver, ChainlinkFeaturedListings {
    struct Listing {
        address issuer;
        uint256 price;
        uint256 amount;
    }

    AssetToken public immutable assetToken;
    address public owner;
    
    // tokenId => Listing
    mapping(uint256 => Listing) public listings;
    // issuer => balance
    mapping(address => uint256) public proceeds;
    
    // Active token IDs that have listings
    uint256[] public activeListings;
    mapping(uint256 => uint256) public tokenIdToActiveIndex;

    // Events
    event AssetListed(address indexed issuer, uint256 indexed tokenId, uint256 price, uint256 amount);
    event AssetBoughtLocal(address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 price);
    event AssetBoughtCrossChain(address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 price, uint64 destChain);
    event ProceedsWithdrawn(address indexed issuer, uint256 amount);
    event AssetMinted(address indexed minter, uint256 indexed tokenId, uint256 amount, string tokenUri);
    event AssetBatchMinted(address indexed minter, uint256[] tokenIds, uint256[] amounts, string[] tokenUris);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyIssuer(uint256 tokenId) {
        require(listings[tokenId].issuer == msg.sender, "Not issuer");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyIssuer(uint256 tokenId) {
        require(listings[tokenId].issuer == msg.sender, "Not issuer");
        _;
    }

    constructor(
        address _assetToken,
        address _vrfCoordinator,
        bytes32 _gasLane,
        uint64 _subscriptionId
    ) ChainlinkFeaturedListings(_vrfCoordinator, _gasLane, _subscriptionId) {
        require(_assetToken != address(0), "Invalid asset token");
        assetToken = AssetToken(_assetToken);
        owner = msg.sender;
    }

    // Implementation of abstract functions from ChainlinkFeaturedListings
    function getActiveListings() external view override returns (uint256[] memory) {
        return activeListings;
    }

    function getOwner() external view override returns (address) {
        return owner;
    }

    /**
     * @notice List asset for sale. Transfers tokens from issuer to marketplace.
     * @param tokenId Token ID to list
     * @param amount Amount to list
     * @param price Price per token (in wei)
     */
    function listAsset(uint256 tokenId, uint256 amount, uint256 price) external {
        require(price > 0, "Price must be > 0");
        require(amount > 0, "Amount must be > 0");
        
        bool isNewListing = listings[tokenId].price == 0;
        
        // Transfer tokens from issuer to marketplace
        assetToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        listings[tokenId] = Listing({issuer: msg.sender, price: price, amount: amount});
        
        // Add to active listings if it's a new listing
        if (isNewListing) {
            tokenIdToActiveIndex[tokenId] = activeListings.length;
            activeListings.push(tokenId);
        }
        
        emit AssetListed(msg.sender, tokenId, price, amount);
    }

    /**
     * @notice Buy asset locally (same chain). Pays price, receives tokens.
     * @param tokenId Token ID to buy
     * @param amount Amount to buy
     */
    function buyAssetLocal(uint256 tokenId, uint256 amount) external payable {
        Listing storage listing = listings[tokenId];
        require(listing.price > 0, "Not listed");
        require(amount > 0 && amount <= listing.amount, "Invalid amount");
        uint256 totalPrice = listing.price * amount;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Transfer tokens to buyer
        assetToken.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
        
        // Update listing
        listing.amount -= amount;
        proceeds[listing.issuer] += totalPrice;
        
        // Refund excess
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        // Remove from active listings if sold out
        if (listing.amount == 0) {
            _removeFromActiveListings(tokenId);
            delete listings[tokenId];
        }
        
        emit AssetBoughtLocal(msg.sender, tokenId, amount, totalPrice);
    }

    /**
     * @notice Buy asset cross-chain. Pays price, receives tokens on destination chain.
     * @param tokenId Token ID to buy
     * @param amount Amount to buy
     * @param destChain Destination chain selector
     * @param to Recipient address on destination chain
     * @param payFeesInNative True to pay CCIP fees in native, false for LINK
     */
    function buyAssetCrossChain(
        uint256 tokenId,
        uint256 amount,
        uint64 destChain,
        address to,
        bool payFeesInNative
    ) external payable {
        Listing storage listing = listings[tokenId];
        require(listing.price > 0, "Not listed");
        require(amount > 0 && amount <= listing.amount, "Invalid amount");
        uint256 totalPrice = listing.price * amount;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Call crossChainTransferFrom on AssetToken
        CrossChainBurnAndMintERC1155.PayFeesIn payFees = payFeesInNative ? 
            CrossChainBurnAndMintERC1155.PayFeesIn.Native : 
            CrossChainBurnAndMintERC1155.PayFeesIn.LINK;
        assetToken.crossChainTransferFrom(address(this), to, tokenId, amount, "", destChain, payFees);
        
        // Update listing
        listing.amount -= amount;
        proceeds[listing.issuer] += totalPrice;
        
        // Refund excess
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        // Remove from active listings if sold out
        if (listing.amount == 0) {
            _removeFromActiveListings(tokenId);
            delete listings[tokenId];
        }
        
        emit AssetBoughtCrossChain(msg.sender, tokenId, amount, totalPrice, destChain);
    }

    /**
     * @notice Internal function to remove token from active listings array
     * @param tokenId Token ID to remove
     */
    function _removeFromActiveListings(uint256 tokenId) internal {
        uint256 index = tokenIdToActiveIndex[tokenId];
        uint256 lastIndex = activeListings.length - 1;
        
        if (index != lastIndex) {
            // Move last element to the position of element to delete
            uint256 lastTokenId = activeListings[lastIndex];
            activeListings[index] = lastTokenId;
            tokenIdToActiveIndex[lastTokenId] = index;
        }
        
        // Remove last element
        activeListings.pop();
        delete tokenIdToActiveIndex[tokenId];
    }

    /**
     * @notice Returns marketplace address for manual approval on AssetToken
     * @dev Call AssetToken.setApprovalForAll(this_address, true) directly
     */
    function getMarketplaceAddress() external view returns (address) {
        return address(this);
    }

    /**
     * @notice Helper function - user must call AssetToken.setApprovalForAll directly
     * @dev This function just returns instructions, doesn't actually set approval
     */
    function setApproval(bool approved) external {
        assetToken.setApprovalForAll(address(assetToken), approved);
    }

    /**
     * @notice Issuer withdraws collected proceeds.
     */
    function withdrawProceeds() external {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "No proceeds");
        proceeds[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit ProceedsWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Mint new asset tokens to caller's account
     * @param tokenId Token ID to mint
     * @param amount Amount to mint
     * @param tokenUri Metadata URI for the token
     */
    function mintAsset(uint256 tokenId, uint256 amount, string calldata tokenUri) external {
        require(amount > 0, "Amount must be > 0");
        require(bytes(tokenUri).length > 0, "Token URI required");
        
        // Mint tokens directly to the caller
        assetToken.mint(msg.sender, tokenId, amount, "", tokenUri);
        
        emit AssetMinted(msg.sender, tokenId, amount, tokenUri);
    }

    /**
     * @notice Mint multiple asset tokens to caller's account in a single transaction
     * @param tokenIds Array of token IDs to mint
     * @param amounts Array of amounts to mint for each token ID
     * @param tokenUris Array of metadata URIs for each token
     */
    function mintAssetBatch(
        uint256[] calldata tokenIds, 
        uint256[] calldata amounts, 
        string[] calldata tokenUris
    ) external {
        require(tokenIds.length == amounts.length, "Arrays length mismatch");
        require(tokenIds.length == tokenUris.length, "Arrays length mismatch");
        require(tokenIds.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Amount must be > 0");
            require(bytes(tokenUris[i]).length > 0, "Token URI required");
        }
        
        // Mint tokens in batch directly to the caller
        assetToken.mintBatch(msg.sender, tokenIds, amounts, "", tokenUris);
        
        emit AssetBatchMinted(msg.sender, tokenIds, amounts, tokenUris);
    }

    /**
     * @notice Handle the receipt of a single ERC1155 token type.
     * @dev This function is called at the end of a `safeTransferFrom` after the balance has been updated.
     */
    function onERC1155Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*id*/,
        uint256 /*value*/,
        bytes calldata /*data*/
    ) public virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    /**
     * @notice Handle the receipt of multiple ERC1155 token types.
     * @dev This function is called at the end of a `safeBatchTransferFrom` after the balances have been updated.
     */
    function onERC1155BatchReceived(
        address /*operator*/,
        address /*from*/,
        uint256[] calldata /*ids*/,
        uint256[] calldata /*values*/,
        bytes calldata /*data*/
    ) public virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @notice Transfer ownership to new address (owner only)
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}
