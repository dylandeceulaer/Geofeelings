﻿
var mongoose = require("mongoose");

EventRepo = (function () {
    var Event = require("./event.js");
    
    var getEvents = function (next) {
        Event.find({}).exec(function (err, res) {
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
        updateEvent = function (id, updatevalues, next) {
            Event.update({ _id: id }, updatevalues, function (error, result) {
                if (error) {
                    console.error(error);
                    return next(error, null);
                }
                else {
                    if (next)
                        return next(null, "ok");
                }
            });
        },
        getEventsInScope = function (latMin, latMax, lngMin, lngMax, next, isPopulated) {
            if (isPopulated) {
                Event.where('center.Lat').gte(latMin).lte(latMax).where('center.Lng').gte(lngMin).lte(lngMax).populate('votes.voter').exec(function (err, res) {
                    if (err) {
                        console.log(err);
                        next(err, null);
                    } else if (res.length < 1) {
                        next("No records found");
                    }
                    else
                        next(null, res);
                });
            } else {
                Event.where('center.Lat').gte(latMin).lte(latMax).where('center.Lng').gte(lngMin).lte(lngMax).exec(function (err, res) {
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
        updateVotes = function (id, vote, voterId, next) {
            
            Event.findOne({ _id: id }).exec(function (err, res) {
                if (res.votes.length == 0)
                    res.votes = [];
                if (vote.toLowerCase() == "happy") {
                    res.votes.push({ voter: voterId, mood: "happy" });
                } else {
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
            Event.find({ _id: id }).populate('Votes.').exec(function (err, res) {
                next(err, res);
            });
        },
        deleteEvent = function (eventId, next) {
            Event.remove({ _id: eventId }, function (err) {
                if (err) {
                    next(err);
                } else {
                    next();
                }
            });
        };
        
    
    return {
        updateEvent: updateEvent,
        getEvents : getEvents ,
        updateVotes: updateVotes,
        getById: getById,
        deleteEvent: deleteEvent,
        getEventsInScope: getEventsInScope
    };
})();

module.exports = EventRepo;