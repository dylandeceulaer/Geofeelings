var mongoose = require('mongoose');

var LatLng = new mongoose.Schema({
    Lat: { type: Number },
    Lng: { type: Number }
     
});

var EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    center: LatLng,
    location: { type: String },
    points: [LatLng]
});


module.exports = EventSchema;