const express = require('express');
const { Web3 } = require('web3');

const app = express();

// Connect to the local blockchain provider (Ganache)
const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

// Define the contract ABI (Application Binary Interface)
// Define the contract ABI (Application Binary Interface)
const contractAddress = '0xe7559f74E37F48DfAF5f04313844D786bd385D28';
const contractAbi = [
  {
    "inputs": [],
    "name": "user",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "setItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
// Create a contract instance
const contract = new web3.eth.Contract(contractAbi, contractAddress);

async function getUserFromBlock(blockNumber) {
  try {
    const block = await web3.eth.getBlock(blockNumber);
    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    if (!block.transactions || block.transactions.length === 0) {
      console.warn(`No transactions found in block ${blockNumber}`);
      return null; // No transactions, return null for user
    }

    const users = [];
    for (let txHash of block.transactions) {
      const tx = await web3.eth.getTransaction(txHash);
      if (!tx || !tx.input) {
        console.warn(`No transaction input found for transaction ${txHash} in block ${blockNumber}`);
        continue;
      }

      // Check if the transaction is related to the specific contract address
      if (tx.to.toLowerCase() === contractAddress.toLowerCase()) {
        const userString = web3.utils.hexToUtf8(tx.input);
        users.push({ 'user': userString });
      }
    }

    return users;
  } catch (error) {
    console.error(`Error reading user from block ${blockNumber}:`, error);
    return null; // Return null for user in case of error
  }
}



app.get('/', async (req, res) => {
  try {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    console.log("Latest Block Number:", latestBlockNumber);

    let users = [];
    for (let i = 0; i <= latestBlockNumber; i++) {
      const user = await getUserFromBlock(i);
      if (user && user.length > 0) {
        users = users.concat(...user);
      }
    }

    res.json(users);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 8815;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});