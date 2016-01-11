//TODO: ZO EEN CHATTERKE ZO
//TODO: EVENTS


var map;
var service;
var circles = [];
var overlay;
var geocoder;
var events = [];
var votes = [];
var infowindow;
var OutOfMapLocations = [];
var socketAdditions = [];


function XHRPost(url, param, cb) {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", url, true);
    oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    oReq.addEventListener('load', cb);
    oReq.send(param);
}

function XHRGet(url, cb) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', cb);
    oReq.open("get", url, true);
    oReq.send();
}



function addEvent(res) {
    var cords = [];
    for (var i in res.points) {
        cords.push({ lng: res.points[i].Lng, lat: res.points[i].Lat })
    }
    var rectangle = new google.maps.Polygon({
        paths: cords,
        strokeWeight: 1,
        fillOpacity: 0.65,
        strokeColor: '#F00',
        fillColor: '#F00',
        map: map
    });
    rectangle.setMap(map);
    rectangle.name = res.name;
    rectangle.id = res._id;
    rectangle.center = { lat: res.center.Lat, lng: res.center.Lng };
    rectangle.location = res.location;
    rectangle.votes = res.votes;
    
    rectangle.voteBalance = 0;
    if (rectangle.votes) {
        for (var i in rectangle.votes) {
            if (rectangle.votes[i].mood == "happy")
                rectangle.voteBalance++;
            if (rectangle.votes[i].mood == "unhappy")
                rectangle.voteBalance--;
        }
    }
    
    if (rectangle.voteBalance > 0) {
        rectangle.setOptions({
            fillColor: '#fff200',
            strokeColor: '#fff200'
        });
    }
    if (rectangle.voteBalance < 0) {
        rectangle.setOptions({
            fillColor: '#2cabff',
            strokeColor: '#2cabff'
        });
    }
    
    if (user.role.name == "Administrator") {
        rectangle.addListener('click', function () {
            document.getElementById("link" + this.id).click();
        });
    }
    events.push(rectangle);
    
    if (user.role.name == "Administrator") {
        var id = Math.round(Math.random() * 10000000000000000);
        var object = $('<div class="panel panel-success"><div class="panel-heading"><h4 class="panel-title"><a id="link' + res._id + '" data-toggle="collapse" href="#' + id + '">' + rectangle.name + ', ' + rectangle.location + '</a></h4></div><div id="' + id + '" class="panel-collapse collapse"><div class="panel-body" id="' + res._id + '"><input class="form-control input-name" placeholder="name" value="' + rectangle.name + '"/><input class="form-control input-location" placeholder="location" value="' + rectangle.location + '"/><button class="event-button locate-event btn btn-default">Locate</button><button class="event-button delete-event btn btn-default">Delete</button></div></div></div>').insertAfter($("#AdminEventsBody").children().last());
        
        var elements = object.children(".panel-collapse").children().first();
        elements.children(".input-location").change(function (e) {
            var params = "id=" + $(this).parent().attr("id") + "&location=" + $(this).val();
            var obj = this;
            XHRPost("/api/event/updateEvent", params, function () {
                if (this.status == 200) {
                    updateTitle(obj)
                }
            });
        });
        elements.children(".delete-event").click(function (e) {
            var thiss = this;
            bootbox.confirm("Are you sure you want to delete this event?", function (ev) {
                if (ev) {
                    var id = $(thiss).parent().attr("id")
                    var params = "id=" + id;
                    var obj = thiss;
                    XHRPost("/api/event/deleteEvent", params, function () {
                        if (this.status == 200) {
                            for (var value in events) {
                                if (events[value].id == id) {
                                    events[value].setMap(null);
                                    delete events[value]
                                }
                            }
                            $(obj).parent().parent().parent().remove();
                        }
                    });
                }
            });
        });
        elements.children(".locate-event").click(function (e) {
            map.setCenter(rectangle.center);
            map.setZoom(16);
        });
        elements.children(".input-name").change(function (e) {
            var params = "id=" + $(this).parent().attr("id") + "&name=" + $(this).val();
            var obj = this;
            XHRPost("/api/event/updateEvent", params, function () {
                if (this.status == 200) {
                    updateTitle(obj)
                }
            });
                        
        });
        function updateTitle(obj) {
            $(obj).parent().parent().parent().children(".panel-heading").children("h4").children("a").text($(obj).parent().children(".input-name").val() + ", " + $(obj).parent().children(".input-location").val());
        }
    }
    
    $("#collapseThree > .panel-body > .empty").remove();
    
    var color = "#f5f5f5";
    if (rectangle.voteBalance > 0)
        color = "#fad400";
    if (rectangle.voteBalance < 0)
        color = "#2cabff";
    
    var thisvotes = rectangle.votes;
    thisvotes.splice(0, thisvotes.length-3);
    var votesdiv = "";
    for (var v in thisvotes) {
        var loc = "";
        var src = "";
        if (thisvotes[v].voter.image)
            src = "style = 'background-image: url(/userimages/" + thisvotes[v].voter.image + ")'";
        if (thisvotes[v].voter.location)
            loc = thisvotes[v].voter.location;
        var img = "<div class='img-circle profile-item-image' " + src + " ' ></div>";
        var content = "<div class='col-xs-6'>" + img + "</div><div class='col-xs-6'>" + thisvotes[v].voter.name + "<br>" + loc + "</div>"
        votesdiv = votesdiv + '<br><a class="hoverUser" href="/profile/' + thisvotes[v].voter.username + '"  data-html="true" data-content="' + content + '"  rel="popover" data-original-title="' + thisvotes[v].voter.username + '" data-trigger="hover" data-userId="' + thisvotes[v].voter._id + '"> ' + thisvotes[v].voter.username + '</a> was <span class="' + thisvotes[v].mood + '">' + thisvotes[v].mood + '</span> - <strong>' + FriendlyDate(thisvotes[v].Date) + ' ago</strong>';
    }
    var obj = $('<div class="panel panel-default"><div class="panel-heading" style="background-color:' + color + '"><h4 class="panel-title" >' + rectangle.name + ', ' + rectangle.location + '</h4></div><div class="panel-body" id="' + res._id + '"><strong>Latest votes:</strong>'+ votesdiv+'<button class="event-button locate-event btn btn-default">Locate</button></div></div>');
    var object = $("#collapseThree > .panel-body").append(obj);
    var elements = obj.children(".panel-body");
    elements.children(".locate-event").click(function (e) {
        map.setCenter(rectangle.center);
        map.setZoom(16);
    });
    if (rectangle.votes)
        for (var item in rectangle.votes) {
            rectangle.votes[item].type = "event";
            rectangle.votes[item].name = rectangle.name;
            rectangle.votes[item].id = rectangle.id;
            rectangle.votes[item].city = rectangle.location;
            votes.push(rectangle.votes[item]);
        }

}
function addMoodCircle(res) {
    var moodCircle = new google.maps.Circle({
        strokeWeight: 0,
        fillOpacity: 0.65,
        map: map,
        center: { lat: res.center.Lat, lng: res.center.Lng }
    });
    moodCircle.id = res._id;
    moodCircle.votes = res.votes;
    moodCircle.name = res.name;
    moodCircle.city = res.city;
    
    moodCircle.addListener('click', function (e) {
        map.setCenter(this.center);
        map.setZoom(18);
        if (infowindow) {
            infowindow.close();
        }
        var votes = "";
        for (var vote in this.votes) {
            votes = votes + "<div class='panel'><div class='panel-body'>" + this.votes[vote].voter.username + "</div></div>";
        }
        var contentString = '<div class="panel-heading">' + this.name + '</div><div class="info-content">' + votes + '</div>';
        
        infowindow = new google.maps.InfoWindow({
            content: contentString,
            position: this.center,
            map: map
        });
    });
    moodCircle.voteBalance = 0;
    if (moodCircle.votes) {
        for (var i in moodCircle.votes) {
            if (moodCircle.votes[i].mood == "happy")
                moodCircle.voteBalance++;
            if (moodCircle.votes[i].mood == "unhappy")
                moodCircle.voteBalance--;
        }
    }
    if (moodCircle.voteBalance > 0) {
        moodCircle.setOptions({
            fillColor: '#fff200',
        });
    }
    
    if (moodCircle.voteBalance < 0) {
        moodCircle.setOptions({
            fillColor: '#2cabff',
        });
    }
    if (moodCircle.voteBalance == 0) {
        if (moodCircle.votes[moodCircle.votes.length - 1].mood == "happy") {
            moodCircle.setOptions({
                fillColor: '#fff200'
            });
        } else {
            moodCircle.setOptions({
                fillColor: '#2cabff'
            });
        }
    }
    
    var multiplier = moodCircle.voteBalance;
    if (moodCircle.voteBalance < 0)
        multiplier = multiplier * (-1);
    if (multiplier != 0)
        moodCircle.setRadius(30 + (20 * multiplier) - 20)
    if (multiplier == 0)
        moodCircle.setRadius(30 + (20 * multiplier))
    
    if (moodCircle.votes)
        for (var item in moodCircle.votes) {
            moodCircle.votes[item].type = "moodCircle";
            moodCircle.votes[item].name = moodCircle.name;
            moodCircle.votes[item].id = moodCircle.id;
            moodCircle.votes[item].city = moodCircle.city;
            votes.push(moodCircle.votes[item]);
        }
    moodCircle.addListener("rightclick", function (event) {
        var thiss = this;
        bootbox.confirm("Do you want to delete the following moodCircle: " +thiss.name+", "+thiss.city, function (ev) {
            if (ev) {
                var id = thiss.id
                var params = "id=" + id;
                console.log(id);
                XHRPost("/api/event/deleteMoodCirle", params, function () {
                    if (this.status == 200) {
                        thiss.setMap(null);   
                    }
                });
            }
        });
    });
    
    circles.push(moodCircle);

}
    
