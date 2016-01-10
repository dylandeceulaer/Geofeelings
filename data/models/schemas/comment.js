/*
 * schemas/comment.js
 * 
 */

var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    },
    author : {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    },
    comment: { type: String, required: true },
    createdOn: { type: Date, 'default': Date.now }
});



module.exports = CommentSchema;