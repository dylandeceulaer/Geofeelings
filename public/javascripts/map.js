var map;
var service;
var circles = [];
var overlay;
var geocoder;
var events = [];

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
    
    map.addListener("idle", function (){
        var modifier = 0;
        if (map.getZoom() > 11.5) {
            if (map.getZoom() >= 13)
                modifier = 0.025;
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
                    
                    var res = JSON.parse(this.responseText);
                    
                    for (var ii in res) {
                        var cords = [];
                        for (var i in res[ii].points) {
                                cords.push({ lng: res[ii].points[i].Lng, lat: res[ii].points[i].Lat })
                        }
                        var rectangle = new google.maps.Polygon({
                            paths: cords,
                            strokeWeight: 1,
                            strokeColor: '#F00',
                            fillColor: '#F00',
                            map: map
                        });
                        rectangle.setMap(map);
                        rectangle.name = res[ii].name;
                        rectangle.id = res[ii]._id;
                        rectangle.center = res[ii].center;
                        rectangle.location = res[ii].location;
                        rectangle.votes = res[ii].votes;
                        
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

                        rectangle.addListener('click', function () {
                            console.log(this.name);
                            console.log(this.location);
                            console.log(this.voteBalance);
                        });
                        events.push(rectangle);
                        var id = Math.round(Math.random() * 10000000000000000);
                        $('<div class="panel panel-success"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" href="#' + id + '">' + rectangle.name + ', ' + rectangle.location + '</a></h4></div><div id="' + id + '" class="panel-collapse collapse"><div class="panel-body" id="' + res[ii]._id + '"><input class="form-control input-name" placeholder="name" value="'+rectangle.name+'"/><input class="form-control input-location" placeholder="location" value="'+ rectangle.location+'"/><button class="event-button locate-event btn btn-default">Locate</button><button class="event-button delete-event btn btn-default">Delete</button></div></div></div>').insertAfter($("#AdminEventsBody").children().last())
                        
                        //.click(function () {
                        //    for (var value in events) {
                        //        if (events[value].id == $(this).attr("id"))
                        //            map.setCenter({ lng: events[value].center.Lng, lat: events[value].center.Lat });
                        //        map.setZoom(17);
                        //    }
                        //});
                    }
                    $(".input-location").change(function (e) {
                        var params = "id=" + $(this).parent().attr("id") + "&location=" + $(this).val();
                        var obj = this;
                        XHRPost("/api/event/updateEvent", params, function () {
                            if (this.status == 200) {
                                updateTitle(obj)
                            }
                        });
                    }); $(".delete-event").click(function (e) {
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
                    $(".input-name").change(function (e) {
                        var params = "id=" + $(this).parent().attr("id") + "&name=" + $(this).val();
                        var obj = this;
                        XHRPost("/api/event/updateEvent", params, function () {
                            if (this.status == 200) {
                                updateTitle(obj)
                            }
                        });
                        
                    });
                    function updateTitle(obj){
                        $(obj).parent().parent().parent().children(".panel-heading").children("h4").children("a").text($(obj).parent().children(".input-name").val()+", "+$(obj).parent().children(".input-location").val());
                    }
                } else if (this.status == 204) {
                    while (events[0]) {
                        events.pop().setMap(null);
                    }
                    $('#AdminEventsBody .panel-success').each(function () {
                        this.remove();
                    });
                } else {

                }
                
            });
            
            XHRPost("/api/event/getMoodCirclesInScope", params, function () {
                if (this.status == 200) {
                    
                    while (circles[0]) {
                        circles.pop().setMap(null);
                    }

                    var res = JSON.parse(this.responseText);
                    
                    for (var ii in res) {
                        var moodCircle = new google.maps.Circle( {
                            strokeWeight: 0,
                            fillOpacity: 0.65,
                            map: map,
                            center: {lat: res[ii].center.Lat, lng: res[ii].center.Lng}
                        });
                        moodCircle.id = res[ii]._id;
                        moodCircle.votes = res[ii].votes;
                        moodCircle.name = res[ii].name;
                        moodCircle.city = res[ii].city;
                        
                        moodCircle.addListener('click', function (e) {
                            map.setCenter(moodCircle.center);
                            map.setZoom(18);
                            console.log(moodCircle);
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
                            if (moodCircle.votes[moodCircle.votes.length-1].mood == "happy") {
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
                        if(multiplier != 0)
                            moodCircle.setRadius(30 + (20 * multiplier) - 20)
                        if (multiplier == 0)
                            moodCircle.setRadius(30 + (20 * multiplier))

                        
                        

                        circles.push(moodCircle);

                    }
                } else if (this.status == 204) {
                    while (events[0]) {
                        events.pop().setMap(null);
                    }
                    $('#AdminEventsBody .panel-success').each(function () {
                        this.remove();
                    });
                } else {

                }
            });

        } else {
            while (events[0]) {
                events.pop().setMap(null);
            }
            $('#AdminEventsBody .panel-success').each(function () {
                this.remove();
            })
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
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function showArrays(event){
    console.log(this.center.lat());
    console.log(this.center.lng());
    console.log(this.getRadius());
    
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
               
                    console.log(events[val].name)

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
                            console.log(mood);
                            console.log(event.voteBalance)
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
                                console.log(currCircle.voteBalance);  
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


    $("#menu-toggle").click(function (e) {
        $('#wrapper').toggleClass("activebar");
    });

    $("#search").submit(function (e) {
        e.preventDefault();
        service = (service === undefined)? new google.maps.places.PlacesService(map) : service;
        var mapcenter = map.getCenter();
        service.textSearch({ 'query': $(e.target[0]).val(), 'location': new google.maps.LatLng(mapcenter.lat(), mapcenter.lng()),"radius":40000 }, function (results, status) {
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
                        rectangle.setOptions({
                            strokeWeight: 1,
                            strokeColor: '#F00',
                            fillColor: '#F00',
                            editable: false,
                            draggable: false
                        });
                        //FOUT BIJ DE JSON HIER
                        var res = JSON.parse(this.responseText);
                        rectangle.id = res._id;
                        $("#newEvent").remove();
                        $("#addEvent").prop('disabled', false);
                        $('<div class="panel panel-success"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" href="#' + rectangle.id + '">' + $("#eventName").val() + ', ' + $("#eventLocation").val() + '</a></h4></div><div id="' + rectangle.id + '" class="panel-collapse collapse"><div class="panel-body" id="' + rectangle._id + '"><input class="form-control input-name" placeholder="name" value="' + $("#eventName").val() + '"/><input class="form-control input-location" placeholder="location" value="' + $("#eventLocation").val() + '"/><button class="event-button locate-event btn btn-default">Locate</button><button class="event-button delete-event btn btn-default">Delete</button></div></div></div>').insertAfter($("#AdminEventsBody").children().last())

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

function placeEvents(){
    XHRGet("/api/event/", function resLoginCheck() {
        if (this.status == 200) {
            var res = JSON.parse(this.responseText);

            
            for (var ii in res) {
                var cords = [];
                for (var i in res[ii].points) {
                    cords.push({ lng: res[ii].points[i].Lng, lat: res[ii].points[i].Lat })
                }
                console.log(res[ii]);
                var rectangle = new google.maps.Polygon({
                    paths: cords,
                    strokeWeight: 1,
                    strokeColor: '#F00',
                    fillColor: '#F00',
                    map: map
                });
                rectangle.name = res[ii].name;
                rectangle.id = res[ii]._id;
                rectangle.center = res[ii].center;
                rectangle.location = res[ii].location;
                rectangle.setMap(map);
                rectangle.addListener('click', function () {
                    console.log(this.name);
                    console.log(this.location);
                });
                events.push(rectangle);
                var id = Math.round(Math.random() * 10000000000000000);
                $('<div id="'+ res[ii]._id+'" class="panel panel-success"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" href="#' + id + '">' + rectangle.name + ', ' + rectangle.location + '</a></h4></div><div id="' + id + '" class="panel-collapse collapse"><div class="panel-body">Panel Body</div></div></div>').insertAfter($("#AdminEventsBody").children().last()).click(function () {
                    for (var value in events) {
                        if(events[value].id == $(this).attr("id"))
                            map.setCenter({ lng: events[value].center.Lng, lat: events[value].center.Lat});
                            map.setZoom(17);
                    }
                });

            }
            console.log(events);
        }
        if (this.status == 204) {
            console.log(err);
        }
    });

}