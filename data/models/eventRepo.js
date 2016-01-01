
var mongoose = require("mongoose");

EventRepo = (function () {
    var Event = require("./event.js");
    
    var getEvents = function (next) {
        Event.find({ }).exec(function (err, res) {
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
        getEventsInScope = function (latMin,latMax,lngMin,lngMax, next) {
            Model.where('center.Lat').gte(latMin).lte(latMax).where('center.Lng').gte(lngMin).lte(lngMax).exec(function (err, res) {
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
        putEvent = function (event, next) {
            Event.create(event, function (err) {
                if (err) { return next(err); }
                next(event);
            });
        },

        getById = function (id, next) {
            Event.find({ _id: id }).populate('owner').exec(function (err, res) {
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
        getEvents : getEvents ,
        putEvent: putEvent,
        deleteEvent: deleteEvent,
        getById: getById
    };
})();

module.exports = EventRepo;