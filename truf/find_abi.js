const fs = require('fs');
const path = require('path');

const contractArtifact = require('./build/contracts/DataStorage.json');
const contractAbi = contractArtifact.abi;

// Specify the path to save the JSON file
const abiFilePath = path.join(__dirname, 'contract_abi.json');

// Write the ABI to the JSON file
fs.writeFileSync(abiFilePath, JSON.stringify(contractAbi, null, 2));

console.log('ABI has been saved to:', abiFilePath);
