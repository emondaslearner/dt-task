require("dotenv").config();
require("module-alias/register");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// routes
const routes = require('./routes');

// db functions
const { connectToMongo } = require("./db");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(routes);

app.use((err, _req, res, next) => {
  // TODO: format error
  console.log('error', err.message)
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

// health
app.get("/health", (_req, res) => {
  res.status(200).json({
    health: "ok",
    message: "request for data",
  });
});

// connection mongodb and listen the express app
connectToMongo(app);
