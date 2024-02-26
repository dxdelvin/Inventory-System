// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DataStorage {
    string public item_name = "apple"; // Set the initial value of item_name to "apple"

    function setItem(string memory _name) public {
        item_name = _name;
    }
}
