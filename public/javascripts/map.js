var map;
var service;
var circles = [];
var overlay;
var geocoder;


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
    
    overlay = new google.maps.OverlayView();
    overlay.draw = function () { };
    overlay.setMap(map);
    initMapDependencies();

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
                service.nearbySearch({ 'location': ll, "radius": 100 }, function (results, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        if(results[1]){
                            moodCircle.name = results[1].name;
                            
                        } else {
                            console.log(results)
                        }
                    }
                });

                moodCircle.mood = mood;
                circles.push(moodCircle);
                moodCircle.addListener('click', function (e) {
                    map.setCenter(moodCircle.center);
                    map.setZoom(18);
                    console.log(moodCircle.name);
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
});