function initMap() {
    

    console.log("initializing map");
    
    // Create a map object 
    map = new google.maps.Map(document.getElementById('googlemap'), {
        center: { lat: 50.6161386, lng: 5.3292117 },
        animatedZoom: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        zoom: 8
    });
    
    map.addListener("idle", function (e){
        votes = [];
        //Following function is located in IndexSockets.js
        updateLocation(user._id, map.getCenter());

        var modifier = 0;
        if (map.getZoom() > 11.5) {
            if (map.getZoom() >= 13)
                modifier = 0.05;
            if (map.getZoom() >= 14)
                modifier = 0.05;
            if (map.getZoom() > 14.5)
                modifier = 0.075;
            var params = "latMin=" + (this.getBounds().getSouthWest().lat() - modifier) + "&latMax=" + (this.getBounds().getNorthEast().lat() + modifier) + "&lngMin=" + (this.getBounds().getSouthWest().lng() - modifier) + "&lngMax=" + (this.getBounds().getNorthEast().lng() + modifier);
            
            XHRPost("/api/event/getEventsInScope", params, function () {
                if (this.status == 200) {
                    
                    while (events[0]) {
                        events.pop().setMap(null);
                    }
                    
                    $('#AdminEventsBody .panel-success').each(function () {
                        this.remove();
                    })
                    $('#collapseThree > .panel-body > .panel').each(function () {
                        this.remove();
                    })
                    
                    var res = JSON.parse(this.responseText);
                    for (var ii in res) {
                        addEvent(res[ii]);
                    }
                } else if (this.status == 204) {
                    while (events[0]) {
                        events.pop().setMap(null);
                    }
                    $('#collapseThree > .panel-body > .panel').each(function () {
                        this.remove();
                    })
                    $('#AdminEventsBody .panel-success').each(function () {
                        this.remove();
                    });
                } else {

                }
                XHRPost("/api/event/getMoodCirclesInScope", params, function () {
                    
                    if (this.status == 200) {
                        
                        while (circles[0]) {
                            circles.pop().setMap(null);
                        }
                        
                        var res = JSON.parse(this.responseText);
                        for (var ii in res) {
                            addMoodCircle(res[ii])
                        }
                    

                    } else if (this.status == 204) {
                        while (circles[0]) {
                            circles.pop().setMap(null);
                        }
                    } else {

                    }
                    
                    votes.sort(function (a, b) {
                        return (Date.parse(b.Date) - Date.parse(a.Date));
                    });
                    votes.splice(10, votes.length - 10)
                    $('#collapseTwo > .panel-body >.panel').each(function () {
                        $(this).remove();
                    })
                    for (var ii in votes) {

                        var loc = "";
                        var src = "";
                        var placeLoc = "";
                        if (votes[ii].voter.image)
                            src = "style = 'background-image: url(/userimages/" + votes[ii].voter.image + ")'";
                        if (votes[ii].voter.location)
                            loc = votes[ii].voter.location;
                        var img = "<div class='img-circle profile-item-image' " + src + " ' ></div>";
                        var content = "<div class='col-xs-6'>" + img + "</div><div class='col-xs-6'>" + votes[ii].voter.name + "<br>" + loc + "</div>"
                        if (votes[ii].type == "moodCircle")
                            placeLoc = 'around <a class="location-link" data-type="' + votes[ii].type + '" data-locId="' + votes[ii].id + '" href="#">' + votes[ii].name + '</a>';
                        if (votes[ii].type == "event")
                            placeLoc = 'at the <a class="location-link" data-type="' + votes[ii].type + '" data-locId="' + votes[ii].id + '" href="#">' + votes[ii].name + '</a> event in ' + votes[ii].city;
                        var obj = $('<div class="panel"><div class="panel-body activity-item"><a class="hoverUser" href="/profile/' + votes[ii].voter.username + '"  data-html="true" data-content="' + content + '"  rel="popover" data-original-title="' + votes[ii].voter.username + '" data-trigger="hover" data-userId="' + votes[ii].voter._id + '"> ' + votes[ii].voter.username + '</a> was <span class="' + votes[ii].mood + '">' + votes[ii].mood + '</span> ' + placeLoc + '.<br><strong>' + FriendlyDate(votes[ii].Date) + ' ago</strong></div></div>');
                        $("#collapseTwo > .panel-body > .empty").remove();
                        $("#collapseTwo > .panel-body").append(obj);
                        obj.children(".panel-body").children(".hoverUser").popover({ trigger: "hover" });
                        obj.children(".panel-body").children(".location-link").click(function (e) {
                            e.preventDefault();
                            if ($(this).attr("data-type") == "event") {
                                for (var ev in events) {
                                    if (events[ev].id == $(this).attr("data-locid")) {
                                        map.setCenter(events[ev].center);
                                        map.setZoom(17);
                                    }
                                }
                            }
                            if ($(this).attr("data-type") == "moodCircle") {
                                for (var ci in circles) {
                                    if (circles[ci].id == $(this).attr("data-locid")) {
                                        map.setCenter(circles [ci].center);
                                        map.setZoom(17);
                                    }
                                }
                            }
                        });
                    }
                });
            });
        } else {
            while (events[0]) {
                events.pop().setMap(null);
            }
            $('#AdminEventsBody .panel-success').each(function () {
                this.remove();
            })
            $('#collapseTwo > .panel-body > .panel').each(function () {
                this.remove();
            })
            $('#collapseThree > .panel-body > .panel').each(function () {
                this.remove();
            })
            while (circles[0]) {
                circles.pop().setMap(null);
            }
        }
    })
    
    if (!google.maps.Polygon.prototype.getBounds) {
        
        google.maps.Polygon.prototype.getBounds = function () {
            var bounds = new google.maps.LatLngBounds()
            this.getPath().forEach(function (element, index) { bounds.extend(element) })
            return bounds
        }
 
    }

    overlay = new google.maps.OverlayView();
    overlay.draw = function () { };
    overlay.setMap(map);
    initMapDependencies();
    
    //Link search box in sidebar
    var autocomplete = new google.maps.places.Autocomplete($('#searchInput')[0]);
    autocomplete.bindTo('bounds', map);
    
    //Get current position and Pan map to position.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            map.setCenter(pos);
            map.setZoom(15);
        }, function () {
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}


