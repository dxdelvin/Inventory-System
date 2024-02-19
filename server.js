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

app.get('/login',(req,res)=>{
  if (req.session.email) {
    email = req.session.email
    res.redirect(`user/${email}`)
} else {
    res.render("email")
}
})

app.post('/login/otp', async (req, res) => {
  const email = req.body.email;
  await fetch(`https://lbqn3amkemogpqcxzqnbvmlqsm0knjff.lambda-url.ap-south-1.on.aws/?email=${email}`)
  .then(response => response.text()) 
  .then(data => {
    console.log(data);
  })
  await res.render('otp', {email:email})
  
});

app.get('/',(req,res)=>{
    res.render("homepage")
})

app.get('/geotag/add',(req,res)=>{
    res.render("addgeotag")
})
app.get('/geotag/extract',(req,res)=>{
    res.render("extractgeotag.ejs")
})





app.get('/user/:email', (req, res) => {
  const email = req.params.email;
  if (email === req.session.email) {
      res.render('user', { email: email });
  } else {
      res.redirect('/');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
        console.error('Error destroying session:', err);
    }
    res.redirect('/login');
});
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

app.get('/myreports', (req, res) =>{
  res.render('myreports')
});



app.post('/extract', async (req, res) => {
    const imageUrl = req.body.imageUrl;
    const tempPath = path.join(__dirname, 'temp.jpg');


    // Download the image
    const axios = require('axios');
    const writer = fs.createWriteStream(tempPath);
    const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);

    writer.on('finish', async () => {
        try {
            const data = await exif.parse(tempPath);
            const gps = data.gps;

            if (gps) {
                const latitude = gps.GPSLatitude;
                const longitude = gps.GPSLongitude;
                res.send(`Latitude: ${latitude}, Longitude: ${longitude}`);
            } else {
                res.send('No GPS coordinates found in the image.');
            }
        } catch (error) {
            console.error('Error extracting GPS coordinates:', error);
            res.send('Error extracting GPS coordinates. Please try again.');
        } finally {
            // Delete the temporary file
            fs.unlinkSync(tempPath);
        }
    });
});


// Reporting SEction
app.get('/report',(req,res)=>{
  res.render("report")
})

let m = ""

app.get('/admin',(req,res)=>{
  res.render("admin", {m:m})
})

let safeMessage = [];

app.post('/admin/login', (req, res) => {
  const { user, password } = req.body;
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (user === adminUser && password === adminPassword) {
      // console.log("in")
      res.render('adminView', { message: safeMessage });
  } else {
    // console.log("out")
    res.render('admin',{m:"Try Again"})
  }
});

app.post('/getMessage',(req,res)=>{
  const message = req.body.safeMessage;
  safeMessage.push(message);
  setTimeout(()=>{res.redirect('/')},5000)
})




function imgRec(imageLink, input){
  // Replace 'your-api-key' with your actual OpenAI API key
  const apiKey = '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';
  
  const openai = new OpenAI({"apiKey": apiKey});
  
    console.log("is this image related to "+input+"? return true or false")
    async function main() {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "problems in this image?" },
              {
                type: "image_url",
                image_url: {
                  "url": "https://firebasestorage.googleapis.com/v0/b/loyalty-422e0.appspot.com/o/VbbT4eZfLd%2Fd88wGhys0ii?alt=media",
                },
              },
            ],
          },
        ],
      });
      let descByGpt = response.choices[0].message.content
      console.log(descByGpt)
      

      async function generateCompletion(prompt) {

        try {
            // Generate completion
            const completion = await openai.chat.completions.create ({
                model: "gpt-3.5-turbo",
                messages: [{"role": "system", "content": prompt}],
            });
    
            // Return the generated completion
            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating completion:', error);
            return null;
        }
    }
          // Example usage:
    (async (res,req) => {
      const prompt = "compare two prompts and check if they are even if a little bit similar" + descByGpt + " and "+ input + ", return true or false only.";
      let outputofgen = await generateCompletion(prompt);
      console.log(outputofgen)
      if (outputofgen.toLocaleLowerCase().search("true")){
          console.log("Success")
      }else{
        console.log("Failure")
      }
    })();


    }
    main();
  }
  

app.use(bodyParser.json());

