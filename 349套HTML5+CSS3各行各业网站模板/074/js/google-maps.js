// Google Maps V.3
google.maps.visualRefresh = true; // Enable the visual refresh
function initialize() {
    // Set up your geolocation latitude and longtitude
    var latlang = new google.maps.LatLng(31.66744, 77.05903);
    var mapOptions = {
        // This will always position your location in the middle of the displayed map, using your "latlang" settings
        center: latlang,
        // Initial display resolution, zoom 0 corresponds to a map of the Earth fully zoomed out, and higher zoom levels zoom in at a higher resolution.
        zoom: 10,
        // true or false => enables or disables the Zoom control. By default, this control is visible and appears in the top left corner of the map
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        // true or false => enables or disables the Scale control that provides a simple map scale
        scaleControl: true,
        // true or false => enables or disables the Pan control. By default, this control is visible and appears in the top left corner of the map
        panControl: true,
        // true or false => If false, prevents the map from being dragged. Dragging is enabled by default
        draggable: true,
        // true or false => If false, scrollwheel zooming is disabled on the map. The scrollwheel is enabled by default.
        scrollwheel: false,
        // Set the basic map type here, choice of: ROADMAP, SATELLITE, HYBRID or TERRAIN
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
    var marker = new google.maps.Marker({
        position: latlang,
        map: map,
        // This is the title text that is shown when you hover over the marker on the map - change it to your text
        title: 'We Are Here'
    });
    var infowindow = new google.maps.InfoWindow();
    // Write the content that you wish to be displayed here e.g. Your Companies Address
    infowindow.setContent('3Star');
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });
}
google.maps.event.addDomListener(window, 'load', initialize);