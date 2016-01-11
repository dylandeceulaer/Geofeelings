var mongoose = require("mongoose");
var chatSchema = require("./schemas/chat");
var Chat = mongoose.model('Chat', chatSchema, "chats");

module.exports = Chat;