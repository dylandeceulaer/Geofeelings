var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require("../data/models/user");


router.get('/', function (req, res) {
    if(req.user)
        res.render('indexAuthorized', { title: 'GeoMood - How do you feel today?', user : req.user,specialNav:null, activeLi:"index" });
    else
        res.render('indexUnauthorized', { title: 'GeoMood - How do you feel today?', specialNav: null, activeLi: "index"});
});




router.post('/login', passport.authenticate('local'), function (req, res) {
    res.redirect('/');
});

router.post('/signup', function (req, res) {
    User.register(new User({ username : req.body.username, name : req.body.name, email : req.body.email }), req.body.password, function (err, account) {
        if (err) {
            console.log(err);
            return res.render('register', { account : account });
        }
        
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;