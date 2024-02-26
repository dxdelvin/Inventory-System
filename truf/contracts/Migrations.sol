// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract UserStorage {
    string public user = "apple"; // Set the initial value of user to "apple"

    function setItem(string memory _name) public {
        user = _name;
    }
}
