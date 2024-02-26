const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./database');
const Session = require('./session');
const dotenv = require('dotenv');
const {OpenAI} = require("openai");
const multer  = require('multer');
const exifParser = require('exif-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const exif = require('exif');
const mongoose = require('mongoose');
const crypto = require('crypto');
const twilio = require('twilio');
const { Web3 } = require('web3');


dotenv.config();

(async () => {
  await sequelize.sync();
})();



const app = express();


app.use(session({
  secret: 'fawef#@YR&', 
  resave:false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
    tableName: 'sessions', 
  }),
}));  


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));


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



const contractAddressForItems = '0x615eE4c8843B4438D30cf9B1cef1db4016e86BfE';
const contractAbiItems = [
{
"inputs": [],
"name": "item_name",
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
];
// Create a contract instance
const contractItems = new web3.eth.Contract(contractAbiItems, contractAddressForItems);

async function getItemsFromBlock(blockNumber) {
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
      if (tx.to.toLowerCase() === contractAddressForItems.toLowerCase()) {
        const userString = web3.utils.hexToUtf8(tx.input);
        users.push({ 'item_name': userString });
      }
    }

    return users;
  } catch (error) {
    console.error(`Error reading user from block ${blockNumber}:`, error);
    return null; // Return null for user in case of error
  }
}



