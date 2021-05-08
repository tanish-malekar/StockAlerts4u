const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const http = require("https");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html')
})

app.post('/', function (request, response) {
  let stockSymbol = request.body.stockSymbol;
  let upperLimit =  Number(request.body.upperLimit);
  let lowerLimit = Number(request.body.lowerLimit);


  const options = {
	"method": "GET",
	"hostname": "apidojo-yahoo-finance-v1.p.rapidapi.com",
	"path": "/market/v2/get-quotes?region=IN&symbols=" + stockSymbol,
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
    if(stockPrice>upperLimit){
      response.write("<h1>The stock price is greater than " + upperLimit.toString() + "!</h1>");
      response.write("<h2>The current price is " + stockPrice.toString());
    }
    else if(stockPrice<lowerLimit){
      response.write("<h1>The stock price is less than " + lowerLimit.toString() + "!</h1>");
      response.write("<h2>The current price is " + stockPrice.toString());
    }
    else{
      response.write("<h1>The stock price is between " + lowerLimit.toString() + " and " + upperLimit.toString() + "!</h1>");
      response.write("<h2>The current price is " + stockPrice.toString());
    }
    response.send();
	});
});

req.end();

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
