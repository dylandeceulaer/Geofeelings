var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require("../data/models/user");


/* GET home page. */
router.get('/', function (req, res) {
   res.render('index', { title: 'GeoMood - How do you feel today?', user : req.user });
   // res.redirect('/users');
});


router.post('/login', passport.authenticate('local'), function (req, res) {
    res.redirect('/');
});

router.post('/signup', function (req, res) {
    User.register(new User({ username : req.body.usernamereg, name : req.body.name, email : req.body.email }), req.body.passwordreg, function (err, account) {
        if (err) {
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