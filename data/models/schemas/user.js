/*
 * schemas/user.js
 * 
 */

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var findOrCreate = require('mongoose-findorcreate');

var Friend = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    },
    isRequest: { type: Boolean },
    isAccepted: { type: Boolean },
    isBlocked: { type: Boolean, 'default': false }

});

var UserSchema = new mongoose.Schema( {
    username: {
        type: String, 
        unique: true, 
        index: true,
        //match: /^[a - zA - Z0 - 9_!+-=:;?,.àç&éèáùú@ö]+$/
    },
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        required: true,
        match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    },
    password: {
        type: String,
    },
    image: {
        type: String,
    },
    friends: [Friend],
    location: {
        type: String,
    },
    role: {
        type: mongoose.Schema.ObjectId,
        ref: 'Role', 
        required: true
    },
    Available: {type: Boolean, 'default':true},
    createdOn: { type: Date, 'default': Date.now },
    lastLogin: Date
});
UserSchema.path("username").validate(function (v) {
    return v.length <= 25;
}, 'Your username can only contain up to 25 characters.');
UserSchema.path("username").validate(function (v) {
    return v.length >= 4;
}, 'Your username must contain 4 or more characters.');

UserSchema.path("password").validate(function (v) {
    return v.length <= 100;
}, 'Your username can only contain up to 100 characters.');
UserSchema.path("password").validate(function (v) {
    return v.length >= 5;
}, 'Your username must contain 6 or more characters.');


var options = ({ populateFields: ["friends.user","role"] });
UserSchema.plugin(passportLocalMongoose, options);
UserSchema.plugin(findOrCreate);


module.exports = UserSchema;