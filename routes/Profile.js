var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require("../data/models/user");
var UsersRepo = require("../data/models/usersRepo");
var CommentRepo = require("../data/models/commentRepo");
var friendCheck = require('./middleware/friendCheck.js');


router.get('/', function (req, res) {
    if (req.user)
        CommentRepo.getComments(req.user._id, function (err, arrComments) {
            specialNav = {};
            specialNav.href = "/profile";
            specialNav.name = "Edit Profile";
            if (err && err == "No records found") {
                res.render('profileEdit', { title: 'GeoMood - Edit Profile', user : req.user, specialNav: specialNav, activeLi: "specialnav"});
            }
            else if (err) {
                console.log(err);
                res.status(500);
                res.send("something went wrong.");
                    
            } else {
                req.user.comments = arrComments;
                res.render('profileEdit', { title: 'GeoMood - Edit Profile', user : req.user, specialNav: specialNav, activeLi: "specialnav" });
                console.log(arrComments);
            }
        });
    else
        res.redirect('/');
});
router.get('/:User', function (req, res) {
    var user = req.params.User;

    if (req.user) {
        if (user == req.user.username) {
            res.redirect('/profile');
        }
        UsersRepo.findUser(user,req.user._id, function (err,result) {
            if (result) {
                CommentRepo.getComments(result[0]._id, function (err, arrComments) {
                    specialNav = {};
                    specialNav.href = "/profile/"+result[0].username;
                    specialNav.name = result[0].username;
                    if (err && err == "No records found") {
                        res.render('profile', { title: 'GeoMood - Profile: ' + user, qryUser : result[0], user : req.user,specialNav: specialNav, activeLi: "specialnav" });
                    }
                    else if (err) {
                        res.status(500);
                        res.send("something went wrong.");
                    
                    } else {
                        result[0].comments = arrComments;
                        res.render('profile', { title: 'GeoMood - Profile: ' + user, qryUser : result[0], user : req.user, specialNav: specialNav, activeLi: "specialnav" });
                        console.log(arrComments);
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