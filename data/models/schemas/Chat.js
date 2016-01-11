
var mongoose = require('mongoose');

var Message = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    },
    message: { type: String, 
        required: true },
    date: { type: Date, 'default': Date.now }
})



var ChatSchema = new mongoose.Schema( {
    user1: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    },
    user2 : {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    },
    isActive: { type: Boolean,default:true },
    messages: [Message]
});



module.exports = ChatSchema;