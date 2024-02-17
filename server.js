const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./database');
const Session = require('./session');
const dotenv = require('dotenv');
const OpenAI = require("openai");
const multer  = require('multer');
const exifParser = require('exif-parser');
const fs = require('fs');
const path = require('path');


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
  cookie: {
    maxAge: 86400000 // 1 day in secound 
  }
}));  


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login',(req,res)=>{
  res.render("email")
})

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
            { type: "text", text: "if you're 30% confident that this image is related to : "+input+"? return true or false" },
            {
              type: "image_url",
              image_url: {
                "url": imageLink,
              },
            },
          ],
        },
      ],
    });
    console.log(response.choices[0]);
  }
  main();
}



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
    imgRec(input3, input1);
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