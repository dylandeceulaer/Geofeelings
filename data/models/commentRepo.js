
var mongoose = require("mongoose");

CommentRepo = (function () {
    var Comment = require("./comment.js");
   

    var getComments = function (user, next) {
        Comment.find({ owner: user }).populate('author').sort('createdOn').exec(function (err, res) {
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
        putComment = function (comment, next) {
            Comment.create(comment, function (err) {
                if (err) { return next(err); }
                next(comment);
            });
        },

        deleteComment = function (commentId, next) {
            Comment.remove({ _id: commentId }, function (err) {
                if (err) {
                    next(err);
                } else {
                    next();
                }
            });
        };
    
    return {
        getComments : getComments ,
        putComment: putComment,
        deleteComment: deleteComment
    };
})();

module.exports = CommentRepo;