var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require("../data/models/user");
var UsersRepo = require("../data/models/usersRepo");
var CommentRepo = require("../data/models/commentRepo");


router.get('/', function (req, res) {
    if (req.user)
        CommentRepo.getComments(req.user._id, function (err, arrComments) {
            if (err && err == "No records found") {
                res.render('profileEdit', { title: 'GeoMood - Edit Profile', user : req.user });
            }
            else if (err) {
                console.log(err);
                res.status(500);
                res.send("something went wrong.");
                    
            } else {
                req.user.comments = arrComments;
                res.render('profileEdit', { title: 'GeoMood - Edit Profile', user : req.user });
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
        UsersRepo.findUser(user, function (err,result) {
            if (result) {
                console.log(result);
                CommentRepo.getComments(result[0]._id, function (err, arrComments) {
                    if (err && err == "No records found") {
                        res.render('profile', { title: 'GeoMood - Profile: ' + user, qryUser : result[0], user : req.user });
                    }
                    else if (err) {
                        res.status(500);
                        res.send("something went wrong.");
                    
                    } else {
                        result[0].comments = arrComments;
                        res.render('profile', { title: 'GeoMood - Profile: ' + user, qryUser : result[0], user : req.user });
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