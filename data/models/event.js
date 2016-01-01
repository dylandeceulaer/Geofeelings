var mongoose = require("mongoose");
var eventSchema = require("../schemas/event");
var Event = mongoose.model('Event', eventSchema, "events");

module.exports = Event;