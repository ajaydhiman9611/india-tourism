import React, { useEffect, useState } from 'react';
import { GoogleMap, InfoWindow, LoadScript, Polygon } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import constants from '../helpers/constants';
// import stateBoundaries from '../india-osm.geojson'; // Import your state boundary data

const containerStyle = {
  width: '100%',
  marginTop: "100px",
  height: '750px', // Adjust as needed
};

const center = {
  lat: 20.5937, // Approximate center of India
  lng: 78.9629,
};

const mapOptions = {
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
};

function IndiaMap() {
  const navigate = useNavigate();
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);

  const handleStateClick = (stateId) => {
    navigate(`/${stateId}`); // Navigate to a new page for the clicked state
  };

  const handleMouseOver = (stateName) => {
    setHoveredState(stateName);
  };

  const handleMouseOut = () => {
    setHoveredState(null);
  };

  useEffect(() => {
    fetch('/india-osm.geojson') // Place india.geojson in your public folder
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data));
  }, []);

  console.log({geoJsonData})
  return (
    <div style={{width: "100%", height: "100%"}}>
      <LoadScript googleMapsApiKey={constants.GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={4} // Adjust initial zoom level
          options={mapOptions}
          style={{ width: '100%', height: '100%' }}
        >
          {geoJsonData?.features.map((feature) => {
            const stateName = feature.properties.NAME_1;
            const stateId = feature.properties.ISO; // Or another unique identifier
            const geometryType = feature.geometry.type;
            const coordinates = feature.geometry.coordinates;

            let paths = [];
            if (geometryType === 'Polygon') {
              paths = coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
            } else if (geometryType === 'MultiPolygon') {
              // Handle MultiPolygon by mapping over each polygon
              paths = coordinates.flatMap(polygon =>
                polygon[0].map(coord => ({ lat: coord[1], lng: coord[0] }))
              );
            }

            return (
              <Polygon
                key={stateId}
                paths={paths}
                options={{
                  fillColor: '#008000',
                  fillOpacity: 0.3,
                  strokeColor: '#006400',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: true,
                }}
                onClick={() => handleStateClick(stateName)}
                // onMouseOver={() => handleMouseOver(stateName)}
                // onMouseOut={handleMouseOut}
              />
            );
          })}
          {hoveredState && (
            <InfoWindow
              position={
                // You might need to calculate a representative point for the hovered state
                // For simplicity, let's take the first coordinate of the first polygon
                geoJsonData.features.find(state => state.properties.state_name === hoveredState)?.geometry.coordinates[0][0].map(coord => ({ lat: coord[1], lng: coord[0] }))[0] || center
              }
              onCloseClick={() => setHoveredState(null)}
            >
              <div>{hoveredState}</div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default IndiaMap;