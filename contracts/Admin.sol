// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Admin is Ownable {
    address private _admin;
    bool public paused;
    
    error NotAdmin();
    error AdminAlreadySet();
    error AlreadyPaused();
    error AlreadyActive();

    event AdminSet(address admin);
    event PlatformPaused(address admin);
    event PlatformUnpaused(address admin);

    constructor() Ownable(msg.sender) {
        _admin = address(0);
        paused = false;
    }

    modifier onlyAdmin() {
        if (msg.sender != _admin) revert NotAdmin();
        _;
    }

    
}