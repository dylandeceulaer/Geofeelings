
var mongoose = require("mongoose");

MoodCircleRepo = (function () {
    var MoodCircle = require("./moodCircle.js");
    
    var getMoodCircles = function (next) {
        MoodCircle.find({ }).exec(function (err, res) {
            if (err) {
                console.log(err);
                next(err, null);
            } else if (res.length < 1) {
                next("No records found");
            }
            else
                next(null, res);
        });
    },  
        getMoodCirclesInScope = function (latMin, latMax, lngMin, lngMax, next, isPopulated, fromHour, toHour) {

            fromHour = (typeof x === 'undefined') ? 12 : fromHour;
            toHour = (typeof x === 'undefined') ? 0 : toHour;
            var fromDate = new Date();
            fromDate.setHours(fromDate.getHours() - fromHour);
            var toDate = new Date();
            toDate.setHours(toDate.getHours() - toHour);
            
            console.log(fromHour);
            console.log(toHour);

            if (isPopulated) {
                MoodCircle.where('center.Lat').gte(latMin).lte(latMax).where('center.Lng').gte(lngMin).lte(lngMax).where('votes.Date').gte(fromDate).lte(toDate).populate('votes.voter').exec(function (err, res) {
                    if (err) {
                        console.log(err);
                        next(err, null);
                    } else if (res.length < 1) {
                        next("No records found");
                    }
                    else
                        next(null, res);
                });
            }else{
                MoodCircle.where('center.Lat').gte(latMin).lte(latMax).where('center.Lng').gte(lngMin).lte(lngMax).exec(function (err, res) {
                    if (err) {
                        console.log(err);
                        next(err, null);
                    } else if (res.length < 1) {
                        next("No records found");
                    }
                    else
                        next(null, res);
                });
            }
        },
        getUserUpdates = function (UserId, next, maxUpdates) {
            maxUpdates = (typeof x === 'undefined') ? 5 : maxUpdates;
            MoodCircle.find({ "votes.voter" : UserId }, { votes: 1, name: 1, city: 1 }).sort("votes.Date").limit(maxUpdates).exec(function (err, res) {
                if (err) {
                    console.log(err);
                    next(err, null);
                } else if (res.length < 1) {
                    next("No records found");
                }
                else {
                    for (var ii in res) {
                        for (var i in res[ii].votes) {
                            if (!res[ii].votes[i].voter || !res[ii].votes[i].voter.equals(UserId))
                                delete res[ii].votes[i];
                        }
                    }
                    next(null, res);
                }
            });
        },
        getFriendUpdates = function (Friends, next, maxUpdates) {
            maxUpdates = (typeof x === 'undefined') ? 10 : maxUpdates;
            var fromDate = new Date();
            fromDate.setHours(fromDate.getHours() - 6);
            MoodCircle.find({ $or: Friends }, { votes: 1, name: 1, city: 1, center: 1 }).sort("votes.Date").populate('votes.voter').limit(10).where('votes.Date').gte(fromDate).exec(function (err, res) {
                if (err) {
                    console.log(err);
                    next(err, null);
                } else if (res.length < 1) {
                    next("No records found");
                }
                else {
                    
                    next(null, res);
                }
            });
        },
        updateVotes = function (id,vote,voterId, next) {
            MoodCircle.findOne({ _id: id }).exec(function (err, res) {
                if (res.votes.length == 0)
                    res.votes = [];
                if (vote.toLowerCase() == "happy") {
                    res.votes.push({ voter: voterId, mood:"happy" });
                }else {
                    res.votes.push({ voter: voterId, mood: "unhappy" });
                }
                res.save(function (err, result) {
                    if (err) {
                        console.error(err);
                        next(err, null);
                    } else {
                        res.vot
                        next(null, res);
                    }
                });
            });
        },

        getById = function (id, next) {
            MoodCircle.find({ _id: id }).populate('Votes.').exec(function (err, res) {
                next(err, res);
            });
        },
        deleteMoodCircle = function (moodCircleId, next) {
            MoodCircle.remove({ _id: moodCircleId }, function (err) {
                if (err) {
                    next(err);
                } else {
                    next();
                }
            });
        };
    
    return {
        getMoodCircles : getMoodCircles ,
        updateVotes: updateVotes,
        getById: getById,
        getMoodCirclesInScope: getMoodCirclesInScope,
        getUserUpdates: getUserUpdates,
        getFriendUpdates: getFriendUpdates,
        deleteMoodCircle: deleteMoodCircle
    };
})();

module.exports = MoodCircleRepo;