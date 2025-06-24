// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Admin.sol";

contract IssuerRegistry {
    Admin public immutable adminContract;

    struct IssuerInfo {
        address issuer;
        string name;
        string metadataUri;
        bool active;
        bool hasIssuerCap;
    }

    mapping(address => IssuerInfo) public issuers;
    address[] public issuerList;

    event IssuerAdded(address indexed issuer, string name);
    event IssuerDeactivated(address indexed issuer);
    event IssuerCapGranted(address indexed issuer);

    modifier onlyAdmin() {
        require(msg.sender == adminContract.getAdmin(), "Not admin");
        _;
    }

    constructor(address _adminContract) {
        require(_adminContract != address(0), "Invalid admin contract");
        adminContract = Admin(_adminContract);
    }

    function addIssuer(
        address issuer,
        string memory name,
        string memory metadataUri
    ) external onlyAdmin {
        require(!issuers[issuer].active, "Issuer already exists");
        
        issuers[issuer] = IssuerInfo({
            issuer: issuer,
            name: name,
            metadataUri: metadataUri,
            active: true,
            hasIssuerCap: false
        });
        
        issuerList.push(issuer);
        emit IssuerAdded(issuer, name);
    }

    function grantIssuerCap(address issuer) external onlyAdmin {
        require(issuers[issuer].active, "Issuer not active");
        require(!issuers[issuer].hasIssuerCap, "Already has issuer cap");
        
        issuers[issuer].hasIssuerCap = true;
        emit IssuerCapGranted(issuer);
    }

    
}