function initMapDependencies() {
    //source: http://stackoverflow.com/questions/17191664/why-getprojection-is-not-working-in-v3

    $("#StatusOverlay img").draggable({
        containment : [0, 80, $(map.getDiv()).width()-50, $(map.getDiv()).height()+25],
        helper: 'clone',
          
        
        start: function (e, ui){
            $(".ui-draggable-dragging").attr("src", $(".ui-draggable-dragging").attr("src").replace("Pin","PinDragging")).css("height","78px");
        },
        stop: function (e, ui) {
            var mood;
            if (e.target.src.indexOf("Happy") >= 0) mood = "happy";
            else if (e.target.src.indexOf("Unhappy") >= 0) mood = "unhappy";
            else return;
            
            //calculations
            var mOffset = $(map.getDiv()).offset();
            var point = new google.maps.Point(
                ui.offset.left - mOffset.left + (ui.helper.width() / 2),
                ui.offset.top - mOffset.top + (ui.helper.height()) -12
            );
            var ll = overlay.getProjection().fromContainerPixelToLatLng(point);
            //end calculations
            

            //CHECK IF DROPPED PIN IS WITHIN AN EVENT
            var isWithinEvent = false;
            for (var val in events) {
                
                if (google.maps.geometry.poly.containsLocation(ll, events[val])) {
                    var event = events[val];
               

                    isWithinEvent = true;
                    params = "id=" + events[val].id + "&vote=" + mood;
                    XHRPost("/api/event/addVoteEvent", params, function () {
                        if (this.status == 200) {
                            if (event.votes.length)
                                event.votes = [];
                            event.votes.push({ voter: user, vote: mood });
                            if (mood == "happy")
                                event.voteBalance++;
                            if (mood == "unhappy")
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
                        } else {
                            console.error("error");
                        }
                    });
                    
                }
            }
            
            var exists = false;
            //CHECK IF DROPPED PIN IS WITHIN EXISTING MOODCIRCLE
            if (!isWithinEvent) {
                for (var val in circles) {
                    if (google.maps.geometry.spherical.computeDistanceBetween(circles[val].getCenter(), ll) <= circles[val].getRadius()) {
                        exists = true;
                        var currCircle = circles[val];
                        params = "id=" + circles[val].id + "&vote=" + mood;
                        XHRPost("/api/event/addVoteMoodCircle", params, function () {
                            if (this.status == 200) {
                                if (!currCircle.votes)
                                    currCircle.votes = [];
                                currCircle.votes.push({ voter: user, mood: mood });
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
                                    if (mood == "happy") {
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


                            } else {
                                console.log("failed to update MoodCircle");
                            }
                        });
                    }
                }
            }
            
            //IF DROPPED PIN IS NOT IN AN EVENT OR AN EXISTING MOODCIRCLE
            if (!exists && !isWithinEvent) {
                 service = (service === undefined)? new google.maps.places.PlacesService(map) : service;
                var color = "#2cabff";
                if (mood == "happy") color = "#fff200";
                var moodCircle = new google.maps.Circle({
                    strokeWeight: 0,
                    fillColor: color,
                    fillOpacity: 0.65,
                    map: map,
                    center: ll,
                    radius: 30
                });

                service = (service === undefined)? new google.maps.places.PlacesService(map) : service;
                service.nearbySearch({ 'location': ll, "radius": 30 }, function (results, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        if (results[1]) {
                            if (results.length > 2) {
                                moodCircle.name = results[1].name;
                                console.log(results)
                                moodCircle.city = results[results.length - 1].name;
                                sendData();
                            } else {
                                moodCircle.name = results[0].name;
                                console.log(results)
                                moodCircle.city = results[1].name;
                                sendData();
                            }
                            
                        } else {
                            service.nearbySearch({ 'location': ll, "radius": 100 }, function (results, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    if (results[1]) {
                                        moodCircle.name = results[1].name;
                                        moodCircle.city = results[0].name;
                                        sendData();
                                    } else {
                                        moodCircle.name = "Unknown location";
                                        moodCircle.city = results[0].name;
                                        sendData();
                                    }
                                }
                            });
                        }
                    } else {
                        console.log(status);
                    }
                });
                moodCircle.addListener('click', function (e) {
                    map.setCenter(moodCircle.center);
                    map.setZoom(18);
                    console.log(moodCircle);
                });
                function sendData() {
                    var params = "name=" + moodCircle.name + "&city=" + moodCircle.city + "&center=" + ll + "&radius=" + 30;
                    XHRPost("/api/event/addMoodCircle", params, function () {
                        if (this.status == 200) {
                            var res = JSON.parse(this.responseText);
                            console.log(res);
                            var params = "id=" + res._id + "&vote=" + mood;
                            XHRPost("/api/event/addVoteMoodCircle", params, function () {
                                if (this.status == 200) {
                                    moodCircle.votes = [];
                                    moodCircle.votes.push({ voter: user, mood: mood });
                                    moodCircle.id = res._id;
                                    circles.push(moodCircle);

                                } else {
                                    console.log("failed to update MoodCircle");
                                }
                            });
                                
                        }
                        else {
                            console.log("failed to add MoodCircle");
                        }
                    });
                }
            }
        }
    });
}

