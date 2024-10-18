Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNzc2MTQ2OC0xNmNhLTQ2N2UtYjYyOC1jNWNlMWIxMDgyY2MiLCJpZCI6MjQ4OTc3LCJpYXQiOjE3MjkyMDQ2ODR9.r5X9w_wDy6d9164LyX4GC5bJJFTT2g6GH2VyNZClsS4';
// Initialize the Cesium Viewer in the HTML element with the cesiumContainer ID.
const viewer = new Cesium.Viewer('cesiumContainer', {
    scene3DOnly: true,
    baseLayerPicker: false,
    infoBox: false,   
});

// Load green spaces
Cesium.GeoJsonDataSource.load('green_spaces.geojson', {
    stroke: Cesium.Color.GREEN,
    fill: Cesium.Color.GREEN.withAlpha(1), 
    strokeWidth: 2, 
}).then(function(GSDataSource) {
    viewer.dataSources.add(GSDataSource);
});

// Load restaurants
Cesium.GeoJsonDataSource.load('Restaurants.geojson', {
    stroke: Cesium.Color.PINK,
    fill: Cesium.Color.PINK.withAlpha(1), 
    strokeWidth: 2, 
}).then(function(RestaurantsDataSource) {
    viewer.dataSources.add(RestaurantsDataSource);
});

// Load roads
Cesium.GeoJsonDataSource.load('roads.geojson', {
    stroke: Cesium.Color.BLACK,
    fill: Cesium.Color.BLACK.withAlpha(1), 
    strokeWidth: 2, 
}).then(function(roadsDataSource) {
    viewer.dataSources.add(roadsDataSource);
    viewer.flyTo(roadsDataSource);
});

// Load water features
Cesium.GeoJsonDataSource.load('water_features.geojson', {
    stroke: Cesium.Color.BLUE,
    fill: Cesium.Color.BLUE.withAlpha(1), 
    strokeWidth: 2, 
}).then(function(waterFeaturesDataSource) {
    viewer.dataSources.add(waterFeaturesDataSource);
});

// Set up click event listener to display building info
viewer.selectedEntityChanged.addEventListener(entity => {
    const infoBox = document.getElementById('infoBox');
    infoBox.innerHTML = 'Click on a building to view details';
    
    if (Cesium.defined(entity) && Cesium.defined(entity.properties)) {
        const properties = entity.properties;
        infoBox.innerHTML = '<strong>Building Information:</strong><br>' +
            properties.propertyNames.map(name => 
                `<strong>${name}:</strong> ${properties[name].getValue()}<br>`
            ).join('');
    }
});

let buildingEntities = [];

// Loading buildings then flying to the buildings
Cesium.GeoJsonDataSource.load('buildings.geojson', { clampToGround: false })
    .then(function(buildingDataSource) {
        viewer.dataSources.add(buildingDataSource);
  
        // Populate the buildingEntities array with loaded entities
        buildingEntities = buildingDataSource.entities.values.map(entity => {
            return {
                name: entity.properties.building_i.getValue(),  // Adjust this to match your property name
                entity: entity
            };
        });

        // Ensure that the data source is correctly loaded and has entities
        if (buildingDataSource && buildingDataSource.entities && buildingDataSource.entities.values.length > 0) {
            // Fly to the buildings once they are added
            viewer.flyTo(buildingDataSource, {
                duration: 3 // seconds
            });
            
            // Iterate over each building entity and apply extrusions
            buildingDataSource.entities.values.forEach(entity => {
                if (entity.polygon) {
                    const height = entity.properties.final_height?.getValue() || 0; // getting the height

                    // Apply extrusion and styling
                    Object.assign(entity.polygon, {
                        extrudedHeight: height,
                        height: 0,
                        material: Cesium.Color.SADDLEBROWN,
                        outline: true,
                        outlineColor: Cesium.Color.BLACK
                    });
                }
            });
        }
    });
