import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import axios from "axios";
import { Card, CardBody, Button, Badge } from "reactstrap";
import "./TouristPlaceComponent/StateDetails.scss";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { Chip, Paper, Typography } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import { getWeatherInfo } from "../helpers/weatherData";

/* ---------- HELPERS ---------- */
const getCentroid = (geometry) => {
  let coords = [];

  if (geometry.type === "Polygon") {
    coords = geometry.coordinates[0];
  } else if (geometry.type === "MultiPolygon") {
    coords = geometry.coordinates[0][0];
  }

  const [lng, lat] = coords.reduce(
    (acc, cur) => [acc[0] + cur[0], acc[1] + cur[1]],
    [0, 0]
  );

  return {
    lng: lng / coords.length,
    lat: lat / coords.length
  };
};

/* ---------- COMPONENT ---------- */
const StateDetails = () => {
  const { stateName } = useParams();
  const navigate = useNavigate();

  const [stateData, setStateData] = useState(null);
  const [stateGeoJson, setStateGeoJson] = useState(null);
  const [mapCenter, setMapCenter] = useState([78.9629, 20.5937]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [currentZoom, setCurrentZoom] = useState(mapZoom);

  /* ---------- FETCH STATE DATA ---------- */
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/v1/states/${stateName}`)
      .then((res) => setStateData(res.data.data))
      .catch(console.error);
  }, [stateName]);

  /* ---------- FETCH GEOJSON ---------- */
  useEffect(() => {
    fetch("/india-osm.geojson")
      .then((res) => res.json())
      .then((geo) => {
        const stateFeature = geo.features.find(
          (f) => f.properties.NAME_1 === stateName
        );

        if (!stateFeature) return;

        setStateGeoJson({
          type: "FeatureCollection",
          features: [stateFeature]
        });

        const centroid = getCentroid(stateFeature.geometry);
        setMapCenter([centroid.lng, centroid.lat]);
        setMapZoom(3);
      })
      .catch(console.error);
  }, [stateName]);

  /* ---------- PLACE CLICK ---------- */
  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    const geoCoords = place.coordinates?.coordinates;
    setMapZoom(4);
    if (!geoCoords || geoCoords.length !== 2) return null;
    const [lat, lng] = geoCoords;
    setMapCenter([Number(lat), Number(lng)]);
  };

  const getMarkerRadius = (zoom) => {
    console.log("zoom :: ", zoom)
    return Math.max(1, 6 / zoom);
  }

  if (!stateGeoJson || !stateData) return <div>Loading map…</div>;
  
  console.log("PLACES:", stateData.places);
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${stateData.heroImage})` }}
      >
        <div className="overlay">
          <h1>Welcome to {stateData.name}</h1>
        </div>
      </div>

      {/* ---------- WEATHER WIDGET ---------- */}
      {(() => {
        const weather = getWeatherInfo(stateName);
        if (!weather) return null;
        return (
          <Paper elevation={2} sx={{ p: 2, mx: 2, my: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', background: '#fffbeb' }}>
            <WbSunnyIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="body1" fontWeight={600}>Best Time to Visit:</Typography>
            <Chip label={weather.months} color="warning" />
            <Chip label={weather.climate} variant="outlined" />
            <Typography variant="body2" color="text.secondary" sx={{ flexBasis: '100%' }}>{weather.tip}</Typography>
          </Paper>
        );
      })()}

      {/* ---------- MAP ---------- */}
      <div className="map-section">
        {renderStateMap()}
        <Tooltip id="place-tooltip" place="top" />
        {selectedPlace && (
          <div className="state-tooltip" style={{background: "lightgreen", padding: "10px"}}>
            <img src={selectedPlace.thumbImage} alt={selectedPlace.name} />
            <h4>{selectedPlace.name}</h4>
            <p>{selectedPlace.desc}</p>
            <Button size="sm" onClick={() => setSelectedPlace(null)}>
              Close
            </Button>
          </div>
        )}
      </div>

      {/* ---------- PLACES CARDS ---------- */}
      <div className="container mt-4 pb-5">
        <div className="row">
          {stateData.places?.map((place) => (
            <div className="col-md-4 mb-4" key={place._id}>
              <Card className="h-100 shadow-sm">
                <img src={place.thumbImage} alt={place.name} />
                <CardBody>
                  <h5>{place.name}</h5>
                  <p>{place.desc}</p>

                  <div className="mb-2">
                    {place.tags?.map((tag, i) => (
                      <Badge key={i} color="info" className="me-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handlePlaceClick(place)}
                    className="me-2"
                  >
                    View on Map
                  </Button>
                  <Button
                    size="sm"
                    color="success"
                    onClick={() => navigate(`/place/${place._id}`)}
                  >
                    View Details
                  </Button>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  function renderStateMap() {
    return <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 1200 }}
      style={{ width: "100%", height: "500px" }}
    >
      <ZoomableGroup center={mapCenter} zoom={mapZoom} onMoveEnd={({ zoom }) => setCurrentZoom(zoom)}>
        {/* STATE */}
        <Geographies geography={stateGeoJson}>
          {({ geographies }) => geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              style={{
                default: {
                  fill: "#dcfce7",
                  stroke: "#166534",
                  strokeWidth: 0.5,
                  outline: "none"
                },
                hover: {
                  fill: "#dcfce7", // same as default
                  stroke: "#166534", // same stroke
                  strokeWidth: 0.5,
                  outline: "none"
                },
                pressed: {
                  fill: "#dcfce7",
                  stroke: "#166534",
                  strokeWidth: 0.5,
                  outline: "none"
                }
              }} />
          ))}
        </Geographies>

        {/* PLACES */}
        {stateData.places?.map((place, idx) => {
          const geoCoords = place.coordinates?.coordinates;

          if (!geoCoords || geoCoords.length !== 2) return null;
          const [lat, lng] = geoCoords;
          console.log({ place }, { lat, lng });

          return (
            <Marker
              key={place._id}
              coordinates={[
                lat, lng
              ]}
            >
              <circle
                r={getMarkerRadius(currentZoom)}
                fill="#ef4444"
                data-tooltip-id="place-tooltip"
                data-tooltip-content={place.name}
                style={{ cursor: "pointer" }} />
            </Marker>
          );
        })}
      </ZoomableGroup>
    </ComposableMap>;
  }
};

export default StateDetails;
