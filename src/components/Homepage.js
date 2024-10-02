// src/components/IndiaMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const IndiaMap = ({ onStateClick }) => {
  const [indiaData, setIndiaData] = useState(null);
    console.log({onStateClick})
  useEffect(() => {
    // Fetch the India GeoJSON data from the local file in the public folder
    fetch("/india-osm.geojson")
      .then((response) => response.json())
      .then((data) => setIndiaData(data))
      .catch((error) => console.error('Error loading GeoJSON:', error));
  }, []);

  // Ensure we're extracting the correct state name from GeoJSON's properties
  const onEachState = (state, layer) => {
    layer.on({
      click: () => {
        console.log("On click :: ", state)
        const stateName = state.properties.NAME_1; // Assuming state name is in `properties.name`
        console.log({stateName})
        
        if (onStateClick && stateName) {
          onStateClick(stateName); // Pass the state name to parent component
        }
      },
    });
  };

  return (
    <MapContainer
      center={[22, 78]} // Center on India
      zoom={5} // Adjust zoom level
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {indiaData && (
        <GeoJSON data={indiaData} onEachFeature={onEachState} />
      )}
    </MapContainer>
  );
};

export default IndiaMap;
