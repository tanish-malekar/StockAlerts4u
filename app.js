const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const http = require("https");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://tanish_malekar:Tanman%23123@cluster0.kdiax.mongodb.net/stockAlertDB", {useNewUrlParser: true, useUnifiedTopology: true});



function UserEntry(email, stockSymbol, upperLimit, lowerLimit){
  this.email = email;
  this.stockSymbol = stockSymbol;
  this.upperLimit = upperLimit;
  this.lowerLimit = lowerLimit;
}

const dataSchema = {
  email: String,
  stockSymbol: String,
  upperLimit: Number,
  lowerLimit: Number
}

const Data = mongoose.model("data", dataSchema);


setInterval(() => {
  console.log("checking stock prices");
  Data.find((err, userEntries)=>{
    if(err){
      console.log(err)
    }
    else{
      userEntries.forEach((currentUser)=>{
        checkPrices(currentUser);
      })
    }
  })

}, 10000);

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html')
})

app.post('/', function (request, response) {
  let stockSymbol = request.body.stockSymbol;
  let upperLimit =  Number(request.body.upperLimit);
  let lowerLimit = Number(request.body.lowerLimit);
  let email = request.body.email;
  let userEntry = new UserEntry(email, stockSymbol, upperLimit, lowerLimit);
  addDB(userEntry);
  response.sendFile(__dirname + '/success.html');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

function addDB(userEntry){
  let data = new Data({
    email: userEntry.email,
    stockSymbol: userEntry.stockSymbol,
    upperLimit: userEntry.upperLimit,
    lowerLimit: userEntry.lowerLimit
  });
  data.save();
}

function removeDB(userEntry){
  Data.remove({  email: userEntry.email,
    stockSymbol: userEntry.stockSymbol,
    upperLimit: userEntry.upperLimit,
    lowerLimit: userEntry.lowerLimit}, (err)=>{
      if(err){
      console.log(err);
    }
  });
}









function checkPrices(currentUser){
    const options = {
    "method": "GET",
    "url": 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes',
    "params": {region: 'IN', symbols: currentUser.stockSymbol},
    "headers": {
      "x-rapidapi-key": "28658525b3msh9d3c6d7e29ddef1p1f0d50jsn863b38cfd82e",
      "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
      "useQueryString": true
    }
    };

    const req = http.request(options, function (res) {
        const chunks = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          let data = Buffer.concat(chunks);
          data = JSON.parse(data);
          let stockPrice = Number(data.quoteResponse.result[0].regularMarketPrice);
          if(stockPrice>currentUser.upperLimit){
            sendEmail("greater than", currentUser.email, currentUser.upperLimit, currentUser.stockSymbol, stockPrice);
            removeDB(currentUser);
          }
          else if(stockPrice<currentUser.lowerLimit){
            sendEmail("less than", currentUser.email, currentUser.lowerLimit, currentUser.stockSymbol, stockPrice);
            removeDB(currentUser);
          }
        });
    });

    req.end();
}



function sendEmail(condition, email, limit, symbol, stockPrice){
  emailContent = "The price of " + symbol + " has become " + condition + " " + limit.toString() + "! " + "The current price is " + stockPrice.toString() + "! Thankyou for using our service.";
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'stockalerts66@gmail.com',
      pass: 'Tanman#123'
    }
  });

  var mailOptions = {
    from: 'stockalerts66@gmail.com',
    to: email,
    subject: 'STOCK ALERT',
    text: emailContent
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
