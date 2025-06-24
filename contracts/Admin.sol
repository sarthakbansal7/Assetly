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

    function setAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), "Invalid admin address");
        if (_admin != address(0)) revert AdminAlreadySet();
        _admin = newAdmin;
        emit AdminSet(newAdmin);
    }

    function pausePlatform() external onlyAdmin {
        if (paused) revert AlreadyPaused();
        paused = true;
        emit PlatformPaused(msg.sender);
    }

    function unpausePlatform() external onlyAdmin {
        if (!paused) revert AlreadyActive();
        paused = false;
        emit PlatformUnpaused(msg.sender);
    }

    function getAdmin() public view returns (address) {
        return _admin;
    }
}