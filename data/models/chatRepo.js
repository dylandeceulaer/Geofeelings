
var mongoose = require("mongoose");

ChatRepo = (function () {
    var Chat = require("./chat.js");
    
    var getActiveChatWindows = function (id, next) {
        Chat.find({ $or: [{ user1: id }, { user2: id }], isActive: true }).populate('user1').populate('user2').exec(function (err, res) {
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
        newChat = function (user1, user2, next) {
            Chat.create({ user1: user1, user2: user2 }, function (err, res) {
                if (err) { return next(err); }
                next(null,res);
            });
        },
        addMessage = function (id, senderid, message, next) {
            Chat.findOne({ _id: id }).exec(function (err, res) {
                if (err || !res) {
                    console.log(err);
                    next(err, null);
                } else {
                    if (!res.messages)
                        res.messages = [];
                    res.messages.push({ sender: senderid, message: message });
                    res.save(function (error, result) {
                        if (error) {
                            console.error(error);
                            return next(error);
                        }
                        else {
                            return next(null, result);
                        }
                    });
                }
            });
        },
        getChatById = function (id, next) {
            Chat.findOne({ _id: id }).populate('user1').populate('user2').exec(function (err, res) {
                if (err) {
                    console.log(err);
                    next(err, null);
                } else {
                    next(null, res);
                }
            });
        },
        getChat = function (user1, user2, next) {
            Chat.findOne({ $or: [{ user1: user1 }, { user1: user2 }], $or: [{ user2: user1 }, { user2: user2 }] }, { messages: { $slice: -10 } }).populate('user1').populate('user2').exec(function (err, res) {
                if (err) {
                    console.log(err);
                    next(err, null);
                } else {
                    next(null, res);
                }
            });
        },
        SetChatActive = function (id, next) {
            Chat.update({ _id: id }, {isActive: true}, function (error, result) {
                if (error) {
                    console.error(error);
                    return next(error, null);
                }
                else {
                    return next(null, result);
                }
            });
},
        SetChatInactive = function (id, next) {
            Chat.update({ _id: id }, { isActive: false }, function (error, result) {
                if (error) {
                    console.error(error);
                    return next(error, null);
                }
                else {
                    return next(null, result);
                }
            });
        };
        
    
    return {
        getActiveChatWindows: getActiveChatWindows,
        newChat : newChat ,
        addMessage: addMessage,
        getChatById: getChatById,
        getChat: getChat,
        SetChatActive: SetChatActive,
        SetChatInactive: SetChatInactive
    };
})();

module.exports = ChatRepo;