
var express = require('express');
var router = express.Router();
var EventRepo = require("../../data/models/eventRepo");
var Event = require("../../data/models/event");
var MoodCircleRepo = require("../../data/models/moodCircleRepo");
var MoodCircle = require("../../data/models/moodCircle");
var eventhelp = require("../middleware/eventhelp");
router.emitter = new (require('events').EventEmitter)();


router.post('/getEventsInScope', function (req, res) {
    EventRepo.getEventsInScope(req.body.latMin, req.body.latMax, req.body.lngMin, req.body.lngMax, function (err , result) {
        if (err) {
            if (err == "No records found") {
                res.status(204);
                res.send('Nothing Found');
            } else {
                res.status(500);
                res.send('Internal server Error');
                console.log(err);
            }
        }
        else if (result && result.length > 0) {
            res.status(200);
            res.json(result);
        }
        else {
            res.status(204);
            res.send('Nothing Found');
        }
    },true);
});



router.post('/getFriendUpdates', function (req, res) {
    var friends = [];
    var friendsFlat = [];
    for (var i = 0; i < req.user.friends.length; i++) {
        if (req.user.friends[i].isAccepted) {
            friends.push({ "votes.voter": req.user.friends[i].user._id })
            friendsFlat.push(req.user.friends[i].user._id);
        }
    }
    MoodCircleRepo.getFriendUpdates(friends, function (err, resultCircle) {
            EventRepo.getFriendUpdates(friends, function (err, resultEvent) {
                if (!err) {
                eventhelp.joinUpdates(resultCircle, resultEvent, friendsFlat, function (result) {
                        res.status(200);
                        res.json(result);
                    })
                    
                } else {
                    res.status(500);
                    console.log(err);
                    res.send('Internal server Error');
                }
            });
       
    });
});
router.post('/getMoodCirclesInScope', function (req, res) {
    MoodCircleRepo.getMoodCirclesInScope(req.body.latMin, req.body.latMax, req.body.lngMin, req.body.lngMax, function (err , result) {
        if (err) {
            if (err == "No records found") {
                res.status(204);
                res.send('Nothing Found');
            } else {
                res.status(500);
                res.send('Internal server Error');
                console.log(err);
            }
        }
        else if (result && result.length > 0) {
            res.status(200);
            res.json(result);
        }
        else {
            
            res.status(204);
            res.send('Nothing Found');
        }
    },true);
});

router.post('/updateEvent', function (req, res) {
    if (!req.user.role.name || req.user.role.name == "User") {
        res.status(401);
        res.send("You need to be administrator.");
    } else {
        var name = req.body.name;
        var location = req.body.location;
        var vals = {};
        if (name)
            vals.name = name;
        if (location)
            vals.location = location;
        
        EventRepo.updateEvent(req.body.id, vals, function (err , result) {
            if (err) {
                if (err == "No records found") {
                    res.status(204);
                    res.send('Nothing Found');
                } else {
                    res.status(500);
                    res.send('Internal server Error');
                    console.log(err);
                }
            }
            else if (result && result.length > 0) {
                res.status(200);
                res.json(result);
            }
            else {
                res.status(204);
                res.send('Nothing Found');
            }
        });
    }
});

router.post('/deleteEvent', function (req, res) {
    if (!req.user.role.name || req.user.role.name == "User") {
        res.status(401);
        res.send("You need to be administrator.");
    } else {
        EventRepo.deleteEvent(req.body.id, function (err , result) {
            if (err) {
                if (err == "No records found") {
                    res.status(204);
                    res.send('Nothing Found');
                } else {
                    res.status(500);
                    res.send('Internal server Error');
                    console.log(err);
                }
            }
            else {
                res.status(200);
                res.send('ok');
            }
        });
    }
});

router.post('/deleteMoodCirle', function (req, res) {
    if (!req.user.role.name || req.user.role.name == "User") {
        res.status(401);
        res.send("You need to be administrator.");
    } else {
        MoodCircleRepo.deleteMoodCircle(req.body.id, function (err , result) {
            if (err) {
                if (err == "No records found") {
                    res.status(204);
                    res.send('Nothing Found');
                } else {
                    res.status(500);
                    res.send('Internal server Error');
                    console.log(err);
                }
            }
            else {
                res.status(200);
                res.send('ok');
            }
        });
    }
});
function parseLatLng(val){
    val = val.replace("(", "");
    val = val.replace(")", "");
    return val.split(",");
} 

router.post('/addVoteEvent', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in.");
    }else {
        EventRepo.updateVotes(req.body.id, req.body.vote, req.user._id, function (err, result) {
            if (err) {
                res.status(500);
                res.send("Something went wrong.");
                console.error(err);
            }
            else {
                result._doc.voter = req.user;
                result._doc.type = "event";
                for (var i = 0; i < req.user.friends.length; i++) {
                    if (req.user.friends[i].isAccepted) {
                        
                        router.emitter.emit("friendMessage", req.user.friends[i].user._id, result);
                    }
                }
                router.emitter.emit("Update", result);
                res.status(200);

                res.send("Successfull");                  
            }
        });
    }
    
});

router.post('/addVoteMoodCircle', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in.");
    } else {
        MoodCircleRepo.updateVotes(req.body.id, req.body.vote, req.user._id, function (err, result) {
            if (err) {
                res.status(500);
                res.send("Something went wrong.");
                console.error(err);
            }
            else {
                result._doc.isNew = false;
                if (result.votes.length == 1)
                    result._doc.isNew = true;
                result._doc.voter = req.user;
                result._doc.type = "moodCircle";
                for (var i = 0; i < req.user.friends.length; i++) {
                    if (req.user.friends[i].isAccepted) {
                        
                        router.emitter.emit("friendMessage", req.user.friends[i].user._id, result);
                    }
                }
                router.emitter.emit("Update", result);
                res.status(200);
                res.send("Successfull");
            }
        });
    }
    
});


router.post('/addEvent', function (req, res) {
    if (!req.user.role.name || req.user.role.name == "User") {
        res.status(401);
        res.send("You need to be administrator.");
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
                res.json(result);
            }
        });
    }
});
router.post('/addMoodCircle', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in to post a comment.");
    } else {
        
        var result = parseLatLng(req.body.center);
        var center = { Lat: result[0], Lng: result[1] };
        
        MoodCircle.create({ name: req.body.name, city: req.body.city, center: center, radious: req.body.radius }, function (err, result) {
            if (err) {
                console.log(err);
                res.status(500);
                res.send("something went wrong");
            } else {
                
                res.status(200);
                res.json(result);
            }
        });
    }
});



module.exports = router;