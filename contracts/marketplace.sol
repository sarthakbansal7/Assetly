// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AssetToken} from "./AssetToken.sol";

/**
 * @title Marketplace for AssetToken (ERC1155)
 * @notice Only supports listing, local buy, cross-chain buy, and approval management.
 */
contract Marketplace {
    struct Listing {
        address issuer;
        uint256 price;
        uint256 amount;
    }

    AssetToken public immutable assetToken;
    // tokenId => Listing
    mapping(uint256 => Listing) public listings;
    // issuer => balance
    mapping(address => uint256) public proceeds;

    event AssetListed(address indexed issuer, uint256 indexed tokenId, uint256 price, uint256 amount);
    event AssetBoughtLocal(address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 price);
    event AssetBoughtCrossChain(address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 price, uint64 destChain);
    event ProceedsWithdrawn(address indexed issuer, uint256 amount);

    modifier onlyIssuer(uint256 tokenId) {
        require(listings[tokenId].issuer == msg.sender, "Not issuer");
        _;
    }

    constructor(address _assetToken) {
        require(_assetToken != address(0), "Invalid asset token");
        assetToken = AssetToken(_assetToken);
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
        // Transfer tokens from issuer to marketplace
        assetToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        listings[tokenId] = Listing({issuer: msg.sender, price: price, amount: amount});
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
        // Store proceeds for issuer
        proceeds[listing.issuer] += totalPrice;
        // Refund excess
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        // Remove listing if sold out
        if (listing.amount == 0) {
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
        AssetToken.PayFeesIn payFees = payFeesInNative ? AssetToken.PayFeesIn.Native : AssetToken.PayFeesIn.LINK;
        assetToken.crossChainTransferFrom(address(this), to, tokenId, amount, "", destChain, payFees);
        // Update listing
        listing.amount -= amount;
        proceeds[listing.issuer] += totalPrice;
        // Refund excess
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        // Remove listing if sold out
        if (listing.amount == 0) {
            delete listings[tokenId];
        }
        emit AssetBoughtCrossChain(msg.sender, tokenId, amount, totalPrice, destChain);
    }

    /**
     * @notice Set approval for marketplace to transfer tokens on behalf of issuer.
     * @param approved True to approve, false to revoke
     */
    function setApproval(bool approved) external {
        assetToken.setApprovalForAll(address(this), approved);
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
}
