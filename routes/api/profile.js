
var express = require('express');
var router = express.Router();
var CommentRepo = require("../../data/models/commentRepo");
var Comment = require("../../data/models/comment");

router.get('/', function (req, res) {
    CommentRepo.getComments(req.user._id, function (err , result) {
        if (err) {
            res.status(500);
            res.send('Internal server Error');
        }
        if (result.length > 0) {
            res.status(200);
            res.json(result);
        }
        else {
            res.status(204);
            res.send('Nothing Found');
                
        }
    });
});


//router.get('/byemail/:email?', function (req, res) {
//    UsersRepo.findUserByEmail(req.params.email, function (err , result) {
//        if (err) {
//            res.status(500);
//            res.send('Internal server Error');
//        }
//        if (result.length > 0) {
//            res.status(200);
//            res.send('Found');
//        }
//        else {
//            res.status(204);
//            res.send('Nothing Found');
                
//        }
//    });
//});

router.post('/putComment', function (req, res) {
    Comment.create({owner: req.body.owner, author: req.user._id, comment: req.body.comment },function(err, result){
        if (err) {
            res.status(500);
            res.send("something went wrong");
        } else {
            res.status(200);
            res.send("Comment added");
        }
    });
});


module.exports = router;