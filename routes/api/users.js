/*
 * users.js
 * API controller voor users 
 * namespace : /api/users
 */
var express = require('express');
var router = express.Router();
var UsersRepo = require("../../data/models/usersRepo");
var passport = require('passport');
var User = require("../../data/models/user");
var multer = require('multer');

var fu = require('../middleware/fileupload');
var storage = fu.filenameOpts;


var upload = multer({
    storage: storage,
    fileFilter: fu.fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files:1
    }
});


router.get('/:username?', function (req, res) {
    UsersRepo.findUser(req.params.username, function (err , result) {
        if (err) {
            res.status(500);
            res.send('Internal server Error');
        }
        if (result.length > 0) {
            res.status(200);
            res.send('Found');
        }
        else {
            res.status(204);
            res.send('Nothing Found');
                
        }
    });
});


router.get('/byemail/:email?', function (req, res) {
    UsersRepo.findUserByEmail(req.params.email, function (err , result) {
        if (err) {
            res.status(500);
            res.send('Internal server Error');
        }
        if (result.length > 0) {
            res.status(200);
            res.send('Found');
        }
        else {
            res.status(204);
            res.send('Nothing Found');
                
        }
    });
});

router.post('/login', passport.authenticate('local'), function (req, res) {
    
        if (req.user) {
            res.status(200);
            res.send('Success');
        }
        else {
            res.status(401);
            res.send('Unsuccessful');
                
        }
});

router.post('/uploadImage', upload.single('image'), function (req, res) {
    console.log(req.file);
    if (req.file) {
        UsersRepo.updateUser(req.user.username, { image: req.file.filename }, function (err,result){
            if (result) {
                res.status(200);
                res.send(req.file.filename);
            } else {
                res.status(204);
                res.send('Unsuccessful');
            }
        })
    }
    else {
        res.status(204);
        res.send('Unsuccessful');
    }
});



router.post('/signup', function (req, res) {
    User.register(new User({ username : req.body.username, name : req.body.name, email : req.body.email }), req.body.password, function (err, account) {
        if (err) {
            res.status(204);
            res.json({ error : err, account : account });
        } else {
            
            passport.authenticate('local')(req, res, function () {
                res.status(200);
                res.send("Success");
            });
        }
    });
});


module.exports = router;