function startChat(userId, username){
    
    if ($("ul.pagination.pagination-sm > li[data-userid='" + userId + "']").length < 1) {
        $("ul.pagination.pagination-sm > li").removeClass("active");
        $('<li class="active" data-userId="' + userId + '"><a href="#">anonlike</a></li>').insertBefore($("ul.pagination.pagination-sm > li.right-arrow"))
        var params = "userid="+userId
        XHRPost("/api/chat/addChatWindow", params, function () {
            if (this.status == 200) {
                var res = JSON.parse(this.responseText);
                console.log( res);
                $("ul.pagination.pagination-sm > li[data-userid='" + userId + "']").attr("data-chatid", res._id);

                $('div.msg_container_base').hide();
                
                var chatwindow = $('<div class="panel-body msg_container_base" data-chatid="' + res._id + '"><div class="row msg_container base_sent" ><div class="col-md-10 col-xs-10"><div class="messages msg_sent"><p>that mongodb thing looks good, huh?</p><time datetime="2009-11-13T20:00">Timothy • 51 min</time></div></div><div class="col-md-2 col-xs-2 avatar"><img src="" class="img-responsive"></div></div></div>');
                $(".chat_window.chat-window>.panel").prepend(chatwindow);

            }
        });
        
    } else {
        $("ul.pagination.pagination-sm > li").removeClass("active");
        $("ul.pagination.pagination-sm > li[data-userid='" + userId + "']").addClass("active");
        $('div.msg_container_base').hide();
        console.log($("ul.pagination.pagination-sm > li[data-userid='" + userId + "']").attr("data-chatid"))
        $('div[data-chatid='+ $("ul.pagination.pagination-sm > li[data-userid='" + userId + "']").attr("data-chatid")+"]").show();
    }

}



