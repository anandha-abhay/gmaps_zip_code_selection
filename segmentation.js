function initialize() {
  var radiusStart, radiusEnd;
  var markers = [];
  var metroCodes = [
    {metro_code: "602", address: "Chicago, IL"},
    {metro_code: "610", address: "Rockford, IL"}
  ];
  var zipcodes = [
    {
      zip:'60606',
      metro_code: "602",
      count: 10
    },
    {
      zip:'60642',
      metro_code: "602",
      count: 22
    },
    {
      zip:'60172',
      metro_code: "602",
      count: 13
    },
    {
      zip:'60633',
      metro_code: "602",
      count: 2
    },
    {
      zip:'60622',
      metro_code: "602",
      count: 200
    },
    {
      zip:'61011',
      metro_code:"610",
      count: 900
    }
  ];

  var zipCountTotal = _.reduce(zipcodes, function(memo, obj) { return memo + obj.count;}, 0);
  var zipCountMax = _.max(zipcodes, function(obj) { return obj.count }).count;

  var geocoder = new google.maps.Geocoder();

  var mapOptions = {
    center: new google.maps.LatLng(41.98032, -87.902313),
    zoom: 9,
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

  _.each(metroCodes, function(obj) {
    geocoder.geocode( { 'address': obj.address}, function(results, status) {
      obj.icon = new google.maps.MarkerImage(
        'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        null, //size
        null, //origin
        null, //anchor
        null
      );
      obj.selectedIcon = new google.maps.MarkerImage(
        'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        null, //size
        null, //origin
        null, //anchor
        null
      );

      if (status == google.maps.GeocoderStatus.OK) {
        obj.latLng = results[0].geometry.location;
        obj.marker = new google.maps.Marker({
          position: obj.latLng,
          draggable: false,
          map: map,
          title: obj.metro_code
        });

        var checkBoxes = _.collect(zipcodes, function(zipObj) {
          if(obj.metro_code === zipObj.metro_code) { return $("#"+zipObj.zip); }
        });

        checkBoxes = _.filter(checkBoxes, function(checkBox){
          return typeof(checkBox) !== "undefined";
        });

        var $obj = $(obj);
        _.each(checkBoxes, function(checkBox) {
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
              obj.marker.setIcon(obj.selectedIcon);
            } else {
              obj.marker.setIcon(obj.icon);
            }
          });
        });
        obj.marker.setVisible(false);
      }
    });
  });

  _.each(zipcodes, function(obj) {
    geocoder.geocode( { 'address': obj.zip}, function(results, status) {
 //* Math.floor(obj.count / zipCountMax),
      obj.icon = new google.maps.MarkerImage(
        'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        null, //size
        null, //origin
        null, //anchor
        new google.maps.Size(40 * (obj.count/zipCountMax) + 10,110 * (obj.count/zipCountMax) + 10)
      );
      obj.selectedIcon = new google.maps.MarkerImage(
        'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        null, //size
        null, //origin
        null, //anchor
        new google.maps.Size(40 * (obj.count/zipCountMax)+ 10,110 * (obj.count/zipCountMax)+ 10)
      );

      if (status == google.maps.GeocoderStatus.OK) {
        obj.latLng = results[0].geometry.location;
        obj.marker = new google.maps.Marker({
          position: obj.latLng,
          draggable: false,
          map: map,
          icon: obj.icon,
          //new google.maps.Size(40 * Math.floor((obj.count / zipCountMax)), 110 * Math.floor((obj.count * zipCountMax))),
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
            obj.marker.setIcon(obj.selectedIcon);
          } else {
            obj.marker.setIcon(obj.icon);
          }
        });
      }
    });
  });

  var mapEntities = metroCodes.concat(zipcodes);

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
    _.each(mapEntities, function(obj) {
      if(bounds.contains(obj.latLng)){
        var $obj = $(obj);
        $obj.trigger('selected');
        obj.marker.setIcon(obj.selectedIcon);
      }
    });
  };

  var resetMarkers = function() {
    _.each(mapEntities, function(obj) {
      var $obj = $(obj);
      $obj.trigger('deselected');
      obj.marker.setIcon(obj.icon);
    });
  };

  var setVisibleZipMarkers = function(bool) {
    _.each(zipcodes, function(obj) {
      obj.marker.setVisible(bool);
    });
  };

  var setVisibleMetroMarkers = function(bool) {
    _.each(metroCodes, function(obj) {
      obj.marker.setVisible(bool);
    });
  };

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

  google.maps.event.addListener(map, 'zoom_changed', function(e) {
    if(map.getZoom() < 9) {
      setVisibleMetroMarkers(true);
      setVisibleZipMarkers(false);
    } else {
      setVisibleZipMarkers(true);
      setVisibleMetroMarkers(false);
    }
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
};
google.maps.event.addDomListener(window, 'load', initialize);
