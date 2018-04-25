// BASE SETUP
// ======================================
require('./server/entities');
require('./public/client/shared/inventory');
require('./server/db');
// CALL THE PACKAGES --------------------
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');




var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});

// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// log all requests to the console
// app.use(morgan('dev'));

// connect to our database (hosted on modulus.io)
mongoose.connect(config.database);

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));
// app.use('/game', function(req,res){
//     res.sendfile(__dirname + '/public/client/index.html');
// });
// ROUTES FOR OUR API =================
// ====================================

// API ROUTES ------------------------
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});


// START THE SERVER
// ====================================
serv.listen(process.env.port || config.port);
console.log('Magic happens on port ' + config.port);

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