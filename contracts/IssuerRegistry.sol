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

    
}