app.get('/apiitems', async (req, res) => {
  try {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    console.log("Latest Block Number:", latestBlockNumber);

    let users = [];
    for (let i = 0; i <= latestBlockNumber; i++) {
      const user = await getItemsFromBlock(i);
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





// app.get('/', async (req, res) => {
//   try {
//     const latestBlockNumber = await web3.eth.getBlockNumber();
//     console.log("Latest Block Number:", latestBlockNumber);

//     let users = [];
//     for (let i = 0; i <= latestBlockNumber; i++) {
//       const user = await getUserFromBlock(i);
//       if (user && user.length > 0) {
//         users = users.concat(...user);
//       }
//     }

//     res.json(users);
//   } catch (error) {
//     console.error("Error reading data:", error);
//     res.status(500).send('Internal Server Error');
//   }
// });
let apiUsersData = []; // Variable to store fetched data

// Endpoint to fetch data from the blockchain
app.get('/apiusers', async (req, res) => {
  try {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    console.log("Latest Block Number:", latestBlockNumber);

    let users = [];
    for (let i = 0; i <= latestBlockNumber; i++) {
      let a = ""
      const user = await getUserFromBlock(i);
      if (user && user.length > 0) {
        users = users.concat(...user);
      }
    }

    // Store the fetched data in the variable
    apiUsersData = users;

    res.json(users);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).send('Internal Server Error');
  }
});

// Middleware to parse urlencoded bodies

app.use(bodyParser.json());

// POST endpoint to handle form submission

let poh
app.post('/payload', async (req, res) => {
  const { rfidInput } = req.body;
  console.log('Received RFID:', rfidInput)
  try {
    // Fetch user data from external API
    const response = await axios.get('http://172.28.144.1:3000/apiusers');
    const apiUsers = response.data; // Use const instead of let for apiUsers

    // Parse and filter user data
    const users = [];
    for (let i = 0; i < apiUsers.length; i++) {
      const matchResult = apiUsers[i].user.match(/\{.*\}/);
      if (matchResult) {
        const jsonString = matchResult[0].replace('{[{', '{');
        console.log(jsonString);
        const extractedData = JSON.parse(jsonString);
        if(extractedData.rfid != "0000000000"){
          users.push(extractedData);
        }
        console.log("----------------------------------")
        console.log(users)
      } else {
        console.log(`No match found for item ${i + 1}`);
      }
    }

    // Check if any valid users were extracted
    if (users.length > 0) {
      // Filter data to remove entries with undefined or empty RFID
      const filteredData = users.filter(item => item.rfid !== undefined && item.rfid !== "");

      // Check if the filtered data is available
      if (filteredData.length > 0) {
        // Check if the provided ID exists in the filtered data
        const user = filteredData.find(user => user.rfid == rfidInput);
        console.log("User:", user);
        if (user) {
          // User exists, redirect to '/user'
          res.redirect('/user');

          return; // Return to prevent further execution
          
        } else {
          res.redirect('/new_farmer');
          return; // Return to prevent further execution
          
        }
      } else {
        // No valid RFID values found, return an error message
        res.json({ success: false, message: 'No valid user data available' });
        // res.redirect('/new_farmer')
      }
    } else {
      // No user data extracted, return an error message
      res.json({ success: false, message: 'No user data available' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle error while fetching data from the API
    res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
});


app.post('/payload_trader', async (req, res) => {
  const { rfidInput, metaAddr } = req.body;
  // user.metaAddr
  console.log('Received RFID:', metaAddr);
  
  try {
    // Fetch user data from external API
    const response = await axios.get('http://172.28.144.1:3000/apiusers');
    const apiUsers = response.data; // Use const instead of let for apiUsers

    // Parse and filter user data
    const users = [];
    for (let i = 0; i < apiUsers.length; i++) {
      const matchResult = apiUsers[i].user.match(/\{.*\}/);
      if (matchResult) {
        const jsonString = matchResult[0].replace('{[{', '{');
        console.log(jsonString);
        const extractedData = JSON.parse(jsonString);
        if(extractedData.rfid == "0000000000"){
          users.push(extractedData);
        }
        // console.log("----------------------------------")
        // console.log(users)
      } else {
        console.log(`No match found for item ${i + 1}`);
      }
    }

    // Check if any valid users were extracted
    if (users.length > 0) {
      // Filter data to remove entries with undefined or empty RFID
      const filteredData = users.filter(item => item.rfid !== undefined && item.rfid !== "");

      // Check if the filtered data is available
      if (filteredData.length > 0) {
        // Check if the provided RFID exists in the filtered data
        const user = filteredData.find(user => user.sender == metaAddr);
        console.log("User:", user);
        if (user) {
          // Check if the MetaMask address exists in the user data
          if (user.sender == metaAddr) {
            // MetaMask address exists, redirect to '/user'
            res.redirect('/trader');
            return;
             // Return to prevent further execution
          } else {
            // MetaMask address does not match, handle accordingly
            res.redirect('/new_trader');
            return; // Return to prevent further execution
          }
        } else {
          res.redirect('/new_trader');
          return; // Return to prevent further execution
        }
      } else {
        // No valid RFID values found, return an error message
        res.json({ success: false, message: 'No valid user data available' });
        // res.redirect('/new_farmer')
      }
    } else {
      // No user data extracted, return an error message
      res.json({ success: false, message: 'No user data available' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle error while fetching data from the API
    res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
});

const accountSid = 'ACb0fadebfe86f9c859ef7d9f33734a43f';
const authToken = '5551d840dbb2ca8945f889d4e80cb969';
const twilioPhoneNumber = '+14157277405';


app.get('/cart', async (req, res) => {
  try {
    const data = await fs.readFile('./img/resources/cart.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/updateCart', async (req, res) => {
  try {
    const cartItems = req.body;
    const jsonData = JSON.stringify(cartItems, null, 2);
    await fs.writeFile('./img/resources/cart.json', jsonData);
    res.send('Cart updated successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/submitproduct', (req, res) => {
  try {
    const { productName, productCategory, totalStock, priceInGems, LeadTime, SalesVolume, Restocking, ReorderQuantity, InventoryLevel } = req.body;

    let currentData = JSON.parse(fs.readFileSync('public/img/resources/output.json', 'utf-8'));

    const jsonData = {
      "Item ID": "002",
      "img": "./img/images/images/carrot.png",
      "Item Name": productName,
      "Category": productCategory,
      "Unit Price (Gems)": priceInGems,
      "Sales Volume (Month)": SalesVolume,
      "Lead Time (Days)": LeadTime,
      "Reorder Quantity": ReorderQuantity,
      "Inventory Level": InventoryLevel,
      "Restocking": Restocking,
    };

    currentData.push(jsonData);

    fs.writeFileSync('public/img/resources/output.json', JSON.stringify(currentData, null, 2), 'utf-8');

    res.status(200).render('user');
  } catch (error) {
    console.error('Error submitting product:', error);
    res.status(500).send('Internal Server Error');
  }
    
   
});

app.get('/',(req,res)=>{
    res.render("homepage")
})
app.get('/viewcart',(req,res)=>{
    res.render("viewcart")
})

app.get('/translation',(req,res)=>{
  res.render("translation")
})

app.get('/meta',(req,res)=>{
  res.render("meta")
})
app.get('/new_farmer',(req,res)=>{
  res.render("new_farmer")
})

app.get('/new_trader',(req,res)=>{
  res.render("new_trader")
})
app.get('/read',(req,res)=>{
  res.render("read")
})
app.get('/about',(req,res)=>{
  res.render("about")
})
app.get('/features',(req,res)=>{
  res.render("features")
})

app.get('/addproduct',(req,res)=>{
    res.render("product")
})
app.get('/trader',(req,res)=>{
    res.render("trader")
})


app.get('/hardcore',(req,res)=>{
  res.render("hardcore")
})

app.get('/trader_login',(req,res)=>{
  res.render("trader_login")
})



app.get('/user', (req, res) => {

    res.render('user' );
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
        console.error('Error destroying session:', err);
    }
    res.redirect('/login');
});
});

app.get('/chatinterface', (req, res) => {
  res.render('chatinterface');
});


app.post('/enter', async(req,res)=>{
  const email = req.body.email;
  const pass = req.body.pass;

  await fetch(`https://gaqjyqhexaqsegidaoxm3dwx4i0blxwx.lambda-url.ap-south-1.on.aws/?email=${email}&otp=${pass}`)
  .then(response=>response.json())
  .then(data => {
      const message = data.message;
      console.log(message)
      if (message == 'OTP verified successfully!') {
        req.session.email = email;
        res.redirect(`/user/${email}`); 
        } else {
        res.redirect('/');
        }
    
  })
})


// node --version # Should be >= 18
// npm install @google/generative-ai

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "AIzaSyBYKoUXt0MApaNr6hXcbVDF_DONlEhmZxI";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const chat = model.startChat({
  generationConfig,
  safetySettings,
  history: [
    {
      role: "user",
      parts: [{ text: "hi"}],
    },
    {
      role: "model",
      parts: [{ text: "Hello! How may I assist you today?"}],
    },
  ],
});

async function runChat(userInput) {
  console.log("runnin chat")
  const result = await chat.sendMessage(userInput);
  const response = result.response;
  console.log(response.text())
  return response.text();
}


runChat("hiii");

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Endpoint to send a message to the chatbot
// Endpoint to send a message to the chatbot
app.post('/sendMessage', async (req, res) => {
  const userMessage = req.body.message;

  // Wait for the response from the chat function
  const botResponse = await runChat(userMessage);

  // Send the response back to the client
  res.json({ message: botResponse });
});



app.use(express.json());



app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});
