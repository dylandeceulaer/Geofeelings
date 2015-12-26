
var mongoose = require("mongoose");
var commentSchema = require("../schemas/comment");
var Comment = mongoose.model('comment', commentSchema, "comment");  

module.exports = Comment;