// interactWithContract.js
const DataStorage = artifacts.require("DataStorage");

module.exports = async function(callback) {
  try {
    // Load the deployed contract
    const dataStorageInstance = await DataStorage.deployed();

    // Set the item_name
    await dataStorageInstance.setItem("apple");

    // Get the item_name
    const itemName = await dataStorageInstance.item_name();
    console.log("Item Name:", itemName);
  } catch (error) {
    console.error(error);
  }
  callback();
};
