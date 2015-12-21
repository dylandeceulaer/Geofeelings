var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require("../data/models/user");


/* GET home page. */
router.get('/', function (req, res) {
    if(req.user)
        res.render('indexAuthorized', { title: 'GeoMood - How do you feel today?', user : req.user });
    else
        res.render('indexUnauthorized', { title: 'GeoMood - How do you feel today?'});
   // res.redirect('/users');
});

router.get('/Profile', function (req, res) {
    if (req.user)
        res.render('Profile', { title: 'GeoMood - Profile', user : req.user });
    else
        res.redirect('/');
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