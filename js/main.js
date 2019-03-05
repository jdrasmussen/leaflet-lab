var mymap = L.map('coorsMap').setView([39.7392, -104.9903], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',  {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiamRyYXNtdXNzZW4iLCJhIjoiY2pyeHY1NDh6MHJpeTN5b2RiYXNuazQ4ZyJ9.K4cq0Kx0v8IvuyuDd1PXGA'
}).addTo(mymap);



// L.geoJSON(geojsonFeature).addTo(mymap);


// var states = [{
//   "type": "Feature",
//   "properties": {"party": "Republican"},
//   "geometry": {
//     "type": "Polygon",
//     "coordinates": [[
//       [-104.05, 48.99],
//       [-97.22,  48.98],
//       [-96.58,  45.94],
//       [-104.03, 45.94],
//       [-104.05, 48.99]
//     ]]
//   }
//   }, {
//     "type": "Feature",
//     "properties": {"party": "Democrat"},
//     "geometry": {
//     "type": "Polygon",
//     "coordinates": [[
//       [-109.05, 41.00],
//       [-102.06, 40.99],
//       [-102.03, 36.99],
//       [-109.04, 36.99],
//       [-109.05, 41.00]
//     ]]
//   }
// }];
//
// L.geoJSON(states, {
//   style: function(feature){
//     switch (feature.properties.party) {
//       case 'Republican': return {color: "#ff0000"};
//       case 'Democrat':   return {color: "#0000ff"};
//     }
//   }
// }).addTo(mymap);

var geojsonMarkerOptions = {
  radius: 8,
  fillColor:"#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

// L.geoJSON(geojsonFeature, {
//   pointToLayer: function (feature, latlng){
//     return L.circleMarker(latlng, geojsonMarkerOptions);
//   }
// }).addTo(mymap);

var geojsonFeature = {
  "type": "Feature",
  "properties":{
    "name": "Coors Field",
    "amenity": "Baseball Stadum",
    "popupContent": "This is where the Rockies play!"
  },
  "geometry":{
    "type": "Point",
    "coordinates": [-104.99404, 39.75621]
  }
};

function onEachFeature (feature, layer) {
  if (feature.properties && feature.properties.popupContent){
    layer.bindPopup(feature.properties.popupContent);
  }
};

L.geoJSON(geojsonFeature, {
  onEachFeature: onEachFeature
}).addTo(mymap);
