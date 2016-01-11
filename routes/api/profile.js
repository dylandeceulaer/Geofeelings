
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


router.post('/putComment', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in to post a comment.");
    } else {
        Comment.create({ owner: req.body.owner, author: req.user._id, comment: req.body.comment }, function (err, result) {
            if (err) {
                res.status(500);
                res.send("something went wrong");
            } else {
                res.status(200);
                res.send("Comment added");
            }
        });
    }
});

router.post('/deleteComment', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in to delete a comment.");
    } else {
        CommentRepo.getById(req.body.id, function (err, comment) {
            console.log("user: "+req.user._id+" comm "+comment[0].owner._id)
            if (err) {
                res.status(500);
            }
            
            else if (comment[0].owner.username == req.user.username) {
                CommentRepo.deleteComment(req.body.id, function (err) {
                    if (err) {
                        res.status(500);
                        res.send("Server error");
                    }
                    else {
                        res.status(200);
                        res.send("Comment deleted");
                    }
                });
            } else {
                res.status(401);
                res.send("Unauthorized");
            }
        });
            
        }
    
});


module.exports = router;