var express = require('express');
var router = express.Router();
var app = require("../app.js");

//var User = require('../data/models/user');
var UsersRepo = require("../data/models/usersRepo");
var loadUser = require('./middleware/load_user'); //ophalen van één user

router.emitter = new (require('events').EventEmitter)();

/* GET users listing. */
router.get('/', function (req, res) {
    UsersRepo.getAllUsers(function (err , users) {
        if (err) {
            res.status(500).send('server fout bij ophalen van gebruikers');
            res.end();
        }
        res.render('users/index', { title: 'Gebruikers overzicht', userslist: users });
    });
});




router.post('/', function (req, res, next) {
    UsersRepo.createUser(req.body, function (next) {
        //1. error handling   ( nog extern plaatsen)      
        if (next.code === 11000) {
            //res.status(409).send('conflict op username');
            //res.end();
            res.render('users/create', { title: "Gebruiker bestaat reeds", user: req.body , creationDate: new Date().toJSON().slice(0, 10) , errString: next.errmsg });
            return;
        } else if (next.errors && next.name === 'ValidationError') {
            var errString = Object.keys(next.errors).map(function (errField) {
                return next.errors[errField].message;
            }).join('<br />\n');
            res.render('users/create', { title: "Validatie fout voor nieuwe gebruiker", user: req.body , creationDate: new Date().toJSON().slice(0, 10) , errString: errString });
        } else if (next.errors) {
            next(new Error(next.message));
        } else {
            
            //2. indien geen errors
            //2.1. socket communicatie
            router.emitter.emit("routermessage", req.body); //uitbreiding
            //res.app.emit("appMessage", req.body);                    
            //2.2. redirect
            res.redirect('/users');
        }
    });
})



module.exports = router;