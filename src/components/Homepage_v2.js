import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Box, Container, Typography, Button } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

const STATS = [
  { value: '28',    label: 'States' },
  { value: '8',     label: 'Union Territories' },
  { value: '40+',   label: 'UNESCO Heritage Sites' },
  { value: '5000+', label: 'Years of History' },
];

const STATE_NAME_MAP = {
  'Andaman & Nicobar Island':  'Andaman and Nicobar Islands',
  'Andaman and Nicobar':       'Andaman and Nicobar Islands',
  'Arunanchal Pradesh':        'Arunachal Pradesh',
  'Chhattishgarh':             'Chhattisgarh',
  'Dadara & Nagar Havelli':    'Dadra and Nagar Haveli and Daman and Diu',
  'Daman & Diu':               'Dadra and Nagar Haveli and Daman and Diu',
  'NCT of Delhi':              'Delhi',
  'Jammu & Kashmir':           'Jammu and Kashmir',
  'Telengana':                 'Telangana',
};

const getStateName = (geo) =>
  geo.properties.NAME_1 || geo.properties.ST_NM || geo.properties.name || 'Unknown State';

export default function IndiaMapInteractive() {
  const navigate   = useNavigate();
  const [geoJson,      setGeoJson]      = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos,   setTooltipPos]   = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch('/india-osm.geojson').then(r => r.json()).then(setGeoJson).catch(console.error);
  }, []);

  const handleClick = (geo) => {
    const raw    = getStateName(geo);
    const mapped = STATE_NAME_MAP[raw] || raw;
    navigate(`/state/${encodeURIComponent(mapped)}`);
  };

  return (
    <Box>

      {/* ════════════════════════════════════════
          SECTION 1 — Hero: Incredible India awaits
          ════════════════════════════════════════ */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B4E 50%, #1C1C2E 100%)',
          pt: { xs: 14, md: 18 },
          pb: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -140, right: -140, width: 520, height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,90,27,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -80, left: -80, width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,122,62,0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Headline + CTAs */}
          <Box sx={{ textAlign: 'center', mb: 7 }} className="fade-up">
            <Typography sx={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#E05A1B', mb: 1.5,
            }}>
              Discover · Explore · Experience
            </Typography>

            <Typography variant="h1" sx={{
              fontSize: { xs: '2.8rem', sm: '3.6rem', md: '4.6rem' },
              color: 'white', lineHeight: 1.08, mb: 2.5,
            }}>
              Incredible{' '}
              <Box component="span" sx={{
                background: 'linear-gradient(135deg, #E05A1B 0%, #FFB347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                India
              </Box>
              {' '}awaits
            </Typography>

            <Typography sx={{
              color: 'rgba(255,255,255,0.58)', fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.8, mb: 5, maxWidth: 560, mx: 'auto',
            }}>
              From the snow-capped Himalayas to the golden shores of Kerala.
              Explore the map below — hover any state to see its name, click to dive in.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained" color="primary" size="large"
                startIcon={<FlightTakeoffIcon />}
                onClick={() => navigate('/itineraryPlanner')}
                sx={{ borderRadius: '999px', px: 3.5, py: 1.4, fontSize: '1rem' }}
              >
                Plan my Trip
              </Button>
              <Button
                variant="outlined" size="large"
                startIcon={<ExploreIcon />}
                onClick={() => navigate('/search')}
                sx={{
                  borderRadius: '999px', px: 3.5, py: 1.4, fontSize: '1rem',
                  borderColor: 'rgba(255,255,255,0.28)', color: 'white',
                  '&:hover': { borderColor: '#E05A1B', background: 'rgba(224,90,27,0.1)' },
                }}
              >
                Explore Places
              </Button>
            </Box>
          </Box>

          {/* Stats strip */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            {STATS.map((s, i) => (
              <Box key={i} sx={{
                width: { xs: '50%', sm: '25%' },
                py: 2.5,
                textAlign: 'center',
                // Only draw right-border between items within the same row.
                // xs: 2 cols → border after col 0 (odd index = right edge)
                // sm: 4 cols → border after cols 0,1,2
                borderRight: {
                  xs: i % 2 === 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  sm: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                },
              }}>
                <Typography sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 700, color: '#E05A1B', lineHeight: 1.1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', mt: 0.3 }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ════════════════════════════════════════
          SECTION 2 — Interactive India Map
          ════════════════════════════════════════ */}
      <Box
        sx={{
          background: '#12121F',
          py: { xs: 4, md: 4 },
          px: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Section label */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography sx={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#E05A1B', mb: 0.5,
            }}>
              Interactive Map
            </Typography>
            <Typography variant="h3" sx={{
              color: 'white', fontSize: { xs: '1.6rem', md: '2rem' },
            }}>
              Click any state to explore
            </Typography>
          </Box>

          {/* Map container — capped so heading stays in viewport */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxHeight: 700,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(224,90,27,0.18)',
              background: '#0E0E1A',
              lineHeight: 0,
            }}
          >
            {geoJson ? (
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 1400, center: [82, 22] }}
                width={1400}
                height={900}
                style={{ width: '100%', height: 'auto', display: 'block', cursor: 'default' }}
              >
                <ZoomableGroup center={[82, 22]} zoom={1}>
                  <Geographies geography={geoJson}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const name    = getStateName(geo);
                        const hovered = hoveredState === name;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={(e) => {
                              setHoveredState(name);
                              setTooltipPos({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredState(null)}
                            onClick={() => handleClick(geo)}
                            style={{
                              default: {
                                fill:        hovered ? '#E05A1B' : 'rgba(224,90,27,0.20)',
                                stroke:      hovered ? '#FFB347' : 'rgba(224,90,27,0.50)',
                                strokeWidth: hovered ? 0.8 : 0.45,
                                outline:     'none',
                              },
                              hover: {
                                fill:        '#E05A1B',
                                stroke:      '#FFB347',
                                strokeWidth: 0.8,
                                cursor:      'pointer',
                                outline:     'none',
                              },
                              pressed: {
                                fill:    '#B84814',
                                outline: 'none',
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            ) : (
              <Box sx={{
                height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
              }}>
                Loading map…
              </Box>
            )}
          </Box>

          {/* Hint */}
          <Typography sx={{
            textAlign: 'center', mt: 2,
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.04em',
          }}>
            Scroll to zoom · Click to explore
          </Typography>
        </Container>
      </Box>

      {/* State-name tooltip — rendered outside the map box so it floats freely */}
      {hoveredState && hoveredState !== 'Unknown State' && (
        <Box
          sx={{
            position: 'fixed',
            left: tooltipPos.x + 14,
            top:  tooltipPos.y + 14,
            pointerEvents: 'none',
            zIndex: 9999,
            background: 'rgba(28,28,46,0.94)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            px: 2, py: 1,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            border: '1px solid rgba(224,90,27,0.5)',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.2 }}>
            {hoveredState}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.48)', mt: 0.2 }}>
            Click to explore →
          </Typography>
        </Box>
      )}
    </Box>
  );
}
