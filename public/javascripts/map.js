var map;
var service;
var circles = [];
var overlay;


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
console.log(happy);
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
        var cityCircle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#fff200',
            fillOpacity: 0.65,
            map: map,
            center: happy[city].center,
            radius: Math.sqrt(happy[city].population)
        });
        cityCircle.name = city;
        cityCircle.addListener('click', showArrays);
        circles.push(cityCircle);
    }
    for (var city in sad) {
        // Add the circle for this city to the map.
        var cityCircle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#2cabff',
            fillOpacity: 0.65,
            map: map,
            center: sad[city].center,
            radius: Math.sqrt(sad[city].population)
        });
        cityCircle.name = city;
        cityCircle.addListener('click', showArrays);
        circles.push(cityCircle);
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
    console.log(this.name);
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
        stop: function (e, ui) {
            var mood;
            if (e.target.src.indexOf("Happy") >= 0) mood = "happy";
            else if (e.target.src.indexOf("Unhappy") >= 0) mood = "Unhappy";
            else return;
            
            //calculations
            var mOffset = $(map.getDiv()).offset();
            var point = new google.maps.Point(
                ui.offset.left - mOffset.left + (ui.helper.width() / 2),
            ui.offset.top - mOffset.top + (ui.helper.height())
            );
            var ll = overlay.getProjection().fromContainerPixelToLatLng(point);
            //end calculations
            
            var color = "#2cabff";
            if (mood == "happy") color = "#fff200";
            var cityCircle = new google.maps.Circle({
                strokeWeight: 0,
                fillColor: color,
                fillOpacity: 0.65,
                map: map,
                center: ll,
                radius: 50
            });
            cityCircle.mood = mood;
            circles.push(cityCircle);
            cityCircle.addListener('click', function (e) {
                console.log(this.mood);
            });

        }
    });
}


$(function () {  
    $("#menu-toggle").click(function (e) {
        $('#wrapper').toggleClass("activebar");
    });

    $("#search").submit(function (e) {
        e.preventDefault();
        service = (service === undefined)? new google.maps.places.PlacesService(map) : service;
        var mapcenter = map.getCenter();
        service.textSearch({ 'query': $(e.target[0]).val(), 'location': new google.maps.LatLng(mapcenter.lat(), mapcenter.lng()),"radius":50000 }, function (results, status) {
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