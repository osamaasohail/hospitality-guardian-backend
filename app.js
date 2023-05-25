var createError = require('http-errors');
const fs = require('fs');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
var configDB = require('./src/config/db');
const https = require('https');
// Certificate
const privateKey = fs.readFileSync('/home/ubuntu/proj/backend/private.key', 'utf8');
const certificate = fs.readFileSync('/home/ubuntu/proj/backend/certificate.crt', 'utf8');
const ca = fs.readFileSync('/home/ubuntu/proj/backend/ca_bundle.crt', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
app.use(logger('dev'));
app.use(express.json());
const port = process.env.PORT || '4000';
app.use(express.urlencoded({ extended: false }));
mongoose.connect(configDB);
app.use(cors());
app.use(express.static(__dirname, { dotfiles: 'allow' } ));
app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.get('/', function (req,res) {
	res.json({sucess: true});
});
require('./src/routes/auth')(app);
require('./src/routes/business-licenses')(app);
require('./src/routes/dutyManager')(app);
require('./src/routes/individual-licenses')(app);
require('./src/routes/stripe')(app);
require('./src/services/notifications');
require('./src/routes/notificationRoute')(app);
app.get('/testing-server', function (req,res) {
    return res.status(200).json({message: 'Server is working updated', frontendurl: process.env.FRONTEND_URL, dutyManagerPriceId: process.env.DUTY_MANAGER_PRODUCT_PRICE_ID, businessLicensePriceId: process.env.BUSINESS_PRODUCT_PRICE_ID});
})
app.use((req, res, next) => {
    next(createError(404));
});
app.listen(port, function() {
    console.log("Listening on port "+ port);
});
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(3000, () => {
	console.log('HTTPS Server running on port 443');
});
