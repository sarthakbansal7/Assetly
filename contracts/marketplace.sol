// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWAAsset.sol";
import "./Admin.sol";
import "./IssuerRegistry.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 timestamp;
        bool isActive;
    }

    Admin public immutable admin;
    RWAAsset public immutable rwaAsset;
    IssuerRegistry public immutable issuerRegistry;
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => bool) private _assetSold;
    mapping(uint256 => mapping(address => uint256)) private _pendingRefunds;
    
    event AssetListed(uint256 indexed tokenId, address seller, uint256 price);
    event AssetSold(uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address seller);

    constructor(
        address _admin, 
        address _rwaAsset,
        address _issuerRegistry
    ) {
        admin = Admin(_admin);
        rwaAsset = RWAAsset(_rwaAsset);
        issuerRegistry = IssuerRegistry(_issuerRegistry);
    }

    modifier notPaused() {
        require(!admin.paused(), "Marketplace is paused");
        _;
    }

    function listAsset(uint256 tokenId, uint256 price) external notPaused {
        require(rwaAsset.ownerOf(tokenId) == msg.sender, "Not owner of token");
        require(issuerRegistry.isValidIssuer(msg.sender), "Not a valid issuer");
        require(rwaAsset.getApproved(tokenId) == address(this), "Marketplace not approved");
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            timestamp: block.timestamp,
            isActive: true
        });

        emit AssetListed(tokenId, msg.sender, price);
    }

    error AssetAlreadySold();
    error InvalidBuyer();
    error RefundFailed();

    function buyAsset(uint256 tokenId) external payable notPaused nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own asset");
        require(msg.sender != address(0), "Invalid buyer address");
        
        // Check if asset has already been sold
        if (_assetSold[tokenId]) revert AssetAlreadySold();

        // Mark asset as sold before making transfers
        listing.isActive = false;
        _assetSold[tokenId] = true;

        // Ensure the seller still owns the token
        require(rwaAsset.ownerOf(tokenId) == listing.seller, "Seller no longer owns asset");
        
        // Calculate refund if any
        uint256 refundAmount = msg.value - listing.price;
        
        // Transfer token first (following CEI pattern)
        rwaAsset.safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: listing.price}("");
        require(success, "Payment to seller failed");
        
        // Handle refund if necessary
        if (refundAmount > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: refundAmount}("");
            if (!refundSuccess) {
                // Store failed refund for later withdrawal
                _pendingRefunds[tokenId][msg.sender] = refundAmount;
            }
        }

        emit AssetSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    // Add function for claiming pending refunds
    function claimRefund(uint256 tokenId) external nonReentrant {
        uint256 refundAmount = _pendingRefunds[tokenId][msg.sender];
        require(refundAmount > 0, "No refund available");
        
        _pendingRefunds[tokenId][msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) revert RefundFailed();
    }

    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;
        emit ListingCancelled(tokenId, msg.sender);
    }
}