var config = require('../config');
var USE_DB = true;
var mongojs = USE_DB ? require('mongojs') : null;

var db =  USE_DB ? mongojs(config.database, ['usermodels', 'account', 'progress']) : null;

Database = {};

Database.isValidPassword = function(data, cb){
    if(!USE_DB)
        return cb(true);
    db.account.findOne({username:data.username, password:data.password}, function(err,res){
        if(res)
            cb(true);
        else
            cb(false);
    });
}

Database.isUsernameTaken = function(data, cb){
    if(!USE_DB)
        return cb(false);
    db.account.findOne({username:data.username}, function(err,res){
        if(res)
            cb(true);
        else
            cb(false);
    });
}

Database.addUser = function(data, cb){
    if(!USE_DB)
        return cb();
    db.account.insert({username:data.username}, function(err){
        Database.saveUserProgress({username:data.username, items:[], score: 0}, function () {
            cb();
        });
        cb();
    });
}

Database.getUserProgress = function(username, cb){
    if(!USE_DB)
        return cb({items:[]});
    db.progress.findOne({username:username}, function (err, res) {
        cb({items:res.items, score:res.score, level:res.level, experience:res.experience});
    });
}

Database.saveUserProgress = function (data, cb) {
    cb = cb || function () {}

    if(!USE_DB)
        return cb();
    db.progress.update({username:data.username}, data , {upsert:true}, cb);
    db.usermodels.update({username:data.username}, {$set: {score: data.score, level:data.level, experience:data.experience} }, cb);
}