// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IssuerRegistry.sol";

contract RWAAsset is ERC1155, ReentrancyGuard {
    enum AssetType { RealEstate, Invoice, Gold, Stocks, CarbonCredit, Custom }

    struct Asset {
        address issuer;
        string metadataUri;
        AssetType assetType;
        uint256 valuation;
        uint256 maturity;
        uint256 apy;
        bool hasMaturity;
        bool hasApy;
        uint256 totalSupply;
    }

    IssuerRegistry public immutable issuerRegistry;
    mapping(uint256 => Asset) public assets;
    uint256 private _tokenIds;

    address public marketplace;
    bool private marketplaceSet;
    address public owner;

    event AssetMinted(
        uint256 indexed tokenId, 
        address indexed issuer, 
        AssetType assetType, 
        uint256 amount,
        uint256 valuation
    );
    // Events for burn operations
    event AssetBurned(uint256 indexed tokenId, address indexed account, uint256 amount);
    
    error InvalidMetadataURI();
    error InvalidAssetType();
    error InvalidValuation();
    error InvalidAmount();
    // Additional error for burn operations
    error ERC1155MissingApprovalForAll(address operator, address owner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "Only marketplace");
        _;
    }

    constructor(address _issuerRegistry) ERC1155("") {
        require(_issuerRegistry != address(0), "Invalid issuer registry");
        issuerRegistry = IssuerRegistry(_issuerRegistry);
        owner = msg.sender;
    }

    function setMarketplace(address _marketplace) external onlyOwner {
        require(!marketplaceSet, "Marketplace already set");
        require(_marketplace != address(0), "Invalid marketplace");
        marketplace = _marketplace;
        marketplaceSet = true;
    }

    function mintAsset(
        string memory metadataUri,
        uint8 assetTypeIndex,
        uint256 valuation,
        uint256 amount,
        bool hasMaturity,
        uint256 maturity,
        bool hasApy,
        uint256 apy
    ) external nonReentrant returns (uint256) {
        require(
            issuerRegistry.isValidIssuer(msg.sender) || msg.sender == marketplace, 
            "Not authorized issuer or marketplace"
        );
        
        if (bytes(metadataUri).length == 0) revert InvalidMetadataURI();
        if (assetTypeIndex > uint8(AssetType.Custom)) revert InvalidAssetType();
        if (valuation == 0) revert InvalidValuation();
        if (amount == 0) revert InvalidAmount();

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        assets[newTokenId] = Asset({
            issuer: msg.sender,
            metadataUri: metadataUri,
            assetType: AssetType(assetTypeIndex),
            valuation: valuation,
            maturity: maturity,
            apy: apy,
            hasMaturity: hasMaturity,
            hasApy: hasApy,
            totalSupply: amount
        });

        _mint(msg.sender, newTokenId, amount, "");
        emit AssetMinted(newTokenId, msg.sender, AssetType(assetTypeIndex), amount, valuation);

        return newTokenId;
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return assets[tokenId].metadataUri;
    }

    function getAsset(uint256 tokenId) external view returns (Asset memory) {
        return assets[tokenId];
    }

    function isIssuer(address account) external view returns (bool) {
        return issuerRegistry.isValidIssuer(account);
    }

    /**
     * @notice Burns tokens from an account (for CCIP cross-chain transfers)
     * @dev Only marketplace can call this function
     * @param account Address to burn tokens from
     * @param id Token ID to burn
     * @param amount Amount to burn
     */
    function burn(address account, uint256 id, uint256 amount) external onlyMarketplace {
        // Check if marketplace is approved if not the token owner
        if (account != msg.sender && !isApprovedForAll(account, msg.sender)) {
            revert ERC1155MissingApprovalForAll(msg.sender, account);
        }

        _burn(account, id, amount);
        
        // Update total supply
        assets[id].totalSupply -= amount;
        
        emit AssetBurned(id, account, amount);
    }


}