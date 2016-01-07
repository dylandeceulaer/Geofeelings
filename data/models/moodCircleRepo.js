
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
        updateVotes = function (id,vote,voterId, next) {
            MoodCircle.findOne({ _id: id }).exec(function (err, res) {
                if (res.votes.length == 0)
                    res.votes = [];
                if (vote.toLowerCase() == "happy") {
                    res.votes.push({ voter: voterId, mood:"happy" });
                }else {
                    res.votes.push({ voter: voterId, mood: "unhappy" });
                }
                res.save(function (err, res) {
                    if (err) {
                        console.error(err);
                        next(err, null);
                    } else {
                        next(null, "ok");
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
        getMoodCirclesInScope: getMoodCirclesInScope
    };
})();

module.exports = MoodCircleRepo;