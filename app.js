const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const methodOverride = require("method-override");
const multer = require("multer");

dotenv.config({ path: "./config.env" });
const navigate = require("./routes/Nav");

//connecting to mongodb database

mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
//middleWares

//Routes
app.use(navigate);

const Port = process.env.PORT;
app.listen(Port, () => {
  console.log("Server running on port " + Port);
});