function setZoomAnimation(mappy, zoomlevel){
    var currZoom = mappy.getZoom();
    if (currZoom > zoomlevel) {
        f();
        function f() {
            currZoom--;
            mappy.setZoom(currZoom)
            if (currZoom > zoomlevel) {
                setTimeout(f, 80);
            }
        }
    } else if (currZoom < zoomlevel) {
        f();
        function f() {
            currZoom++;
            mappy.setZoom(currZoom)
            if (currZoom < zoomlevel) {
                setTimeout(f, 80);
            }
        }
    } else
        return;
}

$(function () {
    
    $("#sendChat").submit(function (e) {
        e.preventDefault();
        var msg = $(this).children(".input-group").children("input").val();
        var chatid = $(".pagination.pagination-sm > .active").attr("data-chatid");
        //Following function is located in javascripts/IndexSockets.js
        sendMessage(chatid, user._id, msg);

    }); 
    

    XHRPost("/api/event/getFriendUpdates", "", function () {

        if (this.status == 200) {
            var res = JSON.parse(this.responseText);
            
            for (var i in res) {
                if (res[i].type == "event") { 
                    for (var ev in events) {
                        if (events[ev].id == res[i].id) {
                            isFound = true;
                        }
                    }
                    if (!isFound)
                        OutOfMapLocations.push({id: res[i].id ,center: { lng: res[i].center.Lng, lat: res[i].center.Lat } })
                }
                if (res[i].type == "moodCircle") {

                    var isFound = false;
                    for (var ci in circles) {
                        if (circles[ci].id == res[i].id) {
                            isFound = true;
                        }
                    }
                    if (!isFound)
                        OutOfMapLocations.push({ id: res[i].id , center: { lng: res[i].center.Lng, lat: res[i].center.Lat } })
                }

                var loc = "";
                var src = "";
                var placeLoc = "";
                if (res[i].voter.image)
                    src = "style = 'background-image: url(/userimages/" + res[i].voter.image + ")'";
                if (res[i].voter.location)
                    loc = res[i].voter.location;
                var img = "<div class='img-circle profile-item-image' " + src + " ' ></div>";
                var content = "<div class='col-xs-6'>" + img + "</div><div class='col-xs-6'>" + res[i].voter.name + "<br>" + loc + "</div>"
                if (res[i].type == "moodCircle")
                    placeLoc = 'around <a class="location-link" data-type="' + res[i].type + '" data-locId="' + res[i].id + '" href="#">' + res[i].name + ', '+ res[i].location+'</a>';
                if (res[i].type == "event")
                    placeLoc = 'at the <a class="location-link" data-type="' + res[i].type + '" data-locId="' + res[i].id + '" href="#">' + res[i].name + '</a> event in ' + res[i].location;
                var obj = $('<div class="panel"><div class="panel-body activity-item"><a class="hoverUser" href="/profile/' + res[i].voter.username + '"  data-html="true" data-content="' + content + '"  rel="popover" data-original-title="' + res[i].voter.username + '" data-trigger="hover" data-userId="' + res[i].voter._id + '"> ' + res[i].voter.username + '</a> was <span class="' + res[i].mood + '">' + res[i].mood + '</span> ' + placeLoc + '.<br><strong>' + FriendlyDate(res[i].Date) + ' ago</strong></div></div>');
                $("#collapseOne > .panel-body > .empty").remove();
                $("#collapseOne > .panel-body").append(obj);
                obj.children(".panel-body").children(".hoverUser").popover({ trigger: "hover" });
                obj.children(".panel-body").children(".hoverUser").click(function(e){
                    e.preventDefault();
                    $('#collapseFive').collapse('show');
                    $($(this).parent().parent().parent().parent()).collapse('hide');
                    startChat($(this).attr('data-userid'), $(this).attr('data-original-title'));
                });
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
                            console.log(OutOfMapLocations);
                            for (var o in OutOfMapLocations) {
                                if (OutOfMapLocations[o].id == $(this).attr("data-locid")) {
                                    map.setCenter(OutOfMapLocations[o].center);
                                    map.setZoom(17);
                                }
                            }
                        }
                    }
                });
            }

        }
    });
    
    XHRGet("/api/chat/getActiveChatWindows", function () {
        
        if (this.status == 200) {
            var res = JSON.parse(this.responseText);
            
            for (var i in res) {
                if (res[i].user1._id == user._id)
                    startChat(res[i].user2._id, res[i].user2.username);
                else
                    startChat(res[i].user1._id, res[i].user1.username);
            }
        }
    });

    $(".dropdown-toggle").dropdown();

    $("#menu-toggle").click(function (e) {
        $('#wrapper').toggleClass("activebar");
    });

    $("#search").submit(function (e) {
        e.preventDefault();
        service = (service === undefined)? new google.maps.places.PlacesService(map) : service;
        var mapcenter = map.getCenter();
        service.textSearch({ 'query': $(e.target[0]).val(), 'location': new google.maps.LatLng(mapcenter.lat(), mapcenter.lng()),"radius":40000 }, function (results, artatus) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(results[0]);
                map.setCenter(results[0].geometry.location);
                console.log(circles);
                //console.log(circles[0].setMap(null));
                if ($.inArray("locality", results[0].types) > -1) {
                    map.setZoom(15);
                }
                else
                    map.setZoom(16);
            }
        });
    });

    $("#addEvent").click(function (e) {
        var loc = map.getCenter();
        //http://bootsnipp.com/snippets/featured/close-panel-effects
        if ($("#newEvent").length == 0) {
            $("#addEvent").prop('disabled', true);
           
            var cords = [
                { lng: loc.lng() + 0.002, lat: (loc.lat() + 0.001) },
                { lng: loc.lng() + 0.002, lat: loc.lat() - 0.001 },
                { lng: loc.lng() - 0.002, lat: loc.lat() - 0.001 },
                { lng: loc.lng() - 0.002, lat: loc.lat() + 0.001 }
            ];
            var rectangle = new google.maps.Polygon({
                paths: cords,
                editable: true,
                strokeWeight: 0,
                fillColor: '#999',
                draggable: true,
                map: map
            });
            rectangle.setMap(map);
            rectangle.addListener("dragend", function (e) {
                console.log(e);
            })
            $('<div id="newEvent" class="panel panel-info"><div class="panel-heading"><h3 class="panel-title">New Event</h3><span class="pull-right clickable" data-effect="slideUp"><i class="fa fa-times"></i></span></div><div class="panel-body"><form><div class="input-group"><label for="eventName" class="col-md-5">Name:</label><input type="text" id="eventName" name="eventName" class="col-md-7"/><label for="eventLocation" class="col-md-5">Location:</label><input type="text" id="eventLocation" name="eventLocation" class="col-md-7"/></div></form></div><div class="panel-footer"><button id="newEventButton" class="btn btn-primary ">Save Changes</button></div></div>').insertAfter($("#addEvent"));
            $('#newEventButton').on('click', function () {
                var params = new FormData();
                params = "name=" + $("#eventName").val() + "&location=" + $("#eventLocation").val() + "&center=" + rectangle.getBounds().getCenter() ;
                points = rectangle.getPath().j;
                for (var val in points) {
                    params = params + "&points[]=" + points[val];
                }
                var obj = this.target;
                XHRPost("/api/event/addEvent", params, function() {
                    if (this.status == 200) {
                        var res = JSON.parse(this.responseText);
                        rectangle.setMap(null);
                        addEvent(res);
                        $("#newEvent").remove();
                        $("#addEvent").prop('disabled', false);
                        
                    }
                    else {
                        
                    }
                });


                //console.log(rectangle.getPath());
            });
            $('.clickable').on('click', function () {
                var thiss = $(this);
                bootbox.confirm("Are you sure you want to close this? Unsaved changes will be lost.", function (ev) {
                    if (ev) {
                        var effect = thiss.data('effect');
                        thiss.closest('.panel')[effect]();
                        $("#addEvent").prop('disabled', false);
                        $("#newEvent").remove();
                        rectangle.setMap(null);
                    }
                })
            })
        }
    });
});

function FriendlyDate(date1) {
    var seconds = Math.round((Date.now() - Date.parse(date1))/1000);
    var minutes = Math.round(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    if (days == 1) return "A day";
    else if (days > 1) return days + " days";
    else if (hours == 1) return "An hour";
    else if (hours >= 1) return hours + " hours";
    else if (minutes == 1) return "A minute";
    else if (minutes >= 1) return minutes + " minutes";
    else return seconds + " seconds";

}