/* Init Dependencies */

var express = require('express');
var http = require('http');

/* Configure Express */ 

var app = express();
app.configure(function () {
    
});

var server = http.createServer(app);
server.listen(8000);

/* Init Master Vars */

/* Static Assets */ 
app.use(express.static(__dirname + '/public'));

/* Main Index Static Direct Call */ 
app.get('/', function (req, res) {
  res.send('Dead or Alive');
});