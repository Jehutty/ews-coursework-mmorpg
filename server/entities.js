
//entity class constructor
var initPack = {player:[], bullet:[]};
var removePack = {player:[], bullet:[]};

var SOCKETS_LIST = {};
Entity = function (params) {
    var self = {
        x:640,
        y:360,
        speedX:0,
        speedY:0,
        id:"",
        map:"forest",
    }
    if(params){
        if(params.x)
            self.x = params.x;
        if(params.y)
            self.y = params.y
        if(params.map)
            self.map = params.map;
        if(params.id)
            self.id = params.id;
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
Entity.getSocketList = function(){
    return SOCKETS_LIST;
}
Entity.getFrameUpdates=function(){
    var updatepacks ={
        initPack:{
            player:initPack.player,
            bullet:initPack.bullet,
        },
        removePack:{
            player:removePack.player,
            bullet:removePack.bullet,
        },
        updatePack:{
            player:Player.update(),
            bullet:Bullet.update(),
        }
    };

    initPack.player = [];
    initPack.bullet = [];
    removePack.player = [];
    removePack.bullet = [];
    return updatepacks;
}

//player class
Player = function(params){
    var self = Entity(params);
    self.username = params.username;
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
    self.timer =0;
    self.inventory = new Inventory(params.progress.items,params.socket, true);


    var super_update = self.update;
    self.update = function(){
        self.updateSpeed();
        super_update();

        if (self.pressingAttack){
            self.shootProjectile(self.mouseAngle);
        }
    };

    self.shootProjectile = function(angle){
        if(Math.random() < 0.1)
            self.inventory.addItem("potion", 1);
        if(self.timer++ % 3 === 0){
            Bullet({
                parent: self.id,
                angle:angle,
                x:self.x,
                y:self.y,
                map:self.map,
            });
        }
        else{
            return;
        }

    }

    self.updateSpeed = function(){
        if(self.pressingRight)
            if(self.x > 1250) {
                self.speedX = 0;
            }
            else{
                self.speedX = self.maxVelocity;
            }
        else if(self.pressingLeft)

            if(self.x < 30) {
                self.speedX = 0;
            }
            else{
                self.speedX = -self.maxVelocity;
            }
        else
            self.speedX = 0;

        if(self.pressingUp)
            if(self.y < 0) {
                self.speedY = 0;
            }
            else{
                self.speedY = -self.maxVelocity;
            }
        else if(self.pressingDown)
            if(self.y > 680) {
                self.speedY = 0;
            }
            else{
                self.speedY = self.maxVelocity;
            }
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
            map:self.map,
        };
    }

    self.getUpdatePack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
            map:self.map,
        };
    }

    initPack.player.push(self.getInitPack());
    Player.list[self.id] = self;

    return self;
}
Player.list = {};

Player.onConnect = function(socket, username, progress){
    var map = "forest";
    if(Math.random() < 0.5)
        map = "field";
    var player = Player({
        username:username,
        id: socket.id,
        map:map,
        socket:socket,
        progress:progress,
    });
    player.inventory.refreshRender();
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

    socket.on('changeMap', function(data){
        if(player.map === 'field')
            player.map = 'forest';
        else
            player.map = 'field';
    });

    socket.on('sendMessageToServer', function(data){ //data: message
        for(var i in SOCKETS_LIST){
            SOCKETS_LIST[i].emit('appendChat', player.username + ' : ' + data);
        }
    });

    socket.on('sendWhisperToServer', function(data){ //data: username, message, whisper state
        var recipientSocket = null;
        for(var i in Player.list)
            if(Player.list[i].username === data.username)
                recipientSocket = SOCKETS_LIST[i];
        if(recipientSocket === null){
            socket.emit('appendChat', {
                message:'The player ' + data.username + ' is not online.',
                whisper:true,
            });
        } else {
            recipientSocket.emit('appendChat', {
                message:'From ' + player.username + ':' + data.message,
                whisper:true,
            });
            socket.emit('appendChat', {
                message: 'To ' + data.username + ':' + data.message,
                whisper:true,
            });
        }
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
    let player = Player.list[socket.id];
    if(!player)
        return;
    Database.saveUserProgress({
        username:player.username,
        items:player.inventory.items,
    });
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
Bullet = function(params){
    var self = Entity(params);
    self.parent = params.parent;
    self.id = Math.random();
    self.angle = params.angle;
    self.speedX = Math.cos(params.angle/180*Math.PI) * 20;
    self.speedY = Math.sin(params.angle/180*Math.PI) * 20;
    self.timer = 0;
    self.toRemove = false;

    var super_update = self.update;
    self.update = function () {
        if(self.timer++ > 100){
            self.toRemove = true;
        }
        for (var i in Player.list){
            var p = Player.list[i];
            if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){
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
            map:self.map,
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
