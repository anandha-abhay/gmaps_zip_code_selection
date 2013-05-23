function initialize() {
  var radiusStart, radiusEnd;
  var markers = [];
  var zipcodes = [
    {
      zip:'60606',
      count: 10
    },
    {
      zip:'60642',
      count: 22
    },
    {
      zip:'60172',
      count: 13
    },
    {
      zip:'60633',
      count: 2
    },
    {
      zip:'60622',
      count: 200
    }
  ];

  var geocoder = new google.maps.Geocoder();

  var mapOptions = {
    center: new google.maps.LatLng(41.8817767, -87.6371461),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggable: false
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"),
                                mapOptions);

  var selectionIndicator = new google.maps.Circle({
    strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: map
  });

  _.map(zipcodes, function(obj) {
    geocoder.geocode( { 'address': obj.zip}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        obj.latLng = results[0].geometry.location;
        obj.marker = new google.maps.Marker({
          position: obj.latLng,
          draggable: false,
          map: map,
          title: obj.zip + ":" + obj.count
        });
        var checkBox = $("#"+obj.zip);
        var $obj = $(obj);
        $obj.bind("selected", checkBox, function(e){
          checkBox.prop('checked', true);
          checkBox.trigger('change');
        });
        $obj.bind("deselected", checkBox, function(e){
          checkBox.prop('checked', false);
          checkBox.trigger('change');
        });
        checkBox.change(obj, function(e) {
          if($(this).prop("checked")) {
            obj.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
          } else {
            obj.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
          }
        });
      }
    });
  });

  var delta = function() {
    var distance = google.maps.geometry.spherical.computeDistanceBetween (radiusStart, radiusEnd);
    return distance;
  };

  var drawCircle = function() {
    selectionIndicator.setMap(map);
    selectionIndicator.setCenter(radiusStart);
    selectionIndicator.setRadius(delta());
    markInBoundMarkers();
  };

  var resetCircle = function() {
    selectionIndicator.setMap(null);
  };

  var markInBoundMarkers = function() {
    var bounds = selectionIndicator.getBounds();
    var inBoundZipcodes = _.each(zipcodes, function(obj) {
      if(bounds.contains(obj.latLng)){
        var $obj = $(obj);
        $obj.trigger('selected');
        obj.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
      }
    });
  };

  var resetMarkers = function() {
    _.each(zipcodes, function(obj) {
      var $obj = $(obj);
      $obj.trigger('deselected');
      obj.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    });
  }

  google.maps.event.addListener(selectionIndicator, 'mousedown', function(e) {
    resetCircle();
    resetMarkers();
    radiusStart = e.latLng;
/*    google.maps.event.addListener('mousemove', function(e){
      radiusEnd = e.latLng;
      drawCircle();
    });*/
  });

  google.maps.event.addListener(map, 'mousedown', function(e) {
    resetCircle();
    resetMarkers();
    radiusStart = e.latLng;
/*    google.maps.event.addListener('mousemove', function(e){
      radiusEnd = e.latLng;
      drawCircle();
    });*/
  });

  google.maps.event.addListener(map, 'mouseup', function(e) {
    radiusEnd = e.latLng;
    drawCircle();
  });

  $("input").change(function() {
    var sum = _.inject($("input"), function(acc, el) {
      var $el = $(el);
      if($el.prop("checked")){
        return acc + parseInt(el.value);
      } else {
        return acc;
      }
    }, 0);
    $("#subscriber-total").html(sum);
  });
}
google.maps.event.addDomListener(window, 'load', initialize);
