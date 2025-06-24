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
    
    error InvalidMetadataURI();
    error InvalidAssetType();
    error InvalidValuation();
    error InvalidAmount();

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
        require(issuerRegistry.isValidIssuer(msg.sender), "Not authorized issuer");
        
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
}