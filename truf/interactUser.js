// interactWithContract.js
const UserStorage = artifacts.require("UserStorage");

module.exports = async function(callback) {
  try {
    // Load the deployed contract
    const UserStorageInstance = await UserStorage.deployed();

    // Set the user
    await UserStorageInstance.setItem("apple");

    // Get the user
    const itemName = await UserStorageInstance.user();
    console.log("Item Name:", itemName);
  } catch (error) {
    console.error(error);
  }
  callback();
};



