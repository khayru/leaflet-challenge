// Perform a GET request to the query URL/
let queryUrl ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(data)
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${
      feature.properties.place
    }</h3><hr><p> Time:${new Date(feature.properties.time)}</p>
      <hr><p>Magnitude: ${
        feature.properties.mag
      }</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  function createCircleMarker(feature, latlng) {
    let options = {
      radius: feature.properties.mag * 5,
      fillColor: chooseColor(feature.properties.mag),
      color: chooseColor(feature.properties.mag),
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.35,
    };
    return L.circleMarker(latlng, options);
  }
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createCircleMarker,
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}
// create markers should reflect the magnitude of the earthquake
//by their size and the depth of the earthquake by color.
// Earthquakes with higher magnitudes should appear larger,
//and earthquakes with greater depth should appear darker in color.
function chooseColor(mag) {
  switch (true) {
    case 1.0 <= mag && mag <= 2.5:
      return "#FD8D3C";

    case 2.5 <= mag && mag <= 4.0:
      return "#E31A1C";
      
    case 4.0 <= mag && mag <= 5.5:
      return "#BD0026";
    case 5.5 <= mag && mag <= 8.0:
      return "#800026";
     
    case 8.0 <= mag && mag <= 20.0:
      return "#66001E";
    default:
      return "#FED976";
  }
}
// create legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  let depth = [1.0, 2.5, 4.0, 5.5, 8.0];
  let labels = [];
  let legend_info ="<h5>Magnitude</h5>";

  div.innerHTML = legend_info;
  // push to labels array as list item
  for (let i = 0; i < depth.length; i++) {
    labels.push(
      '<ul style="background-color:' +
        chooseColor(depth[i] + 1) +
        '"> <span>' +
        depth[i] +
        (depth[i + 1] ? "&ndash;" + depth[i + 1] + "" : "+") +
        "</span></ul>"
    );
  }

  // add each label list item to the div under the <ul> tag
  div.innerHTML += "<ul>" + labels.join("") + "</ul>";

  return div;
};
// Create the tileLayer.
function createMap(earthquakes) {
  let street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes],
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);
  legend.addTo(myMap);
}
