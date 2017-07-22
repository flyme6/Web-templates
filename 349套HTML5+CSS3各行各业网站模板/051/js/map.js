
        var map;
        

        function initialize() {
  var tirana     = new google.maps.LatLng(41.318587, 19.789112);
  var marker1Pos = new google.maps.LatLng(41.327470, 19.807898);
  var marker2Pos = new google.maps.LatLng(41.329709, 19.830086);
  var marker3Pos = new google.maps.LatLng(41.326358, 19.831373);
  var marker4Pos = new google.maps.LatLng(41.324714, 19.834485);
  var marker5Pos = new google.maps.LatLng(41.333995, 19.833691);

            var roadAtlasStyles = [
  {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        { "saturation": -100 },
        { "lightness": -8 },
        { "gamma": 1.18 }
      ]
  }, {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        { "saturation": -100 },
        { "gamma": 1 },
        { "lightness": -24 }
      ]
  }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
      "featureType": "administrative",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
      "featureType": "transit",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
      "featureType": "road",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
      "featureType": "administrative",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
      "featureType": "landscape",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
      "featureType": "poi",
      "stylers": [
        { "saturation": -100 }
      ]
  }, {
  }
            ]

            var mapOptions = {
                zoom: 14,
                center: tirana,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'usroadatlas']
                }
            };

            map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);

            var styledMapOptions = {
                
            };

            var usRoadMapType = new google.maps.StyledMapType(
                roadAtlasStyles, styledMapOptions);

            map.mapTypes.set('usroadatlas', usRoadMapType);
            map.setMapTypeId('usroadatlas');
        
    var MarkerAbissnet = 'img/abissnet-marker.png';

    var marker = new google.maps.Marker({
      position: marker1Pos,
      map: map,
      icon: MarkerAbissnet,
      title: 'Uluru (Ayers Rock)'
  });
  
   var marker2 = new google.maps.Marker({
      position: marker2Pos,
      map: map,
      icon: MarkerAbissnet,
      title: 'Uluru (Ayers Rock)'
  });
  
   var marker3 = new google.maps.Marker({
      position: marker3Pos,
      map: map,
      icon: MarkerAbissnet,
      title: 'Uluru (Ayers Rock)'
  });
  
   var marker4 = new google.maps.Marker({
      position: marker4Pos,
      map: map,
      icon: MarkerAbissnet,
      title: 'Uluru (Ayers Rock)'
  });
  
   var marker5 = new google.maps.Marker({
      position: marker5Pos,
      map: map,
      icon: MarkerAbissnet,
      title: 'Uluru (Ayers Rock)'
  });



 
 
  
        }

        google.maps.event.addDomListener(window, 'load', initialize);