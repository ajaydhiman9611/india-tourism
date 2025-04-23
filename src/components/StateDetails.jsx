import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Polygon, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import HeroBanner from './TouristPlaceComponent/HeroBanner';
import apiHelper from '../helpers/apicalls';
import './TouristPlaceComponent/StateDetails.scss';
import axios from 'axios';
import constants from '../helpers/constants';

const containerStyle = {
  width: '100%',
  height: '400px', // Adjust as needed
};

const mapOptions = {
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
};

const StateDetails = () => {
  const { stateName } = useParams();
  const [stateData, setStateData] = useState(null);
  const [stateGeoJson, setStateGeoJson] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(10); // Initial zoom
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  // const { isLoaded, loadError } = useJsApiLoader({
  //   id: 'google-map-script',
  //   googleMapsApiKey: constants.GOOGLE_MAPS_API_KEY,
  // });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/states/${stateName}`);
        setStateData(res.data.data);
      } catch (err) {
        console.error('Error fetching state data:', err);
      }
    };
    fetchData();
  }, [stateName]);

  useEffect(() => {
    fetch('/india-osm.geojson')
      .then((response) => response.json())
      .then((data) => {
        const selectedState = data.features.find(
          (feature) => feature.properties.NAME_1 === stateName
        );
        console.log({selectedState})
        if (selectedState) {
          setStateGeoJson(selectedState);

          // Calculate a center point for the state (basic approach)
          if (selectedState.geometry.type === 'Polygon') {
            const firstPolygon = selectedState.geometry.coordinates[0];
            const sumLat = firstPolygon.reduce((sum, coord) => sum + coord[1], 0);
            const sumLng = firstPolygon.reduce((sum, coord) => sum + coord[0], 0);
            setMapCenter({
              lat: sumLat / firstPolygon.length,
              lng: sumLng / firstPolygon.length,
            });
          } else if (selectedState.geometry.type === 'MultiPolygon') {
            // For MultiPolygon, take the centroid of the first polygon for simplicity
            const firstPolygon = selectedState.geometry.coordinates[0][0];
            const sumLat = firstPolygon.reduce((sum, coord) => sum + coord[1], 0);
            const sumLng = firstPolygon.reduce((sum, coord) => sum + coord[0], 0);
            setMapCenter({
              lat: sumLat / firstPolygon.length,
              lng: sumLng / firstPolygon.length,
            });
          }
          setMapZoom(6); // Adjust zoom as needed
          setIsLoaded(true)
        } else {
          setStateGeoJson(null);
          setMapCenter(null);
        }
      })
      .catch((error) => console.error('Error loading GeoJSON:', error));
  }, [stateName]);

  const handlePlaceClick = useCallback((place) => {
    setSelectedPlace(place);
    setInfoWindowPosition({ lat: place.latitude, lng: place.longitude }); // Assuming your place data has latitude and longitude
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  if (loadError) {
    return <div>Map cannot be loaded, sorry.</div>;
  }

  return isLoaded ? (
    <div>
      {/* Hero Section */}
      <div className="hero" style={{ backgroundImage: `url(${stateData?.heroImage})` }}>
        <div className="overlay">
          <h1>Welcome to {stateData?.name}</h1>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        {stateGeoJson && mapCenter && (
          <LoadScript googleMapsApiKey={constants.GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={mapZoom}
              options={mapOptions}
            >
              <Polygon
                paths={
                  stateGeoJson.geometry.type === 'Polygon'
                    ? stateGeoJson.geometry.coordinates[0].map((coord) => ({
                        lat: coord[1],
                        lng: coord[0],
                      }))
                    : stateGeoJson.geometry.coordinates.flatMap((polygon) =>
                        polygon[0].map((coord) => ({ lat: coord[1], lng: coord[0] }))
                      )
                }
                options={{
                  fillColor: '#008000',
                  fillOpacity: 0.3,
                  strokeColor: '#006400',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: false,
                }}
              />
              {stateData?.places?.map((place, index) => (
                <div
                  key={index}
                  position={{ lat: place.latitude, lng: place.longitude }}
                  onClick={() => handlePlaceClick(place)}
                >
                  {/* You might want to use a custom marker here */}
                </div>
              ))}
              {selectedPlace && infoWindowPosition && (
                <InfoWindow position={infoWindowPosition} onCloseClick={handleInfoWindowClose}>
                  <div>
                    <h3>{selectedPlace.name}</h3>
                    <p>{selectedPlace.description}</p>
                    {/* Add more details as needed */}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}
        {!stateGeoJson && <p>Map for {stateName} not available.</p>}
      </div>

      {/* Places Section */}
      <div className="container mt-5">
        <h2 className="mb-4">Famous Places to Explore in {stateData?.name}</h2>
        <div className="row">
          {stateData?.places?.map((place, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100">
                <img src={place.thumbImage} className="card-img-top" alt={place.name} />
                <div className="card-body">
                  <h5 className="card-title">{place.name}</h5>
                  <p className="card-text">{place.desc}</p>
                  {place.latitude && place.longitude && (
                    <button className="btn btn-sm btn-primary mt-2" onClick={() => handlePlaceClick(place)}>
                      View on Map
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div>Loading map...</div>
  );
};

export default StateDetails;