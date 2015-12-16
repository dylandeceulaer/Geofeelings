/*
 * schemas/user.js
 * 
 */

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        unique: true, 
        index: true,
        //match: /^[a - zA - Z0 - 9_!+-=:;?,.àç&éèáùúö]+$/
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
        //required: true
    },
    createdOn: { type: Date, 'default': Date.now },
    lastLogin: Date
});
UserSchema.path("username").validate(function (v) {
    return v.length <= 25;
}, 'Your username can only contain up to 25 characters.');
UserSchema.path("username").validate(function (v) {
    return v.length >= 5;
}, 'Your username must contain 5 or more characters.');

UserSchema.path("password").validate(function (v) {
    return v.length <= 100;
}, 'Your username can only contain up to 100 characters.');
UserSchema.path("password").validate(function (v) {
    return v.length >= 6;
}, 'Your username must contain 6 or more characters.');

UserSchema.plugin(passportLocalMongoose);


module.exports = UserSchema;