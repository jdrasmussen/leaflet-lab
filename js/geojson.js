

//function to instantiate the Leaflet map
function createMap(){
  //create the Map
  var map = L.map('youngadultsMap', {
    center: [39.8283,-97.0],
    zoom: 3.5
  });

 //add OSM base tileLayer
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  //call getData function
  getData(map);

};

//function to retrieve data from geojson and place it on the Map
function getData(map){
  //load the data
  $.ajax("data/populations.geojson", {
    dataType: "json",
    success: function(response){
      //create an attributes array
      var attributes = processData(response);

      //call function to create proportional symbols
      createPropSymbols(response, map, attributes);

      //call function to create slider
      createSequenceControls(response, map, attributes);
    }
  });
};


function createPropSymbols(data, map, attributes){
    //create a leaflet GeoJSON layer and add it to the map
    var myData = L.layerGroup([]);
    var dataLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng){
        return pointToLayer(feature, latlng, attributes);
      }
    });

    dataLayer.id='datalayer';

    myData.addLayer(dataLayer);

    myData.addTo(map);
};

function createSequenceControls(data, map, attributes){
   //setting up buttons to control year slider, then placing images.
    $('#control').append('<button class="skip" id="next">Next</button>');
    $('#next').html('<img src="img/right_arrow.png" align="middle">');
    $('#control').append('<button class="skip" id="previous">Previous</button>');
    $('#previous').html('<img src="img/left_arrow.png" align="middle">');

    //create range input element (slider)
    $('#control').append('<input class="range-slider" type="range" id="slider">');

    $('.range-slider').attr({
      max: 12,
      min: 0,
      value: 0,
      step: 1
    })

    //click listener for buttons
    $('.skip').click(function(){
      //sequence to update index on button use
      //get current index value
      var index = $('.range-slider').val();

      //increment or decrement depending on button clicked
      if ($(this).attr('id') == 'next'){
        index++;
        //if above max, wrap around to first attribute
        index = index > 12 ? 0 : index;
      } else if ($(this).attr('id')=='previous'){
        index--;

        index = index < 0 ? 12: index;
      };

      //update slider
      $('.range-slider').val(index);

      //pass new index to attribute setting
      updatePropSymbols(map, attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function(){
      //sequence to get the new index value
      var index = $(this).val();

      //pass new index to attribute setting
      updatePropSymbols(map, attributes[index]);

    });

    //click listeners for radio filter buttons
    $("input[name=select]").click(function() {
      //get value of the element clicked
      var filterset = $(this).val();

      //pass it to the filterdata function
      filterData(data, map, filterset, attributes);

    })
};

function calcPropRadius(attValue){
  //console.log("calcPropRadius running");
  //scale factor to adjust symbol size evenly
  var scaleFactor = 0.0002;

  //area based on attribute value and scale factor
  var area = attValue * scaleFactor;
  //console.log("area = "+ area);

  //radius calculated based on the Area
  var radius = Math.sqrt(area/Math.PI);
  //console.log("radius in calc function:" + radius);
  return radius;

};

function pointToLayer(feature, latlng, attributes){
  //define attribute to visualize
  var attribute=attributes[0];
  console.log(attribute);

  //create marker options
  var markerOptions = {
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  }

  //get selected value for each feature
  var attValue = Number(feature.properties[attribute]);

  //set radius based on attribute
  markerOptions.radius = calcPropRadius(attValue);

  //create circle marker layer
  var layer = L.circleMarker(latlng, markerOptions);

  var year = attribute.substring(0,4);

  //build panel content string
  var panelContent = "<p><b>City: </b>" + feature.properties.Name + "</p><p><b>"+ year+" Total Population: </b>" + feature.properties[attribute] +"</p>";

  //set up city name as popup content
  var popupContent = feature.properties.Name;

  //bind the popup to the circle marker
  layer.bindPopup(popupContent, {
    offset: new L.Point(0, -markerOptions.radius)
  });

  //event listeners to open popup on hover and fillpanel on click
  layer.on({
    mouseover: function(){
      this.openPopup();
    },
    mouseout: function(){
      this.closePopup();
    },
    click: function(){
      $("#infopane").html(panelContent);
    }
  });

  //return the cirle marker to the L.geoJson pointToLayer option
  return layer;

};

function processData(data){
  //empty array to hold attributes
  var attributes = [];

  //properties of the first feature in the dataset
  var properties = data.features[0].properties;

  //push each attribute into attributes array
  for (var attribute in properties){
    //only take attributes for totalpop
    if(attribute.indexOf("totpop") > -1){
      attributes.push(attribute);
    };
  };

  //check result
  console.log(attributes);

  return attributes;
};

function updatePropSymbols(map, attribute){
  map.eachLayer(function(layer){
    if (layer.feature && layer.feature.properties[attribute]){
      //access feature properties
      var props = layer.feature.properties;

      //update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);
      console.log(props[attribute]);

      //add city to panel  content string
      var year = attribute.substring(0,4);
      console.log(year);
      var panelContent = "<p><b>City: </b>" + props.Name + "</p><p><b>"+ year+" Total Population: </b>" + props[attribute] +"</p>";

      //create display to indicate what year data is mapped
      $('#yearlabel').html('<p><b>  Data displayed for: </b>'+year+'</p>');

      //event listeners to open popup on hover and fillpanel on click
      layer.on({
        mouseover: function(){
          this.openPopup();
        },
        mouseout: function(){
          this.closePopup();
        },
        click: function(){
          $("#infopane").html(panelContent);
        }
      });
    };
  });
  updateLegend(map, attribute);
};

function filterData(data, map, filterset, attributes){
    //find and remove the datalayer to clear data before retrieving filtered features
    map.eachLayer(function(layer){
      if (layer.id == 'datalayer'){
        console.log("found datalayer");
        map.removeLayer(layer);
      }
    });

    //create a leaflet GeoJSON layer and add it to the map
    var myData = L.layerGroup([]);
    var dataLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng){
        return pointToLayer(feature, latlng, attributes);
      },
      filter: function(feature, layer) {
        if (filterset == "all"){
          return true;
        }
        else if (filterset == "tophalf") {
          return feature.properties.tophalf == "TRUE";
        }
        else if (filterset == "bottomhalf") {
          return feature.properties.tophalf == "FALSE";
        }
      }
    });

    dataLayer.id='datalayer';

    myData.addLayer(dataLayer);

    myData.addTo(map);
};

$(document).ready(createMap);
