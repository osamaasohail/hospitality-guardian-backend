var createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

var configDB = require('./src/config/db');
app.use(logger('dev'));
app.use(express.json());
const port = process.env.PORT || '3000';
app.use(express.urlencoded({ extended: false }));
app.use(cors());
mongoose.connect(configDB);
app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.get('/', function (req,res) {
	res.json({sucess: true});
});
require('./src/routes/auth')(app);
require('./src/routes/certs')(app);
require('./src/routes/dutyManager')(app);
app.use((req, res, next) => {
    next(createError(404));
});
app.listen(port, function() {
    console.log("Listening on port "+ port);
});