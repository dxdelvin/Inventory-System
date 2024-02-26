// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserAuthentication {
    // Mapping to store user addresses and their registration status
    mapping(address => bool) public registeredUsers;

    // Event to log user registration
    event UserRegistered(address indexed user);

    // Modifier to restrict access to registered users only
    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    // Function to register a user
    function registerUser() external {
        registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    // Function to authenticate a registered user
    function authenticate() external view onlyRegistered returns (bool) {
        return true;
    }
}
