import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  Box, Typography, Button, TextField, Autocomplete,
  Paper, Divider, CircularProgress, Alert, IconButton
} from '@mui/material'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit'
import StraightenIcon from '@mui/icons-material/Straighten'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LocationOnIcon from '@mui/icons-material/LocationOn'

// Fix leaflet default icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const DEST_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})
const FROM_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

// Haversine straight-line distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Fits the Leaflet map to show all markers
function MapFitter({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) {
      try { map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 12 }) } catch {}
    }
  }, [positions, map])
  return null
}

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60), m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const TripDistancePlanner = ({ place }) => {
  const [open, setOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [options, setOptions] = useState([])
  const [searching, setSearching] = useState(false)
  const [fromLocation, setFromLocation] = useState(null)  // { label, lat, lon }
  const [destCoords, setDestCoords] = useState(null)       // { lat, lon }
  const [route, setRoute] = useState(null)                 // { coords, distance, duration }
  const [straightLine, setStraightLine] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  // Geocode the destination once the panel opens
  useEffect(() => {
    if (!open || destCoords) return
    const q = `${place.name}, ${place.state}, India`
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) setDestCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) })
      })
      .catch(() => {})
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced Nominatim search for user's "from" input
  const handleInputChange = useCallback((_, val) => {
    setInputVal(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val || val.length < 3) { setOptions([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ', India')}&format=json&limit=6&addressdetails=1`
        )
        const data = await r.json()
        setOptions(data.map(d => ({
          label: d.display_name,
          shortLabel: d.name || d.display_name.split(',')[0],
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
        })))
      } catch {}
      setSearching(false)
    }, 500)
  }, [])

  const handleSelectFrom = async (_, opt) => {
    if (!opt || typeof opt === 'string') return
    setFromLocation(opt)
    setError('')
    if (!destCoords) { setError('Could not locate the destination. Please try again.'); return }
    setRouteLoading(true)
    setRoute(null)
    setStraightLine(null)
    try {
      // Straight-line distance
      const sl = haversine(opt.lat, opt.lon, destCoords.lat, destCoords.lon)
      setStraightLine(sl.toFixed(1))
      // Driving route via OSRM (free, no API key)
      const osrmRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${opt.lon},${opt.lat};${destCoords.lon},${destCoords.lat}?overview=full&geometries=geojson`
      )
      const osrmData = await osrmRes.json()
      if (osrmData.code === 'Ok' && osrmData.routes?.[0]) {
        const rt = osrmData.routes[0]
        setRoute({
          coords: rt.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          distance: (rt.distance / 1000).toFixed(1),
          duration: Math.round(rt.duration / 60),
        })
      }
    } catch {
      setError('Could not fetch route. Check your internet connection.')
    }
    setRouteLoading(false)
  }

  const resetPlanner = () => {
    setFromLocation(null)
    setRoute(null)
    setStraightLine(null)
    setError('')
    setOptions([])
    setInputVal('')
  }

  const gmapsUrl = fromLocation && destCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${fromLocation.lat},${fromLocation.lon}&destination=${destCoords.lat},${destCoords.lon}&travelmode=transit`
    : null

  const gmapsDrivingUrl = fromLocation && destCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${fromLocation.lat},${fromLocation.lon}&destination=${destCoords.lat},${destCoords.lon}&travelmode=driving`
    : null

  const fromCoords = fromLocation ? [fromLocation.lat, fromLocation.lon] : null
  const toCoords = destCoords ? [destCoords.lat, destCoords.lon] : null
  const mapPositions = [fromCoords, toCoords].filter(Boolean)

  // ── Collapsed state ──────────────────────────────────────────────────────────
  if (!open) {
    return (
      <Box sx={{ my: 4 }}>
        <Button
          variant="outlined" size="large" fullWidth
          startIcon={<FlightTakeoffIcon />}
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: 3, py: 1.5,
            borderStyle: 'dashed', borderColor: 'rgba(224,90,27,0.45)', color: '#E05A1B',
            fontWeight: 600, fontSize: '0.98rem',
            '&:hover': { borderStyle: 'solid', borderColor: '#E05A1B', background: 'rgba(224,90,27,0.04)' },
          }}
        >
          How far is {place.name}? Plan your journey
        </Button>
      </Box>
    )
  }

  // ── Expanded state ───────────────────────────────────────────────────────────
  return (
    <Paper elevation={0} sx={{ my: 4, border: '1px solid rgba(224,90,27,0.2)', borderRadius: 3, overflow: 'hidden' }}>

      {/* Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(224,90,27,0.04)', borderBottom: '1px solid rgba(224,90,27,0.12)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlightTakeoffIcon sx={{ color: '#E05A1B', fontSize: 20 }} />
          <Typography fontWeight={700} fontSize="1rem">
            Journey Planner — {place.name}
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => { setOpen(false); resetPlanner() }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>

        {/* Origin search */}
        <Autocomplete
          freeSolo
          options={options}
          inputValue={inputVal}
          getOptionLabel={o => (typeof o === 'string' ? o : o.shortLabel)}
          onInputChange={handleInputChange}
          onChange={handleSelectFrom}
          loading={searching}
          filterOptions={x => x}
          renderOption={(props, opt) => (
            <li {...props} key={opt.label}>
              <Box>
                <Typography fontSize="0.9rem" fontWeight={600}>{opt.shortLabel}</Typography>
                <Typography fontSize="0.75rem" color="text.secondary" noWrap>{opt.label}</Typography>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Travelling from"
              placeholder="Type a city, town or area in India…"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                    <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                ),
                endAdornment: searching
                  ? <CircularProgress size={18} sx={{ mr: 1 }} />
                  : params.InputProps.endAdornment,
              }}
            />
          )}
        />

        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Route loading */}
        {routeLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 3, color: 'text.secondary' }}>
            <CircularProgress size={20} />
            <Typography fontSize="0.9rem">Calculating route…</Typography>
          </Box>
        )}

        {/* Results */}
        {fromCoords && toCoords && !routeLoading && (
          <Box sx={{ mt: 3 }}>

            {/* Stat cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              {route && (
                <Paper elevation={1} sx={{ px: 2.5, py: 1.5, borderRadius: 2, flex: '1 1 130px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                    <DirectionsCarIcon sx={{ color: '#E05A1B', fontSize: 17 }} />
                    <Typography fontSize="0.75rem" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">By Road</Typography>
                  </Box>
                  <Typography fontWeight={700} fontSize="1.25rem" lineHeight={1}>{route.distance} km</Typography>
                  <Typography fontSize="0.85rem" color="text.secondary" mt={0.3}>{formatDuration(route.duration)} driving</Typography>
                  {gmapsDrivingUrl && (
                    <Button href={gmapsDrivingUrl} target="_blank" rel="noopener noreferrer"
                      size="small" endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                      sx={{ textTransform: 'none', color: '#E05A1B', p: 0, mt: 0.5, fontSize: '0.78rem', minWidth: 0, fontWeight: 600 }}>
                      Open directions
                    </Button>
                  )}
                </Paper>
              )}
              {straightLine && (
                <Paper elevation={1} sx={{ px: 2.5, py: 1.5, borderRadius: 2, flex: '1 1 130px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                    <StraightenIcon sx={{ color: '#E05A1B', fontSize: 17 }} />
                    <Typography fontSize="0.75rem" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">Straight Line</Typography>
                  </Box>
                  <Typography fontWeight={700} fontSize="1.25rem" lineHeight={1}>{straightLine} km</Typography>
                  <Typography fontSize="0.85rem" color="text.secondary" mt={0.3}>as the crow flies</Typography>
                </Paper>
              )}
              {gmapsUrl && (
                <Paper elevation={1} sx={{ px: 2.5, py: 1.5, borderRadius: 2, flex: '1 1 130px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                    <DirectionsTransitIcon sx={{ color: '#E05A1B', fontSize: 17 }} />
                    <Typography fontSize="0.75rem" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">Public Transit</Typography>
                  </Box>
                  <Typography fontSize="0.82rem" color="text.secondary" mb={0.5}>Trains, buses & metro</Typography>
                  <Button href={gmapsUrl} target="_blank" rel="noopener noreferrer"
                    size="small" endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                    sx={{ textTransform: 'none', color: '#E05A1B', p: 0, fontSize: '0.78rem', minWidth: 0, fontWeight: 600 }}>
                    View in Google Maps
                  </Button>
                </Paper>
              )}
            </Box>

            {/* Leaflet Map */}
            <Box sx={{ height: { xs: 260, sm: 340 }, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              <MapContainer
                center={toCoords || [20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                zoomControl
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={fromCoords} icon={FROM_ICON}>
                  <Popup><b>From:</b> {fromLocation?.shortLabel}</Popup>
                </Marker>
                <Marker position={toCoords} icon={DEST_ICON}>
                  <Popup><b>To:</b> {place.name}</Popup>
                </Marker>
                {route?.coords
                  ? <Polyline positions={route.coords} color="#E05A1B" weight={3} opacity={0.85} />
                  : <Polyline positions={[fromCoords, toCoords]} color="#E05A1B" weight={2} opacity={0.55} dashArray="8" />
                }
                <MapFitter positions={mapPositions} />
              </MapContainer>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default TripDistancePlanner
