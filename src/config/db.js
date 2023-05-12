require("dotenv").config();
var url = "mongodb://127.0.0.1:27020/hc";//process.env.MONGODB_URL;
console.log("mongo url:",url);
module.exports = url;
