const express = require('express');
const app = express();

// Glitch expects a web server so we're starting express to take care of that.
// The page shows the same information as the readme and includes the remix button.
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});
app.get("/client.js", function (request, response) {
    response.sendFile(__dirname + '/client.js');
});
app.get("/functions.js", function (request, response) {
    response.sendFile(__dirname + '/functions.js');
});
app.get("/client.css", function (request, response) {
    response.sendFile(__dirname + '/client.css');
});

let listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});