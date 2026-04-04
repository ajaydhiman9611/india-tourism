import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ComposableMap, Geographies, Geography, ZoomableGroup, Marker
} from "react-simple-maps";
import axios from "axios";
import {
  Box, Container, Typography, Chip, Grid, Card, CardMedia,
  CardContent, CardActions, Button, Paper, Skeleton, alpha
} from "@mui/material";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getWeatherInfo } from "../helpers/weatherData";

/* ── centroid helper ── */
const getCentroid = (geometry) => {
  let coords = geometry.type === "Polygon"
    ? geometry.coordinates[0]
    : geometry.coordinates[0][0];
  const [lng, lat] = coords.reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]);
  return { lng: lng / coords.length, lat: lat / coords.length };
};

const StateDetails = () => {
  const { stateName } = useParams();
  const navigate = useNavigate();

  const [stateData, setStateData] = useState(null);
  const [stateGeoJson, setStateGeoJson] = useState(null);
  const [mapCenter, setMapCenter] = useState([78.9629, 20.5937]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${constants.API_URL}/states/${stateName}`)
      .then(res => { setStateData(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [stateName]);

  useEffect(() => {
    fetch("/india-osm.geojson").then(r => r.json()).then(geo => {
      const feature = geo.features.find(f => f.properties.NAME_1 === stateName);
      if (!feature) return;
      setStateGeoJson({ type: "FeatureCollection", features: [feature] });
      const c = getCentroid(feature.geometry);
      setMapCenter([c.lng, c.lat]);
      setMapZoom(3);
    });
  }, [stateName]);

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    const [lng, lat] = place.coordinates?.coordinates || [];
    if (lng && lat) { setMapCenter([lng, lat]); setMapZoom(4); }
  };

  const weather = getWeatherInfo(stateName);

  /* Loading skeleton */
  if (loading) return (
    <Box>
      <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 0 }} />
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => <Grid item xs={12} sm={6} md={4} key={i}><Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} /></Grid>)}
        </Grid>
      </Container>
    </Box>
  );

  if (!stateData) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Typography color="text.secondary">State not found.</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 320, md: 480 },
          overflow: 'hidden',
          background: '#1C1C2E',
        }}
      >
        {stateData.heroImage && (
          <Box
            component="img"
            src={stateData.heroImage}
            alt={stateData.name}
            sx={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: 0.55,
            }}
          />
        )}
        {/* Gradient overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(28,28,46,0.95) 0%, rgba(28,28,46,0.3) 60%, transparent 100%)',
        }} />
        {/* Text */}
        <Container
          maxWidth="xl"
          sx={{
            position: 'relative', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 5,
          }}
        >
          <Typography className="section-label" sx={{ color: '#FFB347' }}>
            Explore India
          </Typography>
          <Typography variant="h1" sx={{ color: 'white', fontSize: { xs: '2.4rem', md: '3.5rem' }, mb: 1 }}>
            {stateData.name}
          </Typography>
          {stateData.heroDescription && (
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', maxWidth: 600, fontSize: '1rem', lineHeight: 1.65 }}>
              {stateData.heroDescription}
            </Typography>
          )}
        </Container>
      </Box>

      {/* ── Weather strip ── */}
      {weather && (
        <Box sx={{ background: 'linear-gradient(135deg, #FFF9F5, #FFF3E8)', borderBottom: '1px solid rgba(224,90,27,0.12)' }}>
          <Container maxWidth="xl" sx={{ py: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <WbSunnyIcon sx={{ color: '#E05A1B', fontSize: 22 }} />
            <Typography fontWeight={600} fontSize="0.9rem">Best time to visit:</Typography>
            <Chip label={weather.months} size="small" sx={{ background: '#E05A1B', color: 'white', fontWeight: 700 }} />
            <Chip label={weather.climate} size="small" variant="outlined" sx={{ borderColor: '#E05A1B', color: '#E05A1B' }} />
            <Typography variant="body2" color="text.secondary" sx={{ flexBasis: '100%', pl: 4 }}>{weather.tip}</Typography>
          </Container>
        </Box>
      )}

      {/* ── Map + tooltip panel ── */}
      {stateGeoJson && (
        <Box sx={{ background: '#F8F8F6', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Grid container spacing={3} alignItems="stretch">
              <Grid item xs={12} md={selectedPlace ? 8 : 12}>
                <Paper elevation={2} sx={{ overflow: 'hidden', height: 420, borderRadius: 3 }}>
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{ scale: 1200 }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <ZoomableGroup
                      center={mapCenter}
                      zoom={mapZoom}
                      onMoveEnd={({ zoom }) => setCurrentZoom(zoom)}
                    >
                      <Geographies geography={stateGeoJson}>
                        {({ geographies }) => geographies.map(geo => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            style={{
                              default: { fill: "#FFF0E8", stroke: "#E05A1B", strokeWidth: 0.5, outline: "none" },
                              hover: { fill: "#FFD8C0", outline: "none" },
                              pressed: { fill: "#FFD8C0", outline: "none" },
                            }}
                          />
                        ))}
                      </Geographies>
                      {stateData.places?.map((place) => {
                        const [lng, lat] = place.coordinates?.coordinates || [];
                        if (!lng || !lat) return null;
                        return (
                          <Marker key={place._id} coordinates={[lng, lat]}>
                            <circle
                              r={Math.max(1.2, 6 / currentZoom)}
                              fill={selectedPlace?._id === place._id ? "#1B7A3E" : "#E05A1B"}
                              stroke="white"
                              strokeWidth={0.5}
                              data-tooltip-id="place-tip"
                              data-tooltip-content={place.name}
                              style={{ cursor: "pointer" }}
                              onClick={() => handlePlaceClick(place)}
                            />
                          </Marker>
                        );
                      })}
                    </ZoomableGroup>
                  </ComposableMap>
                  <Tooltip id="place-tip" place="top" />
                </Paper>
              </Grid>

              {selectedPlace && (
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ height: 420, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
                    {selectedPlace.thumbImage && (
                      <Box
                        component="img"
                        src={selectedPlace.thumbImage}
                        alt={selectedPlace.name}
                        sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                      />
                    )}
                    <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" fontWeight={700} mb={1}>{selectedPlace.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                        {selectedPlace.desc}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained" size="small" color="primary"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate(`/place/${selectedPlace._id}`)}
                          sx={{ flex: 1 }}
                        >
                          View Details
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => setSelectedPlace(null)}>
                          Close
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ── Places grid ── */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box mb={4}>
          <Typography className="section-label">Tourist Attractions</Typography>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
            Places to Visit in {stateData.name}
          </Typography>
        </Box>

        {(!stateData.places || stateData.places.length === 0) && (
          <Typography color="text.secondary">No places added yet.</Typography>
        )}

        <Grid container spacing={3}>
          {stateData.places?.map((place) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={place._id}>
              <Card
                sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', overflow: 'hidden',
                }}
                onClick={() => navigate(`/place/${place._id}`)}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={place.thumbImage || 'https://placehold.co/400x200/1C1C2E/white?text=' + encodeURIComponent(place.name)}
                    alt={place.name}
                    sx={{ transition: 'transform 0.4s ease', '&:hover': { transform: 'scale(1.05)' } }}
                  />
                  <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    p: 1.5,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PlaceIcon sx={{ color: '#E05A1B', fontSize: 14 }} />
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        {stateName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: '1rem' }}>
                    {place.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary"
                    sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {place.desc}
                  </Typography>
                </CardContent>
                <CardActions sx={{ pt: 0, px: 2, pb: 2, gap: 1 }}>
                  <Button
                    size="small" variant="outlined" color="primary"
                    onClick={e => { e.stopPropagation(); handlePlaceClick(place); }}
                    startIcon={<PlaceIcon sx={{ fontSize: '0.9rem !important' }} />}
                    sx={{ flex: 1, borderRadius: '999px' }}
                  >
                    Map
                  </Button>
                  <Button
                    size="small" variant="contained" color="primary"
                    onClick={() => navigate(`/place/${place._id}`)}
                    sx={{ flex: 1, borderRadius: '999px' }}
                  >
                    Explore
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StateDetails;
