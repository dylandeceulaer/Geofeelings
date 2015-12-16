/*
 * Repository voor user.js
 * 
 * 
 */
var mongoose = require("mongoose");

UsersRepo = (function () {
    var User = require("./user.js");
     
    var getAllUsers = function (next) {
        User.find({}).sort('name').exec(function (err, docs) {
            if (err) {
                console.log(err);
                next(err, null);
            }
            next(null, docs);
        });
    },  
      
        createUser = function (user, next) {
            //single model command create combineert new en save
            //next combineert err & success
            //typeof(user) ==="object"
            user.creationDate = new Date();
            User.create(user, function (err) {
                if (err) { return next(err); }
                next(user);
            });
        },

        findUser = function (username, next) {
            User.find({ username: username }, function (err, res) {
                next(err, res);
        })
        };
    
    return {
        model :User ,
        getAllUsers: getAllUsers,
        findUser: findUser,
        createUser: createUser
    };
})();

module.exports = UsersRepo;