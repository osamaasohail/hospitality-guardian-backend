require("dotenv").config();
var url = process.env.MONGODB_URL;
// var url = process.env.MONGODB_URL;
console.log("mongo url:", url);
module.exports = url;