app.post('/imageDetails', (req, res) => {
  // Get the base64-encoded image data from the request body
  const imageData = req.body.imageLink;
  
  getImageBase64(imageData)
  .then(base64 => {
      // Decode base64 data to a Buffer
    const imageBuffer = Buffer.from(base64, 'base64');

    exif(imageBuffer, (error, metadata) => {
        if (error) {
            console.error('Error reading Exif data:', error);
            res.status(500).json({ error: 'Error reading Exif data' });
        } else {
            res.json({ metadata });
        }
    });
    // console.log('Base64 representation of the image:', base64);
    // You can use the base64 data as needed
  })
  .catch(err => {
    // Handle errors
    console.error(err);
  });



});


async function getImageBase64(imageUrl) {
  try {
    // Fetch image using Axios
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Convert the image buffer to base64
    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    return base64;
  } catch (error) {
    console.error('Error fetching or converting the image:', error.message);
    throw error;
  }
}


function encrypt(text, shift) {
  let result = '';

  for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);

      if (charCode >= 65 && charCode <= 90) { // Uppercase letters
          result += String.fromCharCode((charCode - 65 + shift) % 26 + 65);
      } else if (charCode >= 97 && charCode <= 122) { // Lowercase letters
          result += String.fromCharCode((charCode - 97 + shift) % 26 + 97);
      } else {
          result += text[i]; // Non-alphabetic characters
      }
  }

  return result;
}

const shiftAmount = 3;


// Function to decrypt text using Caesar cipher
function decrypt(ciphertext, shift) {
  return encrypt(ciphertext, 26 - shift); // Decryption is the same as encryption with the opposite shift
}


// console.log(unhashText("6f995c4ff2eaec8ff59935c607b033ba87ae10c9ed611184f60282af12bbcbee"))

// Replace the connection string with your own MongoDB Atlas connection string
const uri = "mongodb+srv://akshat:9UNe7MvwlI5aOVJP@cluster0.d4digua.mongodb.net/financeapp?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// Define a Mongoose schema for your "requests" collection
const requestSchema = new mongoose.Schema({
  enquiry_name: String,
  email: { type: String, default: "anonynomus@anony.com" },
  enquiry: String,
  image_link: String,
  report_category: String,
  likes: { type: Number, default: 0 },
  users_liked: { type: [String], default: [] }
});

// Create a Mongoose model based on the schema
const Request = mongoose.model('requests', requestSchema);


app.use(express.json());

app.post('/saveDataToDb', async (req, res) => {
  try {
    // Get data from the request body
    const { enquiry_name, enquiry, image_link, report_category } = req.body;
    let  email = req.session.email
    email = encrypt(email, shiftAmount)
    console.log(email)

    let newRequest = new Request({
      enquiry_name,
      enquiry,
      image_link,
      report_category
    });

    // Create a new document and save it to the "requests" collection
    if(email){
      newRequest.email = email
    }

    // Add usernames to the users_liked array
    // newRequest.users_liked.push("username1", "username2");

    // Save the document to the database
    const savedRequest = await newRequest.save();

    console.log('Request saved successfully:', savedRequest);
    res.status(201).json({ message: 'Request saved successfully', data: savedRequest });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/getRequests', async (req, res) => {
  try {
    // Retrieve all documents from the "requests" collection
    const requests = await Request.find();

    // Unhash (decode) email addresses in each request
    const decodedRequests = requests.map(request => {
      return {
        ...request.toObject(),
        // Assuming 'email' is the property containing the hashed email address
        email: decrypt(request.email, shiftAmount),
      };
    });

    console.log('Requests retrieved successfully:', decodedRequests);
    res.status(200).json(decodedRequests);
  } catch (error) {
    console.error('Error retrieving requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  // -------------------------
// Use body-parser middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Define a route to handle POST requests with two inputs
app.post('/processInput', (req, res) => {
  // Extract input data from the request body
  const input1 = req.body.enquiry_name;
  const input2 = req.body.enquiry;
  const input3 = req.body.imageLink;

  // Check if both inputs are present
  if (input1 && input2 && input3) {
    // Respond with a success message and the received input data
    res.json({ success: true, message: 'Inputs received successfully', input1, input2, input3 });
    
    // Log the inputs to the console
    console.log(`
      ***************8
      Input 1: ${input1}
      Input 2: ${input2}
      Input 3: ${input3}
    `);
    imgRec(input3, input1)

  } else {
    // Respond with an error message if any input is missing
    res.status(400).json({ success: false, message: 'Both inputs are required' });
  }
});

app.get('/reportnew', (req, res) => {
  res.render("create_report")

});

app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});

