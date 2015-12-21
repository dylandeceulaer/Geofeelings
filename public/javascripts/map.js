
    
function initMap() {
    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById('googlemap'), {
        center: { lat: 50.6161386, lng: 5.3292117 },
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        zoom: 8
    });
    
    //var infoWindow = new google.maps.InfoWindow({ map: map });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            map.setCenter(pos);
            map.setZoom(15);
            map.setPosition(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
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

