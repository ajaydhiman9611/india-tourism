import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  Box, Container, TextField, InputAdornment, CircularProgress,
  Typography, Card, CardMedia, CardContent, Grid, Paper, alpha, Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PlaceIcon from '@mui/icons-material/Place'
import { constants } from '../../helpers/constants'

let debounceTimer = null

const SearchPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initial = searchParams.get('q') || ''

  const [query, setQuery] = useState(initial)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchError, setSearchError] = useState('')

  const doSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); setSearched(false); setSearchError(''); return }
    setLoading(true)
    setSearchError('')
    axios.get(`${constants.API_URL}/search?q=${encodeURIComponent(q)}`)
      .then(res => { setResults(res.data.data?.places || []); setSearched(true) })
      .catch(err => {
        console.error(err)
        setSearchError(err.response?.data?.message || 'Search failed. Please try again.')
        setSearched(false)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (initial) doSearch(initial) }, [initial, doSearch])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doSearch(val), 420)
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 68px)' }}>

      {/* ── Search hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B4E 100%)',
        py: { xs: 6, md: 9 },
        mb: 5,
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography className="section-label" sx={{ color: '#FFB347', mb: 1 }}>
            Discover India
          </Typography>
          <Typography variant="h2" sx={{ color: 'white', fontSize: { xs: '2rem', md: '2.8rem' }, mb: 4 }}>
            Find your next destination
          </Typography>
          <Paper
            elevation={4}
            sx={{
              display: 'flex', alignItems: 'center',
              borderRadius: '999px', px: 2.5, py: 0.5,
              border: '1px solid rgba(224,90,27,0.2)',
            }}
          >
            <InputAdornment position="start" sx={{ mr: 1 }}>
              {loading
                ? <CircularProgress size={20} color="primary" />
                : <SearchIcon sx={{ color: 'text.secondary' }} />
              }
            </InputAdornment>
            <TextField
              fullWidth variant="standard"
              placeholder="Search places, states, attractions…"
              value={query}
              onChange={handleChange}
              InputProps={{ disableUnderline: true, sx: { fontSize: '1.1rem', py: 0.5 } }}
            />
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8, px: { xs: 2, sm: 3 } }}>
        {searchError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSearchError('')}>
            {searchError}
          </Alert>
        )}
        {!searched && !loading && !searchError && (

          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <SearchIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
            <Typography variant="h6" color="text.secondary">
              Start typing to search across all Indian destinations
            </Typography>
          </Box>
        )}

        {searched && results.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No places found for "<strong>{query}</strong>"
            </Typography>
            <Typography variant="body2" color="text.disabled" mt={1}>
              Try a different keyword or browse states on the home page.
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"
            </Typography>
            <Grid container spacing={3}>
              {results.map(place => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={place._id}>
                  <Card
                    onClick={() => navigate(`/place/${place._id}`)}
                    sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    {place.thumbImage ? (
                      <CardMedia
                        component="img"
                        height="180"
                        image={place.thumbImage}
                        alt={place.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{
                        height: 180,
                        background: `linear-gradient(135deg, ${alpha('#E05A1B', 0.15)}, ${alpha('#1B7A3E', 0.15)})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <PlaceIcon sx={{ fontSize: 48, color: alpha('#E05A1B', 0.3) }} />
                      </Box>
                    )}
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: '1rem' }}>
                        {place.name}
                      </Typography>
                      {place.state && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <PlaceIcon sx={{ fontSize: 13, color: '#E05A1B' }} />
                          <Typography variant="caption" color="text.secondary">{place.state}</Typography>
                        </Box>
                      )}
                      <Typography variant="body2" color="text.secondary"
                        sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {place.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  )
}

export default SearchPage
