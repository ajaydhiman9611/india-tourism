import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import './IndiaMapInteractive.scss';

const IndiaMapInteractive = () => {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch local GeoJSON file
  useEffect(() => {
    fetch('/india-osm.geojson')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load map data');
        }
        return res.json();
      })
      .then((data) => {
        console.log('GeoJSON loaded successfully:', data);
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading GeoJSON:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // State name mapping for database consistency
  const STATE_NAME_MAP = {
    'Andaman & Nicobar Island': 'Andaman and Nicobar Islands',
    'Andaman and Nicobar': 'Andaman and Nicobar Islands',
    'Arunanchal Pradesh': 'Arunachal Pradesh',
    'Chhattishgarh': 'Chhattisgarh',
    'Dadara & Nagar Havelli': 'Dadra and Nagar Haveli and Daman and Diu',
    'Daman & Diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'NCT of Delhi': 'Delhi',
    'Jammu & Kashmir': 'Jammu and Kashmir',
    'Puducherry': 'Puducherry',
    'Telengana': 'Telangana',
  };

  const getStateName = (geo) => {
    // Try different property names that might be in the GeoJSON
    return geo.properties.NAME_1 || 
           geo.properties.ST_NM || 
           geo.properties.State_Name ||
           geo.properties.name ||
           geo.properties.NAME ||
           geo.properties.state ||
           geo.properties.admin_name ||
           'Unknown State';
  };

  const handleStateClick = (geo) => {
    const stateName = getStateName(geo);
    
    // Map to consistent name
    const mappedName = STATE_NAME_MAP[stateName] || stateName;
    
    console.log('Clicked state:', stateName, '-> Mapped to:', mappedName);
    navigate(`/state/${encodeURIComponent(mappedName)}`);
  };

  const handleMouseEnter = (geo, event) => {
    const stateName = getStateName(geo);
    console.log('Hovering state:', stateName, 'Properties:', geo.properties);
    setHoveredState(stateName);
  };

  const handleMouseMove = (event) => {
    setTooltipPos({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="india-map-interactive">
        <div className="map-container loading">
          <div className="loader">
            <div className="spinner"></div>
            <p>Loading India map...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="india-map-interactive">
        <div className="map-container error">
          <div className="error-content">
            <h3>⚠️ Unable to load map</h3>
            <p>{error}</p>
            <p className="help-text">
              Please ensure <code>india-osm.geojson</code> is in your <code>public</code> folder
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data
  if (!geoJsonData) {
    return null;
  }

  return (
    <div className="india-map-interactive">
      <div className="map-container">
        {/* <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1100,
            center: [78.9629, 23.5937] // Center of India
          }}
          width={800}
          height={900}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup 
            center={[78.9629, 23.5937]} 
            zoom={1}
            minZoom={0.8}
            maxZoom={4}
          >
            <Geographies geography={geoJsonData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = getStateName(geo);
                  const isHovered = hoveredState === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(event) => handleMouseEnter(geo, event)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleStateClick(geo)}
                      style={{
                        default: {
                          fill: isHovered ? '#818cf8' : '#e0e7ff',
                          stroke: '#6366f1',
                          strokeWidth: 0.75,
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        },
                        hover: {
                          fill: '#818cf8',
                          stroke: '#4f46e5',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: {
                          fill: '#6366f1',
                          stroke: '#4338ca',
                          strokeWidth: 2,
                          outline: 'none'
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap> */}
<ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 1100 }}
      width={800}
      height={700}
      style={{ width: '100%', height: '100%' }}
    >
      <ZoomableGroup
        center={[78.9629, 23.5937]}
        zoom={1}
      >
        <Geographies geography={geoJsonData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = getStateName(geo);
              const isHovered = hoveredState === stateName;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(e) => handleMouseEnter(geo, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleStateClick(geo)}
                  style={{
                    default: {
                      fill: isHovered ? '#818cf8' : '#e0e7ff',
                      stroke: '#6366f1',
                      strokeWidth: 0.75,
                      outline: 'none'
                    },
                    hover: {
                      fill: '#818cf8',
                      stroke: '#4f46e5',
                      strokeWidth: 1.5,
                      cursor: 'pointer'
                    },
                    pressed: {
                      fill: '#6366f1',
                      stroke: '#4338ca',
                      strokeWidth: 2
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
        {/* Tooltip */}
        {hoveredState && hoveredState !== 'Unknown State' && (
          <div
            className="state-tooltip"
            style={{
              left: `${tooltipPos.x + 15}px`,
              top: `${tooltipPos.y + 15}px`
            }}
          >
            <div className="tooltip-content">
              <h4>{hoveredState}</h4>
              <p>Click to explore</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <h4>🗺️ Interactive Map of India</h4>
        <p>Hover over states and click to explore destinations</p>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color default"></span>
            <span>State</span>
          </div>
          <div className="legend-item">
            <span className="legend-color hover"></span>
            <span>Hover</span>
          </div>
          <div className="legend-item">
            <span className="legend-color active"></span>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaMapInteractive;