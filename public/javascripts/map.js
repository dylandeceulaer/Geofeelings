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
    



var happy = {
    Budascoop: {
        center: { lat: 50.830561, lng: 3.264950 },
        population: 3000
    },
    "K in Kortrijk": {
        center: { lat: 50.8265678, lng: 3.270331 },
        population: 5000
    }
};
var sad = {
    Howest: {
        center: { lat: 50.824939, lng: 3.249959 },
        population: 4000
    },
    "Kortrijk Station": {
        center: { lat: 50.8245524, lng: 3.2643719 },
        population: 3000
    }
};


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
    
    placeEvents();

    //2cabff
    //fff200
    for (var city in happy) {

        // Add the circle for this city to the map.
        var moodCircle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#fff200',
            fillOpacity: 0.65,
            map: map,
            center: happy[city].center,
            radius: Math.sqrt(happy[city].population)
        });
        moodCircle.name = city;
        moodCircle.mood = "happy";
        moodCircle.addListener('click', showArrays);
        circles.push(moodCircle);
    }
    for (var city in sad) {
        // Add the circle for this city to the map.
        var moodCircle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#2cabff',
            fillOpacity: 0.65,
            map: map,
            center: sad[city].center,
            radius: Math.sqrt(sad[city].population)
        });
        moodCircle.name = city;
        moodCircle.mood = "unhappy";
        moodCircle.addListener('click', showArrays);
        circles.push(moodCircle);
    } 

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
            
            var exists = false;
            //Check if within existing circle
            for (var val in circles) {
                if (google.maps.geometry.spherical.computeDistanceBetween(circles[val].getCenter(), ll) <= circles[val].getRadius()) {
                    console.log(mood);

                    if (mood == "happy" && circles[val].mood == "happy") {
                        circles[val].setRadius(circles[val].getRadius() + 20);
                    } else if (mood == "happy" && circles[val].mood == "unhappy") {
                        circles[val].setRadius(circles[val].getRadius() - 20);
                        if (circles[val].getRadius() < 30) {
                            circles[val].mood = "happy";
                            circles[val].setOptions({
                                fillColor: '#fff200'
                                });
                            circles[val].setRadius(circles[val].getRadius() + 20);

                        }
                    } else if (mood == "unhappy" && circles[val].mood == "happy") {
                        circles[val].setRadius(circles[val].getRadius() - 20);
                        if (circles[val].getRadius() < 30) {
                            circles[val].mood = "unhappy";
                            circles[val].setOptions({
                                    fillColor: '#2cabff'
                                });
                            circles[val].setRadius(circles[val].getRadius() + 20);
                        }
                    } else {
                        circles[val].setRadius(circles[val].getRadius() + 20);
                    }
                    exists = true;
                    console.log(circles[val].getRadius());

                }
            }
            
            if (!exists) {
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
                            } else {
                                moodCircle.name = results[0].name;
                                console.log(results)
                                moodCircle.city = results[1].name;
                            }
                            
                        } else {
                            service.nearbySearch({ 'location': ll, "radius": 100 }, function (results, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    if (results[1]) {
                                        moodCircle.name = results[1].name;
                                        moodCircle.city = results[0].name;
                                    } else
                                        moodCircle.name = "Unknown location, " + results[0].name;
                                }
                            });
                        }
                    }
                });

                moodCircle.mood = mood;
                circles.push(moodCircle);
                moodCircle.addListener('click', function (e) {
                    map.setCenter(moodCircle.center);
                    map.setZoom(18);
                    console.log(moodCircle.name);
                    console.log(moodCircle.city);
                });

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
                XHRPost("/api/event/addEvent", params, function() {
                    if (this.status == 200) {
                        rectangle.setOptions({
                            strokeWeight: 1,
                            strokeColor: '#F00',
                            fillColor: '#F00',
                            editable: false,
                            draggable: false
                        });

                    }
                    else {
                        
                    }
                });


                //console.log(rectangle.getPath());
            });
            $('.clickable').on('click', function () {
                var thiss = $(this);
                bootbox.confirm("Are you sure you want to close this? Unsaved changes will be lost.", function (ev) {
                    console.log($(this));
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