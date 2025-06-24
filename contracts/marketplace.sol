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
    mapping(address => uint256[]) private _ownedAssets;
    
    event AssetListed(uint256 indexed tokenId, address seller, uint256 price, uint256 amount);
    event AssetSold(uint256 indexed tokenId, address seller, address buyer, uint256 price, uint256 amount);
    event AssetSoldBack(uint256 indexed tokenId, address seller, uint256 price, uint256 amount);
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

    function listAsset(uint256 tokenId, uint256 price, uint256 amount) external notPaused {
        require(rwaAsset.balanceOf(msg.sender,tokenId) >= amount, "Not enough tokens");
        require(issuerRegistry.isValidIssuer(msg.sender), "Not a valid issuer");
        require(rwaAsset.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");
        require(amount > 0, "Amount must be > 0");
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            timestamp: block.timestamp,
            isActive: true
        });
        emit AssetListed(tokenId, msg.sender, price, amount);
    }

    error AssetAlreadySold();
    error InvalidBuyer();
    error RefundFailed();

    function buyAsset(uint256 tokenId, uint256 amount) external payable notPaused nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy own asset");
        require(msg.sender != address(0), "Invalid buyer address");
        require(amount > 0, "Amount must be > 0");
        require(rwaAsset.balanceOf(listing.seller, tokenId) >= amount, "Seller does not have enough tokens");
        uint256 totalPrice = listing.price * amount;
        require(msg.value >= totalPrice, "Insufficient payment");
        if (_assetSold[tokenId]) revert AssetAlreadySold();
        // Mark asset as sold before making transfers
        // If you want to allow partial sales, remove this line:
        // listing.isActive = false;
        // _assetSold[tokenId] = true;
        // Transfer tokens to buyer
        rwaAsset.safeTransferFrom(listing.seller, msg.sender, tokenId, amount, "");
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: totalPrice}("");
        require(success, "Payment to seller failed");
        // Refund excess
        uint256 refundAmount = msg.value - totalPrice;
        if (refundAmount > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: refundAmount}("");
            if (!refundSuccess) {
                _pendingRefunds[tokenId][msg.sender] = refundAmount;
            }
        }
        // Track buyer's ownership
        _ownedAssets[msg.sender].push(tokenId);
        emit AssetSold(tokenId, listing.seller, msg.sender, listing.price, amount);
    }

    function sellAsset(uint256 tokenId, uint256 amount) external notPaused nonReentrant {
        require(rwaAsset.balanceOf(msg.sender, tokenId) >= amount, "Not enough tokens to sell");
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        uint256 totalPrice = listing.price * amount;
        // Transfer tokens from seller to contract (or burn, or hold)
        rwaAsset.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        // Pay seller
        (bool success, ) = payable(msg.sender).call{value: totalPrice}("");
        require(success, "Payment to seller failed");
        emit AssetSoldBack(tokenId, msg.sender, listing.price, amount);
    }

    function claimRefund(uint256 tokenId) external nonReentrant {
        uint256 refundAmount = _pendingRefunds[tokenId][msg.sender];
        require(refundAmount > 0, "No refund available");
        _pendingRefunds[tokenId][msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");
    }

    function getAssetsOf(address owner) external view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory tokenIds = _ownedAssets[owner];
        uint256[] memory balances = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            balances[i] = rwaAsset.balanceOf(owner, tokenIds[i]);
        }
        return (tokenIds, balances);
    }

    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;
        emit ListingCancelled(tokenId, msg.sender);
    }
}