/* Init Dependencies */

var express = require('express');
var http = require('http');

/* Configure Express */ 

var app = express();
app.configure(function () {
    
});

var server = http.createServer(app);
server.listen(8000);

/* IO */

var io = require('socket.io').listen(server);
io.set('log level', 1);
io.set('transports', ['xhr-polling']);
io.set('polling duration', 10); 

/* Init Master Vars */

/* Static Assets */ 
app.use(express.static(__dirname + '/public'));

/* Main Index Static Direct Call */ 
app.get('/', function (req, res) {
  res.send('Dead or Alive');
});


var game = {};

var players = {};
var players_data = {};

io.sockets.on('connection', function (socket) {


    socket.on('addplayer', function(code){
        socket.player = code;

        players[code] = socket;
        players_data[code] = {code: code};

        socket.emit('listplayers', players_data);
        
        socket.emit('log', 'Server Connected');

    });

    socket.on('meupdate', function(code, data){

        if(players_data[code] != undefined){

            data.code = code;
            players_data[code] = data;
            
            socket.broadcast.emit('playerupdate', players_data[code]);
            //socket.emit('log', 'Updated Player');


        }

              
    });

    socket.on('disconnect', function(){
        // remove the username from global usernames list
        // delete usernames[socket.username];
        // // update list of users in chat, client-side
        // io.sockets.emit('updateusers', usernames);
        // // echo globally that this client has left
        // socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        //socket.broadcast.emit('input', 'keypadon');
    });
});
