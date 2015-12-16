/*
 * users.js
 * API controller voor users 
 * namespace : /api/users
 */
var express = require('express');
var router = express.Router();
var UsersRepo = require("../../data/models/usersRepo");
var passport = require('passport');


/*
var loadUser = require('../middleware/load_user.js')



//--- pagina oproepen met een XMLHTTP call
router.get('/apiCall', function (req, res) {
    res.render('users/apiCall', {
        title: 'Ophalen van users met XMLHTTP'
    })
});

//---- API controller
router.get('/', function (req, res) {
    UsersRepo.getAllUsers(function (err , users) {
        if (err) {
            res.json(err);
        }
        res.json(users);
        //res.end(JSON.stringify(users)); //alternatief
    }); 
});
 * 
 * */


router.get('/:username?', function (req, res) {
    UsersRepo.findUser(req.params.username,function (err , result) {
        if (err) {
                    res.send('nok');
        }
        if (result.length > 0) {
               res.send('ok');
        }
        else {
               res.send('nok');
                
        }
    });
});

router.post('/login', passport.authenticate('local'), function (req, res) {
    
        if (req.user) {
            res.send('ok');
        }
        else {
            res.send('nok');
                
        }
});


module.exports = router;