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
            User.find({ username: username }).populate('friends').populate('friends.user').exec(function (err, res) {
                next(err, res);
            });
        },
        updateUser = function (originalUsername,updatevalues,cb) {
            User.update({ username: originalUsername }, updatevalues, { runValidators: false }, function (error, result) {
                if (error) {
                    
                    console.error(error);
                    if (error.code == 11000) {
                        if (cb)
                            return cb("Duplicate key!", null);
                    }
                    else if (error.name == "ValidationError") {
                        if (cb)
                            return cb("ValidationError", { originalUsername: originalUsername, username: username, name: name, gender: gender, age: age, errors: error.errors })
                    }
                    else
                        if (cb)
                            return cb(error, null);
                }
                else if (!result) {
                    if (cb)
                        return cb("No records found!", null);
                }
                else {
                    if (cb)
                        return cb(null, result);
                }
            });
        },
        findUserByEmail = function (email, next) {
            User.find({ email: email }, function (err, res) {
                next(err, res);
            });
},
        addFriend = function (User1Id, User2Id,next){
            User.findOne({ _id: User1Id }, function (err, res) {
                if (!err) {
                    res.friends.push({user: User2Id,isRequest: false,isAccepted:false});
                    res.save(function (err,result) {
                        if (!err) {
                            User.findOne({ _id: User2Id }, function (err, res2) {
                                if (!err) {
                                    res2.friends.push({ user: User1Id, isRequest: true,isAccepted:false });
                                    res2.save(function (err, result2) {
                                        if (!err) {
                                            return next(null, result);
                                        }
                                    });
                                }
                                return next("something went wrong");
                            });
                        }
                    });
                }
                return next("something went wrong");
            });
        },
        acceptFriendshipRequest = function (User1Id, User2Id, next) {
            User.update({ _id: User1Id, "friends.user" : User2Id }, { $set: { "friends.$.isAccepted": true } }, function (err, res) {
                if (err) {
                    console.error(err);
                    return next("something went wrong");
                } else {
                    User.update({ _id: User2Id, "friends.user" : User1Id }, { $set: { "friends.$.isAccepted": true } }, function (err, res) {
                        if (err) {
                            console.error(err);
                            return next("something went wrong");
                        } else {
                            return next(null, res);

                        }
                    });
                }
            });
        }, blockFriendship = function (User1Id, User2Id, next) {
            User.update({ _id: User1Id, "friends.user" : User2Id }, { $set: { "friends.$.isBlocked": true } }, function (err, res) {
                if (err) {
                    console.error(err);
                    return next("something went wrong");
                } else {
                    User.update({ _id: User2Id, "friends.user" : User1Id }, { $set: { "friends.$.isBlocked": true } }, function (err, res) {
                        if (err) {
                            console.error(err);
                            return next("something went wrong");
                        } else {
                            return next(null, res);

                        }
                    });
                }
            });
        }
            
            //User.findOne({ _id: User1Id, "friends.user" : User2Id }, function (err, res) {
            //    if (!err) {
            //        res.isAccepted = true;
            //        res.save(function () {
            //            if (!err) {
            //                User.findOne({ _id: User2Id, "friends.user" : User1Id }, function (err, res) {
            //                    if (!err) {
            //                        res.isAccepted = true;
            //                        res.save(function () {
            //                            if (!err) {
            //                                return next(null, res);
            //                            } else {
            //                                console.error(err);
            //                                return next("something went wrong");
            //                            }
            //                        });
            //                    } else {
            //                        console.error(err);
            //                        return next("something went wrong");
            //                    }
            //                });
            //            } else {
            //                console.error(err);
            //                return next("something went wrong");
            //            }
            //        });
            //    } else {
            //        console.error(err);
            //        return next("something went wrong");
            //    }
            //});
        
    
    return {
        model : User ,
        getAllUsers: getAllUsers,
        findUser: findUser,
        findUserByEmail: findUserByEmail,
        updateUser: updateUser,
        createUser: createUser,
        addFriend: addFriend,
        acceptFriendshipRequest: acceptFriendshipRequest,
        blockFriendship: blockFriendship
    };
})();

module.exports = UsersRepo;