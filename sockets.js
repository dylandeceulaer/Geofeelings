/*
 * socket connector en socket handlers
 * 
 * 
 */

var emitter = new (require('events').EventEmitter)();
var usersRepo = require("./data/models/usersRepo.js");
var User = require("./data/models/user.js");
var router = require("./routes/api/event.js");
//var app = require("./app.js");

module.exports = function (io , mongoose) {
    var ActiveSockets = [];
    
    router.emitter.on("friendMessage", function (user, data) {
        for (var i = 0; i < ActiveSockets.length; i++) {
            if (ActiveSockets[i].UserId == user) {
                console.log("deze ist", user);
                io.sockets.connected[ActiveSockets[i].id].emit("FriendUpdate", data)
            }
        }
    });
    router.emitter.on("Update", function (data) {
        var latMin = data.center.Lat - 0.05;
        var latMax = data.center.Lat + 0.05;
        var lngMin = data.center.Lng - 0.05;
        var lngMax = data.center.Lng + 0.05;
        
        for (var i = 0; i < ActiveSockets.length; i++) {
            if (ActiveSockets[i].location.lat > latMin && ActiveSockets[i].location.lat < latMax && ActiveSockets[i].location.lng > lngMin && ActiveSockets[i].location.lng < lngMax) {
                io.sockets.connected[ActiveSockets[i].id].emit("Update", data)
            }
        }
    });

    function updateOrAdd(id,userid, loc, next){
        var isFound = false;
        for (var i = 0; i < ActiveSockets.length; i++) {
            if (ActiveSockets[i].id == id) {
                isFound = true;
                ActiveSockets[i].location = loc;
                return next();
            }
        }
        if (!isFound) {
            ActiveSockets.push({ id: id, location: loc,UserId: userid});
            return next();
        }
    }

    io.sockets.on('connection', function (socket) {   

        
        socket.on('updateLocation', function (id,loc) {
            updateOrAdd(socket.id,id,loc, function () { })
        });
        
        router.emitter.on("friendMessage", function (user, data) {
            socket.emit(user, data);
        });
        
        
        socket.on("disconnect", function (){
            for (var i = 0; i < ActiveSockets.length; i++) {
                if (ActiveSockets[i].id == socket.id) {
                    ActiveSockets.splice(i, 1);
                }
            }
        })

        //app.on("appMessage" , function (user) {
        //    console.log("data " , user);
        //    socket.emit("message", "Welkom " + user.username +  " als nieuwe gebruiker.");
        //})
        
        socket.on('newUser', function (user) {
            var user = JSON.parse(user); //repo verwacht een object !!
            usersRepo.createUser(user , function (next) {
                //1. error handling   (nog extern plaatsen)      
                if (next.errors && next.name === 'ValidationError') {
                    var errString = Object.keys(next.errors).map(function (errField) {
                        return next.errors[errField].message;
                    }).join('<br />\n');
                    socket.emit("message", errString);
                } else if (next.errors) {
                    next(new Error(next.message));
                } else {
                    //2. indien geen errors
                    //2.1. socket communicatie
                    socket.emit("message", "Welkom " + user.username + " als nieuwe gebruiker.");
                    socket.broadcast.emit("message", "Nieuwe  gebruiker " + user.username + " is toegevoegd");
                    
                    //2.2. redirect ( geen req of res beschikbaar)
                    socket.emit('creation_success');;
                    return
                }
            });
        });
    });
};