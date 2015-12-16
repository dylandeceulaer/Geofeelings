/*
 * models/user.js:
 * MODELS op te roepen in routes via var User = require('../data/models/user')
 * 
 */
var mongoose = require("mongoose");
var UserSchema = require("../schemas/user");
var User = mongoose.model('User', UserSchema, "users");  //model-schema-collection
//default collection = model + "s"
//Dataaccessors met callbacks => in repository 

module.exports = User; //niet vergeten!!!