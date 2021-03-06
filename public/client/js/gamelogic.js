
$(function(){
    console.log(document.getElementById('ctx-border'));
    if(document.getElementById('ctx-border')!==null) {


            var WIDTH = 1280;
            var HEIGHT = 720;
            var socket = io();
//sign
    var playDiv = document.getElementById('playDiv');

            var playbutton = document.getElementById('playBtn');
            var changeMapBtn = document.getElementById('changeMap');
            var ctxBorder = document.getElementById('ctx-border').getContext("2d");
            var username = document.cookie.slice(document.cookie.indexOf('=') + 1);
            console.log(username)

              playbutton.onclick = function(){
                socket.emit('signIn', {username:username});
             }

            var background = new Image();
            background.src = "/client/assets/sprites/map_background2.png";
            background.onload = function () {
                ctxBorder.drawImage(background, 0, 0, 2000, 2000);
            }


            socket.on('signInResponse', function (data) {
                if (data.success) {
                    playDiv.style.display = 'none';
                    document.getElementById('gameDiv').style.display = 'inline-block';
                }
            });


//USER INTERFACE
            var changeMap = function () {
                socket.emit('changeMap');
            }
            changeMapBtn.onclick = function () {
                changeMap();
            }

            var inventory = new Inventory(null, socket, false);
            socket.on('updateInventory', function (items) {
                inventory.items = items;
                inventory.refreshRender();
            });




//GAME
            var ctx = document.getElementById("ctx").getContext("2d");
            var uicanvas = document.getElementById("ui-canvas").getContext("2d");
            var chat = document.getElementById('chat');
            var chatForm = document.getElementById('chat-form');
            var chatInput = document.getElementById('chat-input');
            uicanvas.font = '30px Arial';
//SPRITES
            var Sprite = {};
            Sprite.player = new Image();
            Sprite.player.src = '/client/assets/sprites/wizard_fire/idle_3.png';
            Sprite.bullet = new Image();
            Sprite.bullet.src = '/client/assets/sprites/bullet2.png';
            Sprite.bullet2 = new Image();
            Sprite.bullet2.src = '/client/assets/sprites/bullet3.png';
            Sprite.bullet3 = new Image();
            Sprite.bullet3.src = '/client/assets/sprites/bullet.png';

        Sprite.map = {};
            Sprite.map['forest'] = new Image();
            Sprite.map['forest'].src = '/client/assets/sprites/map.png';
            Sprite.map['field'] = new Image();
            Sprite.map['field'].src = '/client/assets/sprites/map2.png';

            Sprite.playermodels_fire = {};
            Sprite.playermodels_fire['idle_1'] = new Image();
            Sprite.playermodels_fire['idle_1'].src = '/client/assets/sprites/wizard_fire/idle_1.png';
            Sprite.playermodels_fire['idle_2'] = new Image();
            Sprite.playermodels_fire['idle_2'].src = '/client/assets/sprites/wizard_fire/idle_2.png';
            Sprite.playermodels_fire['idle_3'] = new Image();
            Sprite.playermodels_fire['idle_3'].src = '/client/assets/sprites/wizard_fire/idle_3.png';
            Sprite.playermodels_fire['idle_4'] = new Image();
            Sprite.playermodels_fire['idle_4'].src = '/client/assets/sprites/wizard_fire/idle_4.png';
            Sprite.playermodels_fire['run_1'] = new Image();
            Sprite.playermodels_fire['run_1'].src = '/client/assets/sprites/wizard_fire/run_1.png';
            Sprite.playermodels_fire['run_2'] = new Image();
            Sprite.playermodels_fire['run_2'].src = '/client/assets/sprites/wizard_fire/run_2.png';
            Sprite.playermodels_fire['run_3'] = new Image();
            Sprite.playermodels_fire['run_3'].src = '/client/assets/sprites/wizard_fire/run_3.png';
            Sprite.playermodels_fire['run_4'] = new Image();
            Sprite.playermodels_fire['run_4'].src = '/client/assets/sprites/wizard_fire/run_4.png';
            Sprite.playermodels_fire['hurt'] = new Image();
            Sprite.playermodels_fire['hurt'].src = '/client/assets/sprites/wizard_fire/hurt_1.png';

            Sprite.playermodels_frost = {};
            Sprite.playermodels_frost['idle_1'] = new Image();
            Sprite.playermodels_frost['idle_1'].src = '/client/assets/sprites/wizard_ice/idle_1.png';
            Sprite.playermodels_frost['idle_2'] = new Image();
            Sprite.playermodels_frost['idle_2'].src = '/client/assets/sprites/wizard_ice/idle_2.png';
            Sprite.playermodels_frost['idle_3'] = new Image();
            Sprite.playermodels_frost['idle_3'].src = '/client/assets/sprites/wizard_ice/idle_3.png';
            Sprite.playermodels_frost['idle_4'] = new Image();
            Sprite.playermodels_frost['idle_4'].src = '/client/assets/sprites/wizard_ice/idle_4.png';
            Sprite.playermodels_frost['run_1'] = new Image();
            Sprite.playermodels_frost['run_1'].src = '/client/assets/sprites/wizard_ice/run_1.png';
            Sprite.playermodels_frost['run_2'] = new Image();
            Sprite.playermodels_frost['run_2'].src = '/client/assets/sprites/wizard_ice/run_2.png';
            Sprite.playermodels_frost['run_3'] = new Image();
            Sprite.playermodels_frost['run_3'].src = '/client/assets/sprites/wizard_ice/run_3.png';
            Sprite.playermodels_frost['run_4'] = new Image();
            Sprite.playermodels_frost['run_4'].src = '/client/assets/sprites/wizard_ice/run_4.png';
            Sprite.playermodels_frost['hurt'] = new Image();
            Sprite.playermodels_frost['hurt'].src = '/client/assets/sprites/wizard_ice/hurt_1.png';

            Sprite.playermodels_arcane = {};
            Sprite.playermodels_arcane['idle_1'] = new Image();
            Sprite.playermodels_arcane['idle_1'].src = '/client/assets/sprites/wizard_arcane/idle_1.png';
            Sprite.playermodels_arcane['idle_2'] = new Image();
            Sprite.playermodels_arcane['idle_2'].src = '/client/assets/sprites/wizard_arcane/idle_4.png';
            Sprite.playermodels_arcane['idle_3'] = new Image();
            Sprite.playermodels_arcane['idle_3'].src = '/client/assets/sprites/wizard_arcane/idle_3.png';
            Sprite.playermodels_arcane['run_1'] = new Image();
            Sprite.playermodels_arcane['run_1'].src = '/client/assets/sprites/wizard_arcane/run_1.png';
            Sprite.playermodels_arcane['run_2'] = new Image();
            Sprite.playermodels_arcane['run_2'].src = '/client/assets/sprites/wizard_arcane/run_2.png';
            Sprite.playermodels_arcane['run_3'] = new Image();
            Sprite.playermodels_arcane['run_3'].src = '/client/assets/sprites/wizard_arcane/run_3.png';
            Sprite.playermodels_arcane['run_4'] = new Image();
            Sprite.playermodels_arcane['run_4'].src = '/client/assets/sprites/wizard_arcane/run_4.png';
            Sprite.playermodels_arcane['hurt'] = new Image();
            Sprite.playermodels_arcane['hurt'].src = '/client/assets/sprites/wizard_arcane/hurt_1.png';


//init
//when new entities are created this package will contain the data.

//PLAYER
            var Player = function (initPack) {
                var self = {};
                self.id = initPack.id;
                self.number = initPack.number;
                self.x = initPack.x;
                self.y = initPack.y;
                self.hp = initPack.hp;
                self.maxHp = initPack.maxHp;
                self.score = initPack.score;
                self.map = initPack.map;
                self.model = initPack.model;
                self.walking = initPack.walking;
                self.hurt = initPack.hurt;
                self.level = initPack.level;
                self.experience = initPack.experience;
                self.draw = function () {
                    if (Player.list[selfId].map !== self.map)
                        return;
                    var x = self.x - Player.list[selfId].x + WIDTH / 2;
                    var y = self.y - Player.list[selfId].y + HEIGHT / 2;

                    var hpWidth = 30 * self.hp / self.maxHp;
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x - hpWidth / 2, y - 40, hpWidth, 4);
                    ctx.fillStyle = 'black';
                    ctx.fillText("Lv: " + self.level, x, y+60);
                    ctx.fillText(self.id, x-15, y-45);

                    var width = Sprite.player.width / 7;
                    var height = Sprite.player.height / 7;


                    //DRAWING OF ANIMATION
                    //IF PLAYER GUTS HURT ANIMATE HIS MODEL ACCORDINGLY
                    if(self.level >=0 && self.level <3){


                        if (self.hurt) {
                                self.model = 'hurt';
                                if (self.model === 'hurt') {
                                    ctx.drawImage(Sprite.playermodels_fire['hurt'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                }
                            } else { //IF PLAYER IS IDLE DRAW HIS ANIMATION ACCORDINGLY WITH 2 STEPS STATES
                                if (!self.walking) {
                                    if (self.model === 'default' || self.model === 'run_1' || self.model === 'run_2' || self.model === 'run_3' || self.model === 'run_4') {
                                        ctx.drawImage(Sprite.playermodels_fire['idle_1'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                        setTimeout(function () {
                                            self.model = 'idle_1'
                                        }, 400);
                                    }
                                    if (self.model === 'idle_1') {
                                        ctx.drawImage(Sprite.playermodels_fire['idle_2'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                        setTimeout(function () {
                                            self.model = 'default'
                                        }, 400);
                                    }
                                } else { //IF PLAYER IS WALKING DRAW HIS ANIMATION ACCORDINGLY WITH 4 STEPS STATES
                                    if (self.model === 'default' || self.model === 'idle_1') {
                                        ctx.drawImage(Sprite.playermodels_fire['run_1'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                        setTimeout(function () {
                                            self.model = 'run_2'
                                        }, 150);
                                    }
                                    if (self.model === 'run_2') {
                                        ctx.drawImage(Sprite.playermodels_fire['run_2'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                        setTimeout(function () {
                                            self.model = 'run_3'
                                        }, 150);
                                    }
                                    if (self.model === 'run_3') {
                                        ctx.drawImage(Sprite.playermodels_fire['run_3'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                        setTimeout(function () {
                                            self.model = 'run_4'
                                        }, 150);
                                    }
                                    if (self.model === 'run_4') {
                                        ctx.drawImage(Sprite.playermodels_fire['run_4'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                        setTimeout(function () {
                                            self.model = 'default'
                                        }, 150);
                                    }

                                }

                            }
                    }else if(self.level >=3 && self.level < 6){
                        if (self.hurt) {
                            self.model = 'hurt';
                            if (self.model === 'hurt') {
                                ctx.drawImage(Sprite.playermodels_frost['hurt'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                            }
                        } else { //IF PLAYER IS IDLE DRAW HIS ANIMATION ACCORDINGLY WITH 2 STEPS STATES
                            if (!self.walking) {
                                if (self.model === 'default' || self.model === 'run_1' || self.model === 'run_2' || self.model === 'run_3' || self.model === 'run_4') {
                                    ctx.drawImage(Sprite.playermodels_frost['idle_1'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'idle_1'
                                    }, 400);
                                }
                                if (self.model === 'idle_1') {
                                    ctx.drawImage(Sprite.playermodels_frost['idle_2'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'default'
                                    }, 400);
                                }
                            } else { //IF PLAYER IS WALKING DRAW HIS ANIMATION ACCORDINGLY WITH 4 STEPS STATES
                                if (self.model === 'default' || self.model === 'idle_1') {
                                    ctx.drawImage(Sprite.playermodels_frost['run_1'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'run_2'
                                    }, 150);
                                }
                                if (self.model === 'run_2') {
                                    ctx.drawImage(Sprite.playermodels_frost['run_2'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'run_3'
                                    }, 150);
                                }
                                if (self.model === 'run_3') {
                                    ctx.drawImage(Sprite.playermodels_frost['run_3'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'run_4'
                                    }, 150);
                                }
                                if (self.model === 'run_4') {
                                    ctx.drawImage(Sprite.playermodels_frost['run_4'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'default'
                                    }, 150);
                                }

                            }

                        }
                    }else if(self.level >=6 ){
                        if (self.hurt) {
                            self.model = 'hurt';
                            if (self.model === 'hurt') {
                                ctx.drawImage(Sprite.playermodels_arcane['hurt'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                            }
                        } else { //IF PLAYER IS IDLE DRAW HIS ANIMATION ACCORDINGLY WITH 2 STEPS STATES
                            if (!self.walking) {
                                if (self.model === 'default' || self.model === 'run_1' || self.model === 'run_2' || self.model === 'run_3' || self.model === 'run_4') {
                                    ctx.drawImage(Sprite.playermodels_arcane['idle_1'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'idle_1'
                                    }, 400);
                                }
                                if (self.model === 'idle_1') {
                                    ctx.drawImage(Sprite.playermodels_arcane['idle_2'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'default'
                                    }, 400);
                                }
                            } else { //IF PLAYER IS WALKING DRAW HIS ANIMATION ACCORDINGLY WITH 4 STEPS STATES
                                if (self.model === 'default' || self.model === 'idle_1') {
                                    ctx.drawImage(Sprite.playermodels_arcane['run_1'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'run_2'
                                    }, 150);
                                }
                                if (self.model === 'run_2') {
                                    ctx.drawImage(Sprite.playermodels_arcane['run_2'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'run_3'
                                    }, 150);
                                }
                                if (self.model === 'run_3') {
                                    ctx.drawImage(Sprite.playermodels_arcane['run_3'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'run_4'
                                    }, 150);
                                }
                                if (self.model === 'run_4') {
                                    ctx.drawImage(Sprite.playermodels_arcane['run_4'], 0, 0, Sprite.player.width, Sprite.player.height, x - width / 2, y - height / 2, width, height);
                                    setTimeout(function () {
                                        self.model = 'default'
                                    }, 150);
                                }

                            }

                        }
                    }


                    // ctx.fillText(self.number, self.x, self.y);
                    // ctx.fillText(self.score, self.x, self.y-60);
                }
                Player.list[self.id] = self;
                return self;
            }
            Player.list = {};


//BULLET
            var Bullet = function (initPack) {
                var self = {};
                self.id = initPack.id;
                self.x = initPack.x;
                self.y = initPack.y;
                self.map = initPack.map;
                self.draw = function () {
                    if (Player.list[selfId].map !== self.map)
                        return;
                    var width = Sprite.player.width / 30;
                    var height = Sprite.player.height / 30;

                    var x = self.x - Player.list[selfId].x + WIDTH / 2;
                    var y = self.y - Player.list[selfId].y + HEIGHT / 2;
                    if(Player.list[selfId].level >= 0 && Player.list[selfId].level < 3){
                        ctx.drawImage(Sprite.bullet, 0, 0, Sprite.bullet.width, Sprite.bullet.height, x - width / 2, y - height / 2, width, height);
                    }else if(Player.list[selfId].level >= 3 && Player.list[selfId].level < 6){
                        ctx.drawImage(Sprite.bullet2, 0, 0, Sprite.bullet2.width, Sprite.bullet2.height, x - width / 2, y - height / 2, width, height);
                    } else if(Player.list[selfId].level >= 6 && Player.list[selfId].level){
                        ctx.drawImage(Sprite.bullet3, 0, 0, Sprite.bullet3.width, Sprite.bullet3.height, x - width / 2, y - height / 2, width, height);
                    }

                }
                Bullet.list[self.id] = self;
                return self;
            }
            Bullet.list = {};

            var selfId = null;
            Player.list[selfId];

            socket.on('init', function (data) {
                if (data.selfId)
                    selfId = data.selfId;
                for (var i = 0; i < data.player.length; i++) {
                    new Player(data.player[i]);
                }
                for (var i = 0; i < data.bullet.length; i++) {
                    new Bullet(data.bullet[i]);
                }
            });

//update
//changes on entities data are handled here
//CHANGES ON PLAYER ENTITY
            socket.on('update', function (data) {
                for (var i = 0; i < data.player.length; i++) {
                    var pack = data.player[i];
                    var p = Player.list[pack.id];
                    if (p) {
                        if (pack.x !== undefined)
                            p.x = pack.x;
                        if (pack.y !== undefined)
                            p.y = pack.y;
                        if (pack.hp !== undefined) {
                            if (p.hp !== pack.hp) {
                                p.hurt = true;
                            } else {
                                p.hurt = false;
                            }
                            console.log(p.hurt);
                            p.hp = pack.hp;
                        }
                        if(pack.experience !== undefined)
                            p.experience = pack.experience;
                        if(pack.level !== undefined)
                            p.level = pack.level;
                        if (pack.score !== undefined)
                            p.score = pack.score;
                        if (pack.map !== undefined)
                            p.map = pack.map;
                        if (pack.walking !== undefined)
                            p.walking = pack.walking;
                    }
                }
//CHANGES ON BULLET ENTITY
                for (var i = 0; i < data.bullet.length; i++) {
                    var pack = data.bullet[i];
                    var b = Bullet.list[data.bullet[i].id];
                    if (b) {
                        if (pack.x !== undefined)
                            b.x = pack.x;
                        if (pack.y !== undefined)
                            b.y = pack.y;
                    }
                }
            });

//remove
//removes id of entitites that are no longer used.
//CHANGES ON ENTITIES THAT HAVE BEEN DELETED

            socket.on('remove', function (data) {
                for (var i = 0; i < data.player.length; i++) {
                    delete Player.list[data.player[i]];
                }
                for (var i = 0; i < data.bullet.length; i++) {
                    delete Bullet.list[data.bullet[i]];
                }
            });

//render
            setInterval(function () {
                if (!selfId)
                    return;
                ctx.clearRect(0, 0, 1280, 720);
                drawMap();
                drawScore();
                for (var p in Player.list) {
                    Player.list[p].draw();
                }
                for (var b in Bullet.list) {
                    Bullet.list[b].draw();
                }
            }, 40);

            var drawMap = function () {
                var player = Player.list[selfId];
                var x = WIDTH / 2 - player.x;
                var y = HEIGHT / 2 - player.y;
                ctx.drawImage(Sprite.map[player.map], x, y);
            }


            var lastscore = null;
            var drawScore = function () {
                if (lastscore === Player.list[selfId].score)
                    return;
                lastscore = Player.list[selfId].score;
                uicanvas.clearRect(0, 0, 500, 500);
                uicanvas.fillStyle = 'black';
                uicanvas.fillText('Kill Count: ' + Player.list[selfId].score, 15, 30);
            }


//chat
//SEND A MESSAGE TO THE SERVER FOR HANDLING CHAT REQUESTS
            socket.on('appendChat', function (data) {
                if (!data.whisper) {
                    // console.log(data.whisper + ' im in IF');
                    chat.innerHTML += '<div>' + data + '</div>';
                } else {
                    // console.log(data.whisper + ' im in else');
                    chat.innerHTML += '<div style="color:#a60fff"> ' + data.message + '</div>';
                }

            });

            socket.on('evalResponse', function (data) {
                console.log(data);
            });

            chatForm.onsubmit = function (e) {
                e.preventDefault();
                if (chatInput.value[0] === '/') {
                    socket.emit('evalServer', chatInput.value.slice(1));
                }
                else if (chatInput.value[0] === '@') {
                    socket.emit('sendWhisperToServer', {
                        username: chatInput.value.slice(1, chatInput.value.indexOf(',')),
                        message: chatInput.value.slice(chatInput.value.indexOf(',') + 1),
                    });
                } else {
                    socket.emit('sendMessageToServer', chatInput.value);
                }

                chatInput.value = '';
            }


//HANDLING HOTKEYS FOR PLAYER MOVEMENT
            document.onkeydown = function (event) {
                if (event.keyCode === 87) //w
                    socket.emit('keyPress', {inputId: 'up', state: true});
                else if (event.keyCode === 83) //s
                    socket.emit('keyPress', {inputId: 'down', state: true});
                else if (event.keyCode === 68) //d
                    socket.emit('keyPress', {inputId: 'right', state: true});
                else if (event.keyCode === 65) //a
                    socket.emit('keyPress', {inputId: 'left', state: true});
            }
            document.onkeyup = function (event) {
                if (event.keyCode === 87) //w
                    socket.emit('keyPress', {inputId: 'up', state: false});
                else if (event.keyCode === 83) //s
                    socket.emit('keyPress', {inputId: 'down', state: false});
                else if (event.keyCode === 68) //d
                    socket.emit('keyPress', {inputId: 'right', state: false});
                else if (event.keyCode === 65) //a
                    socket.emit('keyPress', {inputId: 'left', state: false});
            }

            document.onmousedown = function (event) {
                socket.emit('keyPress', {inputId: 'attack', state: true});
            }

            document.onmouseup = function (event) {
                socket.emit('keyPress', {inputId: 'attack', state: false});
            }

            document.onmousemove = function (event) {
                var width =  document.body.clientWidth;
                var height =  document.body.clientHeight;
                var x = -(width/2) + event.clientX - 8;
                var y = -(height/2) + event.clientY - 8;
                var angle = Math.atan2(y, x) / Math.PI * 180;
                socket.emit('keyPress', {inputId: 'mouseAngle', state: angle});
            }

            document.oncontextmenu = function (event) {
                event.preventDefault();
            }



    }

});
