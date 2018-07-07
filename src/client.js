const funcs = require("./functions.js");

const $ = require("jquery-browserify");

const canvas = $("#main");
canvas.contextmenu(event => event.preventDefault());