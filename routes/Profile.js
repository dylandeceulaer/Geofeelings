var express = require('express');
var router = express.Router();
var passport = require('passport');


router.get('/', function (req, res) {
    if (req.user)
        res.render('profileEdit', { title: 'GeoMood - Profile', user : req.user });
    else
        res.redirect('/');
});

router.get('/:User', function (req, res) {
    var user = req.param.User;
    if (req.user) {
        if (user == req.user.username)
            res.redirect('/profile');
        res.render('profileEdit', { title: 'GeoMood - Profile', user : req.user });
    }
    else
        res.redirect('/');
});

module.exports = router;