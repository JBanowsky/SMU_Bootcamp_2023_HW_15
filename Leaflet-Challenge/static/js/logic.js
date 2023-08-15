// Construct URL for earthquake data
let queryUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`;
 
// Fetch earthquake data using promises
d3.json(queryUrl).then(function (data) {
    // Call the function to create the map with fetched data
    createMap(data);
    });

// Function to bind popup content to each earthquake feature
function onEachFeature(feature, layer) {
    layer.bindPopup(
        `<h3>${feature.properties.title}</h3>
        <hr><p>${new Date(feature.properties.time)}</p>
        <hr><p>Magnitude: ${feature.properties.mag}</p>
        <hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
}

// Function to calculate marker size based on earthquake magnitude
function markerSize(magnitude) {
    let radius = magnitude * 20000;
     if (magnitude === 0) {
        radius = 40;
    }
    return radius;
}

// Function to determine marker color based on earthquake depth
function markerColor(depth) {
    let color = "#98ee00";
    if (depth >= 90) {
        color = "#ea2c2c";
    } else if (depth >= 70) {
        color = "#ea822c";
    } else if (depth >= 50) {
        color = "#ee9c00";
    } else if (depth >= 30) {
        color = "#eecc00";
    } else if (depth >= 10) {
        color = "#d4ee00";
    } else {
        color = "#98ee00";
    }
    return color;
}

// Function to create the interactive map with earthquake data
function createMap(data) {
      // Define base map layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a GeoJSON layer for earthquake features
    let earthquakeLayer = L.geoJSON(data.features, {
        onEachFeature: onEachFeature
    });

    // Create an array to hold earthquake circle markers
    let earthquakeCircles = [];

    // Iterate through earthquake data to create circle markers
    for (let i = 0; i < data.features.length; i++) {
        let earthquake = data.features[i];
  
        // Extract location coordinates
        let location = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]];
  
        // Create a circle marker for each earthquake
        let earthquakeCircle = L.circle(location, {
            stroke: true,
            fillOpacity: .75,
            color: markerColor(earthquake.geometry.coordinates[2]),
            weight: 1,
            fillColor: markerColor(earthquake.geometry.coordinates[2]),
            radius: markerSize(earthquake.properties.mag)
        }).bindPopup(
            `<h3>${earthquake.properties.title}</h3>
            <hr><p>${new Date(earthquake.properties.time)}</p>
            <hr><p>Magitude: ${earthquake.properties.mag}</p>
            <hr><p>Depth: ${earthquake.geometry.coordinates[2]}</p>`);
  
        // Add the circle marker to the array
        earthquakeCircles.push(earthquakeCircle);
    }

    // Create a layer group for earthquake circle markers
    let circleLayer = L.layerGroup(earthquakeCircles);

    // Define base and overlay map layers for Leaflet control
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    let overlayMaps = {
        "Earthquake Markers": earthquakeLayer,
        "Earthquake Magnitude Circles": circleLayer,
    };

    // Create the Leaflet map
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, circleLayer]
    });

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Create a legend for earthquake depth
    let legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        div.innerHTML += "<div><b>Depth</b></div>";
        div.innerHTML += "<i style='background: #98ee00'></i> 0 - 10<br>";
        div.innerHTML += "<i style='background: #d4ee00'></i> 10 - 30<br>";
        div.innerHTML += "<i style='background: #eecc00'></i> 30 - 50<br>";
        div.innerHTML += "<i style='background: #ee9c00'></i> 50 - 70<br>";
        div.innerHTML += "<i style='background: #ea822c'></i> 70 - 90<br>";
        div.innerHTML += "<i style='background: #ea2c2c'></i> 90+";
        return div
    }

    // Add the legend to the map
    legend.addTo(myMap);
}
