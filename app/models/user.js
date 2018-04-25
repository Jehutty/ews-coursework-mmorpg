var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

//user Schema
var UserSchema = new Schema({
    name: String,
    username: {type: String, required: true, index:{unique:true}},
    password: {type: String, required: true, select: false},
    score: Number,
});

//hash the password before the user is saved

UserSchema.pre('save', function (next) {
    var user = this; 

    //hash the pw only if the pw has been changed or user is new
    if(!user.isModified('password')) return next();

    //generate the hash
    bcrypt.hash(user.password, null, null, function(err, hash){
        if(err) return next(err)

        //change the pw to hashed version
        user.password = hash;
        next();
    });
});

//method to compare a given password with the db hash
UserSchema.methods.comparePassword = function(password){
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('userModel', UserSchema);
