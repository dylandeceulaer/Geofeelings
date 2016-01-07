var mongoose = require('mongoose');

var LatLng = new mongoose.Schema({
    Lat: { type: Number },
    Lng: { type: Number }
     
});
var Vote = new mongoose.Schema( {
    voter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    },
    mood: { type: String },
    Date: { type: Date, 'default': Date.now }
})



var EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    center: LatLng,
    radius: { type: Number },
    city: { type: String },
    votes: [Vote]
});


module.exports = EventSchema;