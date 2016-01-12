var updateLocation;
var sendMessage;
$(function () {
    var hostname = window.location.protocol + "//" + window.location.host;
    var socket = io.connect(hostname);
    
    

    socket.on('message', function (message) {
    });

    updateLocation = function (id,loc){
        socket.emit("updateLocation",id,loc);
    }
    
    sendMessage = function (chatId, userId, message){
        socket.emit("sendMessage", chatId, userId, message)
    }
    
    socket.on("MessageSuccess", function (chat) {
        console.log(chat)
        var receiver;
        if (chat.user1._id == user._id)
            receiver = chat.user2;
        else
            receiver = chat.user1;

        $("#btn-input").val("");
            $("ul.pagination.pagination-sm > li").removeClass("active");
            $("ul.pagination.pagination-sm > li[data-userid='" + receiver._id + "']").addClass("active");
            $('div.msg_container_base').hide();
        $('div[data-chatid=' + chat._id + "]").show();
        
        var image = "/images/NoPic.jpg";
        if (user.image)
            image = "/userimages/"+user.image
        
        $('div[data-chatid=' + chat._id + "]").append('<div class="row msg_container base_receive"><div class="col-md-2 col-xs-2 avatar"><a href="/profile"><img src="'+ image+'" class="img-responsive"></a></div><div class="col-md-10 col-xs-10"><div class="messages msg_receive"><p>'+chat.messages[chat.messages.length-1].message+'</p><time> You • '+ FriendlyDate(chat.messages[chat.messages.length - 1].date)+' ago</time></div></div></div>')
        $('div[data-chatid=' + chat._id + "]").get(0).scrollTop = $('div[data-chatid=' + chat._id + "]").get(0).scrollHeight;
            
    });
    socket.on("NewMessage", function (chat) {
        
        var sender;
        if (chat.user1._id == user._id)
            sender = chat.user2;
        else
            sender = chat.user1;
        startChat(sender._id, sender.username, function (isCreated) {
            if (!isCreated) {
                if($("#headingFive").hasClass("collapsed"))
                    $("#headingFive").addClass("newMessage");
                console.log($('li[data-chatid=' + chat._id + "]"));
                if(!$('li[data-chatid=' + chat._id + "]").hasClass("active")) {
                    $('li[data-chatid=' + chat._id + "] > a").addClass("newMessage");
                }
                var image = "/images/NoPic.jpg";
                if (sender.image)
                    image = "/userimages/" + sender.image
                
                $('div[data-chatid=' + chat._id + "]").append('<div class="row msg_container base_sent"><div class="col-md-10 col-xs-10"><div class="messages base_sent"><p>' + chat.messages[chat.messages.length - 1].message + '</p><time><a href="/profile/' + sender.username + '">' + sender.username + '</a> • ' + FriendlyDate(chat.messages[chat.messages.length - 1].date) + ' ago</time></div></div><div class="col-md-2 col-xs-2 avatar"><a href="/profile/'+ sender.username+'"><img src="' + image + '" class="img-responsive"></a></div></div>')
                
                console.log($('div[data-chatid=' + chat._id + "]"));
                $('div[data-chatid=' + chat._id + "]").get(0).scrollTop = $('div[data-chatid=' + chat._id + "]").get(0).scrollHeight;
            } else {
                $('#accordion > .panel > .panel-collapse').collapse('hide');
                $('#collapseFive').collapse('show');
            }
        })
    });
    socket.on("Update", function (update) {

        if (user._id == update.votes[update.votes.length - 1].voter || socketAdditions.indexOf(update.votes[update.votes.length - 1]._id) >= 0) {
        } else {

            socketAdditions.push(update.votes[update.votes.length - 1]._id);

            if (update.type == "moodCircle") {
                if (update.isNew) {
                    addMoodCircle(update);
                } else {
                    for (var ci in circles) {
                        if (circles[ci].id == update._id) {
                            var currCircle = circles[ci];
                            currCircle.votes.push({ voter: update.voter, mood: update.votes[update.votes.length - 1].mood });
                            currCircle.voteBalance = 0;
                            if (currCircle.votes) {
                                for (var i in currCircle.votes) {
                                    if (currCircle.votes[i].mood == "happy")
                                        currCircle.voteBalance++;
                                    if (currCircle.votes[i].mood == "unhappy")
                                        currCircle.voteBalance--;
                                }
                            }
                            if (currCircle.voteBalance > 0) {
                                currCircle.setOptions({
                                    fillColor: '#fff200',
                                });
                            }
                            
                            if (currCircle.voteBalance < 0) {
                                currCircle.setOptions({
                                    fillColor: '#2cabff',
                                });
                            }
                            if (currCircle.voteBalance == 0) {
                                if (currCircle.votes[currCircle.votes.length - 1].mood == "happy") {
                                    currCircle.setOptions({
                                        fillColor: '#fff200',
                                    });
                                } else {
                                    currCircle.setOptions({
                                        fillColor: '#2cabff',
                                    });
                                }
                            }
                            
                            var multiplier = currCircle.voteBalance;
                            if (currCircle.voteBalance < 0)
                                multiplier = multiplier * (-1);
                            
                            if (multiplier != 0)
                                currCircle.setRadius(30 + (20 * multiplier) - 20)
                            if (multiplier == 0)
                                currCircle.setRadius(30 + (20 * multiplier))
                        }
                    }
                }
            }
            else {
                for (var ev in events) {
                    if (events[ev].id == update._id) {
                        var event = events[ev];
                        event.votes.push({ voter: update.voter, vote: update.votes[update.votes.length - 1].mood });
                        if (update.votes[update.votes.length - 1].mood == "happy")
                            event.voteBalance++;
                        if (update.votes[update.votes.length - 1].mood == "unhappy")
                            event.voteBalance--;
                        if (event.voteBalance > 0) {
                            event.setOptions({
                                fillColor: '#fff200',
                                strokeColor: '#fff200'
                            });
                        }
                        if (event.voteBalance < 0) {
                            event.setOptions({
                                fillColor: '#2cabff',
                                strokeColor: '#2cabff'
                            });
                        }
                        if (event.voteBalance == 0) {
                            event.setOptions({
                                fillColor: '#f00',
                                strokeColor: '#f00'
                            });
                        }
                    }
                }
            }
        }
        var loc = "";
        var src = "";
        var placeLoc = "";
        if (update.voter.image)
            src = "style = 'background-image: url(/userimages/" + update.voter.image + ")'";
        if (update.voter.location)
            loc = update.voter.location;
        var img = "<div class='img-circle profile-item-image' " + src + " ' ></div>";
        var WantsToChat;
        if (update.voter.Available)
            WantsToChat = "Wants to chat!";
        else
             WantsToChat = "Doesn't want to chat";
        
        var content = "<div class='col-xs-6'>" + img + "</div><div class='col-xs-6'>" + update.voter.name + "<br><strong>" + WantsToChat + "</strong><br>" + loc + "</div>"
        if (update.type == "moodCircle")
            placeLoc = 'around <a class="location-link" data-type="' + update.type + '" data-locId="' + update._id + '" href="#">' + update.name + '</a>';
        if (update.type == "event")
            placeLoc = 'at the <a class="location-link" data-type="' + update.type + '" data-locId="' + update._id + '" href="#">' + update.name + '</a> event in ' + update.location;
        var obj = $('<div class="panel"><div class="panel-body activity-item"><a class="hoverUser" href="/profile/' + update.voter.username + '"  data-html="true" data-content="' + content + '"  rel="popover" data-original-title="' + update.voter.username + '" data-trigger="hover" data-userId="' + update.voter._id + '"> ' + update.voter.username + '</a> was <span class="' + update.votes[update.votes.length - 1].mood + '">' + update.votes[update.votes.length - 1].mood + '</span> ' + placeLoc + '.<br><strong>' + FriendlyDate(update.votes[update.votes.length - 1].Date) + ' ago</strong></div></div>');
        $("#collapseTwo > .panel-body > .empty").remove();
        $("#collapseTwo > .panel-body").prepend(obj);
        obj.children(".panel-body").children(".hoverUser").popover({ trigger: "hover" });
        if (update.voter.Available) {
            obj.children(".panel-body").children(".hoverUser").click(function (e) {
                e.preventDefault();
                $('#collapseFive').collapse('show');
                $($(this).parent().parent().parent().parent()).collapse('hide');
                startChat($(this).attr('data-userid'), $(this).attr('data-original-title'));
            });
        }
        obj.children(".panel-body").children(".location-link").click(function (e) {
            e.preventDefault();
            if ($(this).attr("data-type") == "event") {
                for (var ev in events) {
                    if (events[ev].id == $(this).attr("data-locid")) {
                        map.setCenter(events[ev].center);
                        map.setZoom(16
                        );
                    }
                }
            }
            if ($(this).attr("data-type") == "moodCircle") {
                for (var ci in circles) {
                    if (circles[ci].id == $(this).attr("data-locid")) {
                        isFound = true;
                        map.setCenter(circles [ci].center);
                        map.setZoom(17);
                    }
                }
            }
        });
    });

    //For Friends feed
    socket.on("FriendUpdate", function (update) {
        if (socketAdditions.indexOf(update.votes[update.votes.length - 1]._id < 0)) {
            socketAdditions.push(update.votes[update.votes.length - 1]._id);
            if (update.type == "moodCircle") {
                
                if (update.isNew) {
                    addMoodCircle(update);
                } else {
                    for (var ci in circles) {
                        if (circles[ci].id == update._id) {
                            var currCircle = circles[ci];
                            currCircle.votes.push({ voter: update.voter, mood: update.votes[update.votes.length - 1].mood });
                            currCircle.voteBalance = 0;
                            if (currCircle.votes) {
                                for (var i in currCircle.votes) {
                                    if (currCircle.votes[i].mood == "happy")
                                        currCircle.voteBalance++;
                                    if (currCircle.votes[i].mood == "unhappy")
                                        currCircle.voteBalance--;
                                }
                            }
                            if (currCircle.voteBalance > 0) {
                                currCircle.setOptions({
                                    fillColor: '#fff200',
                                });
                            }
                            
                            if (currCircle.voteBalance < 0) {
                                currCircle.setOptions({
                                    fillColor: '#2cabff',
                                });
                            }
                            if (currCircle.voteBalance == 0) {
                                if (currCircle.votes[currCircle.votes.length-1].mood == "happy") {
                                    currCircle.setOptions({
                                        fillColor: '#fff200',
                                    });
                                } else {
                                    currCircle.setOptions({
                                        fillColor: '#2cabff',
                                    });
                                }
                            }
                            
                            var multiplier = currCircle.voteBalance;
                            if (currCircle.voteBalance < 0)
                                multiplier = multiplier * (-1);
                            
                            if (multiplier != 0)
                                currCircle.setRadius(30 + (20 * multiplier) - 20)
                            if (multiplier == 0)
                                currCircle.setRadius(30 + (20 * multiplier))
                        }
                    }
                }
            }
            else {
                for (var ev in events) {
                    if (events[ev].id == update._id) {
                        var event = events[ev];
                        event.votes.push({ voter: update.voter, vote: update.votes[update.votes.length - 1].mood });
                        if (update.votes[update.votes.length - 1].mood == "happy")
                            event.voteBalance++;
                        if (update.votes[update.votes.length - 1].mood == "unhappy")
                            event.voteBalance--;
                        if (event.voteBalance > 0) {
                            event.setOptions({
                                fillColor: '#fff200',
                                strokeColor: '#fff200'
                            });
                        }
                        if (event.voteBalance < 0) {
                            event.setOptions({
                                fillColor: '#2cabff',
                                strokeColor: '#2cabff'
                            });
                        }
                        if (event.voteBalance == 0) {
                            event.setOptions({
                                fillColor: '#f00',
                                strokeColor: '#f00'
                            });
                        }
                    }
                }
            }
            
            if (update.type == "event") {
                for (var ev in events) {
                    if (events[ev].id == update.id) {
                        isFound = true;
                    }
                }
                if (!isFound)
                    OutOfMapLocations.push({ id: update.id , center: { lng: update.center.Lng, lat: update.center.Lat } })
            }
            if (update.type == "moodCircle") {
                var isFound = false;
                for (var ci in circles) {
                    if (circles[ci].id == update.id) {
                        isFound = true;
                    }
                }
                if (!isFound)
                    OutOfMapLocations.push({ id: update.id , center: { lng: update.center.Lng, lat: update.center.Lat } })
            }
        
        }
        var loc = "";
        var src = "";
        var placeLoc = "";
        if (update.voter.image)
            src = "style = 'background-image: url(/userimages/" + update.voter.image + ")'";
        if (update.voter.location)
            loc = update.voter.location;
        var img = "<div class='img-circle profile-item-image' " + src + " ' ></div>";
        var WantsToChat;
        if (update.voter.Available)
            WantsToChat = "Wants to chat!";
        else
            WantsToChat = "Doesn't want to chat";
        
        var content = "<div class='col-xs-6'>" + img + "</div><div class='col-xs-6'>" + update.voter.name + "<br><strong>" + WantsToChat + "</strong><br>" + loc + "</div>"
        if (update.type == "moodCircle")
            placeLoc = 'around <a class="location-link" data-type="' + update.type + '" data-locId="' + update._id + '" href="#">' + update.name + '</a>';
        if (update.type == "event")
            placeLoc = 'at the <a class="location-link" data-type="' + update.type + '" data-locId="' + update._id + '" href="#">' + update.name + '</a> event in ' + update.location;
        var obj = $('<div class="panel"><div class="panel-body activity-item"><a class="hoverUser" href="/profile/' + update.voter.username + '"  data-html="true" data-content="' + content + '"  rel="popover" data-original-title="' + update.voter.username + '" data-trigger="hover" data-userId="' + update.voter._id + '"> ' + update.voter.username + '</a> was <span class="' + update.votes[update.votes.length - 1].mood + '">' + update.votes[update.votes.length - 1].mood + '</span> ' + placeLoc + '.<br><strong>' + FriendlyDate(update.votes[update.votes.length - 1].Date) + ' ago</strong></div></div>');
        $("#collapseOne > .panel-body > .empty").remove();
        $("#collapseOne > .panel-body").prepend(obj);
        obj.children(".panel-body").children(".hoverUser").popover({ trigger: "hover" });
        if (update.voter.Available) {
            obj.children(".panel-body").children(".hoverUser").click(function (e) {
                e.preventDefault();
                $('#collapseFive').collapse('show');
                $($(this).parent().parent().parent().parent()).collapse('hide');
                startChat($(this).attr('data-userid'), $(this).attr('data-original-title'));
            });
        }
        obj.children(".panel-body").children(".location-link").click(function (e) {
            e.preventDefault();
            if ($(this).attr("data-type") == "event") {
                var isFound = false;
                for (var ev in events) {
                    if (events[ev].id == $(this).attr("data-locid")) {
                        isFound = true;
                        map.setCenter(events[ev].center);
                        map.setZoom(16
                        );
                    }
                }
                if (!isFound) {
                    for (var o in OutOfMapLocations) {
                        if (OutOfMapLocations[o].id == $(this).attr("data-locid")) {
                            map.setCenter(OutOfMapLocations[o].center);
                            map.setZoom(16);
                        }
                    }
                }
            }
            if ($(this).attr("data-type") == "moodCircle") {
                var isFound = false;
                for (var ci in circles) {
                    if (circles[ci].id == $(this).attr("data-locid")) {
                        isFound = true;
                        map.setCenter(circles [ci].center);
                        map.setZoom(17);
                    }
                }
                if (!isFound) {
                    for (var o in OutOfMapLocations) {
                        if (OutOfMapLocations[o].id == $(this).attr("data-locid")) {
                            map.setCenter(OutOfMapLocations[o].center);
                            map.setZoom(17);
                        }
                    }
                }
            }
        
        });
    });
    function FriendlyDate(date1) {
        var seconds = Math.round((Date.now() - Date.parse(date1)) / 1000);
        var minutes = Math.round(seconds / 60);
        var hours = Math.round(minutes / 60);
        var days = Math.round(hours / 24);
        if (days == 1) return "A day";
        else if (days > 1) return days + " days";
        else if (hours == 1) return "An hour";
        else if (hours >= 1) return hours + " hours";
        else if (minutes == 1) return "A minute";
        else if (minutes >= 1) return minutes + " minutes";
        else return seconds + " seconds";
    };

});