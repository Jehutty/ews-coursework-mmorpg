require('./server/entities');
require('./client/shared/inventory');
require('./server/db');
var express = require('express');
var mongojs = require('mongojs');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});
var mongoose = require('mongoose');
var config = require('./config');
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var path = require('path');

// log all requests to the console

// mongoose.connect(config.database);


// set static files location
// used for requests that our frontend will make
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || config.port);

console.log("Super gruesome rpg game on 8000");


//socket handling emits/listens


var SOCKETS_LIST = Entity.getSocketList();
var DEBUG = true;

io.sockets.on('connection', function (socket) {
    console.log('new socket connection');
    socket.id = Math.random();

    SOCKETS_LIST[socket.id] = socket;



    socket.on('signIn', function (data) {
        Database.isValidPassword(data, function(res){
            if(!res)
                return socket.emit('signInResponse', {success:false});
            Database.getUserProgress(data.username, function(progress){
                Player.onConnect(socket, data.username, progress);
                socket.emit('signInResponse', {success:true});
            });
        });
    });

    socket.on('signUp', function (data) {
        Database.isUsernameTaken(data, function(res){
            if(res){
                socket.emit('signUpResponse', {success:false});
            }else{
                Database.addUser(data, function(){
                    socket.emit('signUpResponse', {success:true});
                });
            }
        });
    });


    socket.on('disconnect', function(){
        delete SOCKETS_LIST[socket.id];
        Player.onDisconnect(socket);
    });

    
    socket.on('evalServer', function (data) {
        if(!DEBUG)
            return;
        var response = eval(data);
        socket.emit('evalResponse', response);
    });



});


setInterval(function () {
    var packs = Entity.getFrameUpdates();
    for (var sock in SOCKETS_LIST) {
        var socket = SOCKETS_LIST[sock];
        socket.emit('init', packs.initPack);
        socket.emit('update',packs.updatePack);
        socket.emit('remove',packs.removePack);
    }
},1000/25);