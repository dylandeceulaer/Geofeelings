
var express = require('express');
var router = express.Router();
var EventRepo = require("../../data/models/eventRepo");
var Event = require("../../data/models/event");


router.get('/', function (req, res) {
    EventRepo.getEvents(function (err , result) {
        if (err) {
            res.status(500);
            res.send('Internal server Error');
            console.log(err);
        }
        else if (result && result.length > 0) {
            res.status(200);
            console.log(result);
            res.json(result);
        }
        else {
            res.status(204);
            res.send('Nothing Found');
                
        }
    });
});

function parseLatLng(val){
    val = val.replace("(", "");
    val = val.replace(")", "");
    return val.split(",");
}

router.post('/addEvent', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in to post a comment.");
    } else {
        var arr = req.body['points[]'];
        var resArr = [];
        for (var val in arr) {
            var result = parseLatLng(arr[val]);
            resArr.push({Lat:result[0],Lng: result[1]})
        }
        var result = parseLatLng(req.body.center);
        var center = { Lat: result[0], Lng: result[1] };

        console.log(arr);
        Event.create({ name: req.body.name, location: req.body.location, center: center,points: resArr }, function (err, result) {
            if (err) {
                console.log(err);
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