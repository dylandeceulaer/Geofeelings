var mongoose = require("mongoose");
var moodCircleSchema = require("../schemas/moodCircle");
var moodCircle = mongoose.model('MoodCircle', moodCircleSchema, "moodCircles");

module.exports = moodCircle;