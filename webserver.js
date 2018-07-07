const express = require("express");
const app = express();

const browserify = require("browserify-middleware");

app.get("/bundle.js", browserify(__dirname + "/src/client.js"));
app.use(express.static(__dirname + "/static"));

app.listen(80);