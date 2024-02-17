const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./database');
const Session = require('./session');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  await sequelize.sync();
})();


const app = express();
const server = http.createServer(app);


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

app.get('/user/:email', (req, res) => {
  const email = req.params.email;
  if (email === req.session.email) {
      res.render('user', { email: email });
  } else {
      res.redirect('/');
  }
});




app.post('/login/otp', async (req, res) => {
    const email = req.body.email;
    await fetch(`https://lbqn3amkemogpqcxzqnbvmlqsm0knjff.lambda-url.ap-south-1.on.aws/?email=${email}`)
    .then(response => response.text()) 
    .then(data => {
      console.log(data);
    })
    await res.render('otp', {email:email})
    
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
          res.redirect('/login');
          }
      
    })
})


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

app.listen(3000, () => console.log('Server listening on port 3000'));
