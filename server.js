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
var db = mongojs(config.database, ['account', 'progress']);

// log all requests to the console
db.account.insert({username:"b", password:"bbb"});
// connect to our database (hosted on modulus.io)
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

var SOCKETS_LIST = {};


//entity class constructor
var Entity = function () {
    var self = {
        x:250,
        y:250,
        speedX:0,
        speedY:0,
        id:"",
    }
    self.update = function () {
        self.updatePosition();
    };
    self.updatePosition = function () {
        self.x += self.speedX;
        self.y += self.speedY;
    }
    self.getDistance = function(point){
        return Math.sqrt(Math.pow(self.x - point.x, 2) + Math.pow(self.y - point.y, 2));
    }
    return self;
}

//player class
var Player = function(id){
    var self = Entity();
    self.id = id;
    self.number= "" + Math.floor(10* Math.random());
    self.pressingRight= false;
    self.pressingLeft= false;
    self.pressingUp=false;
    self.pressingDown= false;
    self.pressingAttack=false;
    self.mouseAngle =0;
    self.maxVelocity= 10;
    self.hp = 10;
    self.maxHp = 10;
    self.score = 0;

    var super_update = self.update;
    self.update = function(){
        self.updateSpeed();
        super_update();

        if (self.pressingAttack){
            self.shootProjectile(self.mouseAngle);
        }
    };

    self.shootProjectile = function(angle){
        var b = Bullet(self.id, angle);
        b.x = self.x;
        b.y = self.y;
    }

    self.updateSpeed = function(){
        if(self.pressingRight)
            self.speedX = self.maxVelocity;
        else if(self.pressingLeft)
            self.speedX = -self.maxVelocity;
        else
            self.speedX = 0;

        if(self.pressingUp)
            self.speedY = -self.maxVelocity;
        else if(self.pressingDown)
            self.speedY = self.maxVelocity;
        else
            self.speedY = 0;
    }

    self.getInitPack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            number:self.number,
            hp:self.hp,
            maxHp:self.maxHp,
            score:self.score,
        };
    }

    self.getUpdatePack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
        };
    }

    initPack.player.push(self.getInitPack());
    Player.list[id] = self;

    return self;
}
Player.list = {};

Player.onConnect = function(socket){
    var player = Player(socket.id);
    socket.on('keyPress', function (data) {
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        else if (data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if (data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });


    socket.emit('init', {
        selfId:socket.id,
        player:Player.getInitState(),
        bullet:Bullet.getInitState(),
    });

}

Player.getInitState = function(){
    var playersInGame = [];
    for(var p in Player.list)
        playersInGame.push(Player.list[p].getInitPack());
    return playersInGame;
}

Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}

Player.update = function(){
    var pack = [];
    for (var p in  Player.list){
        var player =  Player.list[p];
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
}
//BULLETS LOGIC
var Bullet = function(parent, angle){
    var self = Entity();
    self.parent = parent;
    self.id = Math.random();
    self.speedX = Math.cos(angle/180*Math.PI) * 10;
    self.speedY = Math.sin(angle/180*Math.PI) * 10;

    self.timer = 0;
    self.toRemove = false;

    var super_update = self.update;
    self.update = function () {
        if(self.timer++ > 100){
            self.toRemove = true;
        }
        for (var i in Player.list){
            var p = Player.list[i];
            if(self.getDistance(p) < 32 && self.parent !== p.id){
                //handling collision. ex hp--;
                p.hp -= 1;
                if(p.hp <= 0){
                    var shooter = Player.list[self.parent];
                    if(shooter)
                        shooter.score +=1;
                    p.hp = p.maxHp;
                    p.x = Math.random() * 500;
                    p.y = Math.random() * 500;
                }
                self.toRemove = true;
            }
        }
        super_update();
    }

    self.getInitPack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
        };
    }

    self.getUpdatePack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
        };
    }
    Bullet.list[self.id] = self;
    initPack.bullet.push(self.getInitPack());

    return self;
}
Bullet.list = {};

Bullet.update = function(){

    var pack = [];
    for (var b in  Bullet.list){
        var bullet =  Bullet.list[b];
        bullet.update();
        if(bullet.toRemove){
            delete Bullet.list[b];
            removePack.bullet.push(bullet.id);
        }else
            pack.push(bullet.getUpdatePack());
    }
    return pack;
}

Bullet.getInitState = function () {
    var bulletsInGame = [];
    for(var b in Bullet.list)
        bulletsInGame.push(Bullet.list[b].getInitPack());
    return bulletsInGame;
}

var DEBUG = true;
var USERS = {
    //username:password
    "bob":"asd",
    "bob2":"bob",
    "jehutty":'mother1load1',
}

var isValidPassword = function(data, cb){
    db.account.find({username:data.username, password:data.password}, function(err,res){
        if(res.length > 0)
            cb(true);
        else
            cb(false);
    });
}

var isUsernameTaken = function(data, cb){
    db.account.find({username:data.username}, function(err,res){
        if(res.length > 0)
            cb(true);
        else
            cb(false);
    });
}

var addUser = function(data, cb){
    db.account.insert({username:data.username, password:data.password}, function(err){
        cb();
    });
}

io.sockets.on('connection', function (socket) {
    console.log('new socket connection');
    socket.id = Math.random();

    SOCKETS_LIST[socket.id] = socket;



    socket.on('signIn', function (data) {
        isValidPassword(data, function(res){
            if(res){
                Player.onConnect(socket)
                socket.emit('signInResponse', {success:true});
            }else{
                socket.emit('signInResponse', {success:false});
            }
        });
    });

    socket.on('signUp', function (data) {
        isUsernameTaken(data, function(res){
            if(res){
                socket.emit('signUpResponse', {success:false});
            }else{
                addUser(data, function(){
                    socket.emit('signUpResponse', {success:true});
                });
            }
        });
    });


    socket.on('disconnect', function(){
        delete SOCKETS_LIST[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('sendMessageToServer', function(data){
        var playerName = ("" + socket.id).slice(2,7);
        for(var i in SOCKETS_LIST){
            SOCKETS_LIST[i].emit('appendChat', playerName + ' : ' + data);
        }
    });
    
    socket.on('evalServer', function (data) {
        if(!DEBUG)
            return;
        var response = eval(data);
        socket.emit('evalResponse', response);
    });

});


var initPack = {player:[], bullet:[]};
var removePack = {player:[], bullet:[]};

setInterval(function () {
    var pack = {
        player: Player.update(),
        bullet: Bullet.update(),
    }
    for (var sock in SOCKETS_LIST) {
        var socket = SOCKETS_LIST[sock];
        socket.emit('init', initPack);
        socket.emit('update',pack);
        socket.emit('remove', removePack);
    }

    initPack.player = [];
    initPack.bullet = [];
    removePack.player = [];
    removePack.bullet = [];
},1000/25);