var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require("../data/models/user");
var UsersRepo = require("../data/models/usersRepo");
var CommentRepo = require("../data/models/commentRepo");
var eventRepo = require("../data/models/eventRepo");
var moodCircleRepo = require("../data/models/moodCircleRepo");
var profilehelp = require("./middleware/profilehelp");

router.get('/', function (req, res) {
    if (req.user)
        CommentRepo.getComments(req.user._id, function (err, arrComments) {
            specialNav = {};
            specialNav.href = "/profile";
            specialNav.name = "Edit Profile";
            if (err && err == "No records found") {
                eventRepo.getUserUpdates(req.user._id, function (err, resUpdates) {
                    moodCircleRepo.getUserUpdates(req.user._id, function (err, resCircleUpdates) {
                        profilehelp.joinUpdates(resUpdates, resCircleUpdates, function (updateres) {
                            req.user.updates = updateres;
                            res.render('profileEdit', { title: 'GeoMood - Edit Profile', user : req.user, specialNav: specialNav, activeLi: "specialnav" });
                        });
                        
                    });
                });

            }
            else if (err) {
                console.log(err);
                res.status(500);
                res.send("something went wrong.");
                    
            } else {
                eventRepo.getUserUpdates(req.user._id, function (err, resUpdates) {
                    moodCircleRepo.getUserUpdates(req.user._id, function (err, resCircleUpdates) {
                        profilehelp.joinUpdates(resUpdates, resCircleUpdates, function (updateres) {
                            req.user.updates = updateres;
                            req.user.comments = arrComments;
                            res.render('profileEdit', { title: 'GeoMood - Edit Profile', user : req.user, specialNav: specialNav, activeLi: "specialnav" });
                        });
                    });
                });
            }
        });
    else
        res.redirect('/');
});
router.get('/:User', function (req, res) {
    var user = req.params.User;

    if (req.user) {
        if (user == req.user.username) {
            return res.redirect('/profile');
        }
        UsersRepo.findUser(user,req.user._id, function (err,result) {
            if (result) {
                CommentRepo.getComments(result[0]._id, function (err, arrComments) {
                    specialNav = {};
                    specialNav.href = "/profile/"+result[0].username;
                    specialNav.name = result[0].username;
                    if (err && err == "No records found") {
                        eventRepo.getUserUpdates(result[0]._id, function (err, resUpdates) {
                            moodCircleRepo.getUserUpdates(result[0]._id, function (err, resCircleUpdates) {
                                profilehelp.joinUpdates(resUpdates, resCircleUpdates, function (updateres) {
                                    result[0].updates = updateres;
                                    res.render('profile', { title: 'GeoMood - Profile: ' + user, qryUser : result[0], user : req.user, specialNav: specialNav, activeLi: "specialnav" });
                                });
                        
                            });
                        });
                    }
                    else if (err) {
                        res.status(500);
                        res.send("something went wrong.");
                    
                    } else {
                        eventRepo.getUserUpdates(result[0]._id, function (err, resUpdates) {
                            moodCircleRepo.getUserUpdates(result[0]._id, function (err, resCircleUpdates) {
                                profilehelp.joinUpdates(resUpdates, resCircleUpdates, function (updateres) {
                                    result[0].updates = updateres;
                                    result[0].comments = arrComments;
                                    res.render('profile', { title: 'GeoMood - Profile: ' + user, qryUser : result[0], user : req.user, specialNav: specialNav, activeLi: "specialnav" });
                                });
                        
                            });
                        });
                    }
                });
            }
            else {
                res.redirect('/');
            }
        });
    }
    else {
        res.redirect('/');
    }
});

module.exports = router;