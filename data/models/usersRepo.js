﻿/*
 * Repository voor user.js
 * 
 * 
 */
var mongoose = require("mongoose");

UsersRepo = (function () {
    var User = require("./user.js");
    var Role = require("./role.js");
    RoleRepo = require('./roleRepo.js');
     
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
            user.role = role.ROLES.User.id;
            User.create(user, function (err) {
                if (err) { return next(err); }
                next(user);
            });
        },
        findUserCheck = function (username, next) {
            User.find({ username: username }).populate('friends').populate('role').populate('friends.user').exec(function (err, res) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    next(null, res);
                }
                
            });
        },

        findUser = function (username,currentUserId, next) {
            User.find({ username: username }).populate('friends').populate('role').populate('friends.user').exec(function (err, res) {
                if (err) {
                    console.log(err);
                    next(err);
                } else if (res.length<1) {
                    console.log("nothing found");
                    next("nothing found");

                } else {
                    isFriend(res[0]._id, currentUserId, function (result) {
                        res[0].isFriend = result;
                        next(null, res);
                    });
                    
                }
                
            });
        },
        updateUser = function (id,updatevalues,next) {
            User.update({ _id: id }, updatevalues, { runValidators: false }, function (error, result) {
                if (error) {
                    
                    console.error(error);
                    if (error.code == 11000) {
                        if (next)
                            return next("Duplicate key!", null);
                    }
                    else
                        if (next)
                            return next(error, null);
                }
                else if (!result) {
                    if (next)
                        return next("No records found!", null);
                }
                else {
                    if (next)
                        return next(null, result);
                }
            });
        },
        findUserByEmail = function (email, next) {
            User.find({ email: email }, function (err, res) {
                next(err, res);
            });
        },
        setAvailabilityState = function (id, state, next) {
            User.update({ _id: id }, { Available: state }, function (error, result) {
                if (error) {
                    console.log(error);
                    return next(error, null);
                }
                else {
                    return next(null, result);
                }
            });
        },
        addFriend = function (User1Id, User2Id,next){
            User.findOne({ _id: User1Id }, function (err, res) {
                if (!err) {
                    res.friends.push({ user: User2Id, isRequest: false, isAccepted: false });
                    res.save(function (err, result) {
                        if (!err) {
                            User.findOne({ _id: User2Id }, function (err, res2) {
                                if (!err) {
                                    res2.friends.push({ user: User1Id, isRequest: true, isAccepted: false });
                                    res2.save(function (err, result2) {
                                        if (!err) {
                                            return next(null, result);
                                        } else {
                                            console.log("stap 4", err);
                                            return next("something went wrong");
                                        }
                                    });
                                } else {
                                    console.log("stap 3", err);
                                    return next("something went wrong");
                                }
                            });
                        }
                        else {
                            console.log("stap 2", err);
                            return next("something went wrong");
                        }
                    });
                } else {
                    console.log ("stap 1", err);
                    return next("something went wrong");
                }
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
},
        isFriend = function (User1Id, User2Id, next){
            User.find({ _id: User1Id, "friends.user" : User2Id }, function (err, res) {
                
                if (err)
                    next(false);
                if (res.length > 0)
                    next(true);
                else
                    next(false);
                    
            });
        },
        setDefaultValues = function (role){
            User.register(new User({ username : "docent@nmct", name : "Admin Account", email : "admin@howest.be", role: RoleRepo.ROLES.Admin.id }), "docent1@nmct", function (err, account) {
            })
            User.register(new User({ username : "Mike", name : "Mike Abram", email : "Mike@howest.be", role: RoleRepo.ROLES.User.id }), "testPass", function (err, account) {
            })
            User.register(new User({ username : "Steve", name : "Steve Smith", email : "Steve@howest.be", role: RoleRepo.ROLES.User.id }), "testPass", function (err, account) {
            })
            User.register(new User({ username : "James", name : "James Jones", email : "James@howest.be", role: RoleRepo.ROLES.User.id }), "testPass", function (err, account) {
            })
        }

    return {
        model : User ,
        getAllUsers: getAllUsers,
        findUser: findUser,
        findUserByEmail: findUserByEmail,
        updateUser: updateUser,
        createUser: createUser,
        addFriend: addFriend,
        acceptFriendshipRequest: acceptFriendshipRequest,
        blockFriendship: blockFriendship,
        findUserCheck : findUserCheck,
        setDefaultValues : setDefaultValues,
        setAvailabilityState: setAvailabilityState
    };
})();

module.exports = UsersRepo;