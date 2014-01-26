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
//io.set('transports', ['xhr-polling']);
//io.set('polling duration', 10);

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


    socket.on('addplayer', function(player_hash, player_data){

        players[player_hash] = socket;
        players_data[player_hash] = player_data;

        socket.emit('listplayers', players_data);

        socket.broadcast.emit('playernew', players_data[player_hash]);

        socket.emit('log', 'Server Connected');

    });

    socket.on('meupdate', function(player_hash, data){

        if(players[player_hash] != undefined){

            players_data[player_hash] = data;

            socket.broadcast.emit('playerupdate', players_data[player_hash]);
            //socket.emit('log', 'Updated Player');

        }
        else {
            socket.emit('log', 'Tried to update an invalid player', player_hash);
        }

    });

    socket.on('disconnect', function(){

        for(var i in players){
            if (players[i].id == socket.id){
                var hash = i;
                socket.broadcast.emit('playerdelete', hash);
                delete players[i];
                delete players_data[i];
            }
        }

    });
});
