﻿var express = require('express');
var router = express.Router();
var ChatRepo = require("../../data/models/chatRepo");
router.emitter = new (require('events').EventEmitter)();


router.emitter.on("sendMessage", function (chatid, userId, message) {
    ChatRepo.addMessage(chatid, userId, message, function (err, res) {
        if (!err) {
            ChatRepo.getChatById(chatid, function (err, res) {
                if (!err) {
                    router.emitter.emit("sendMessageToReceiver", res, userId);
                } else {
                    console.log(err);
                }
            });
           
        } else {
            console.log(err);
        }
    })
});

router.get('/getActiveChatWindows', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in.");
    } else {
        ChatRepo.getActiveChatWindows(req.user._id, function (err , result) {
            if (err) {
                res.status(204);
                res.send('Nothing Found');
                console.log(err);
            }
            else {
                res.status(200);
                res.json(result);
            }
        });
    }
});


router.post('/getChatById', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in.");
    } else {
        ChatRepo.getChatById(req.body.id, function (err , result) {
            if (err) {
                res.status(204);
                res.send('Nothing Found');
                console.log(err);
            }
            else {
                res.status(200);
                res.json(result);
            }
        });
    }
});

router.post('/getChat', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in.");
    } else {
        ChatRepo.getChat(req.body.userid,req.user._id, function (err , result) {
            if (err) {
                res.status(204);
                res.send('Nothing Found');
                console.log(err);
            }
            else {
                res.status(200);
                res.json(result);
            }
        });
    }
});

router.post('/addChatWindow', function (req, res) {
    if (!req.user) {
        res.status(401);
        res.send("you need to be logged in.");
    } else {
        ChatRepo.getChat(req.body.userid, req.user._id, function (err , result) {
            if (err || !result || result.length < 1) {
                ChatRepo.newChat(req.body.userid, req.user._id, function (err, result2) {
                    if (err) {
                        res.status(500);
                        res.send('error');
                        console.log(err);
                    }
                    else {
                        res.status(200);
                        res.json(result2);
                    }
                });
            } else {
                ChatRepo.SetChatActive(result._id, function (err, result2) {
                    if (err) {
                        res.status(500);
                        res.send('error');
                        console.log(err);
                    }
                    else {
                        res.status(200);
                        res.json(result);
                    }
                });
            }
        });
    }
});
module.exports = router;