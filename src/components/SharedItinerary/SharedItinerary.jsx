import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Box, Container, Typography, CircularProgress, Paper, Chip,
  Button, Divider
} from '@mui/material'
import DOMPurify from 'dompurify'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import { constants } from '../../helpers/constants'

const SharedItinerary = () => {
  const { shareToken } = useParams()
  const navigate = useNavigate()
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`${constants.API_URL}/itineraries/shared/${shareToken}`)
      .then(res => setItinerary(res.data.data))
      .catch(() => setError('Itinerary not found or this link has expired.'))
      .finally(() => setLoading(false))
  }, [shareToken])

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress color="primary" />
    </Box>
  )

  if (error) return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
      <Typography variant="h6" color="text.secondary">{error}</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>Go Home</Button>
    </Box>
  )

  const cleanHtml = DOMPurify.sanitize(
    (itinerary.htmlContent || '')
      .replace(/^```html\s*\n/i, '').replace(/\n\s*```$/, '').trim()
  )

  return (
    <Box sx={{ bgcolor: 'background.default', pb: 8 }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B4E 100%)',
        py: { xs: 6, md: 8 }, mb: 5,
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <AutoAwesomeIcon sx={{ color: '#E05A1B', fontSize: 36, mb: 1 }} />
          <Typography variant="h3" sx={{ color: 'white', fontSize: { xs: '1.8rem', md: '2.4rem' }, mb: 2 }}>
            {itinerary.title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            {itinerary.promptDetails?.selectedStates?.map(s => (
              <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
            ))}
            {itinerary.promptDetails?.monthOfVisit && (
              <Chip label={itinerary.promptDetails.monthOfVisit} size="small" sx={{ bgcolor: 'rgba(224,90,27,0.2)', color: '#FFB347', border: '1px solid rgba(224,90,27,0.3)' }} />
            )}
            {itinerary.promptDetails?.tripType && (
              <Chip label={itinerary.promptDetails.tripType} size="small" sx={{ bgcolor: 'rgba(27,122,62,0.2)', color: '#5AE68A', border: '1px solid rgba(27,122,62,0.3)' }} />
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #1B7A3E, #2DA357)',
            px: { xs: 2.5, md: 4 }, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5
          }}>
            <AutoAwesomeIcon sx={{ color: 'white' }} />
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
              AI-Generated Itinerary
            </Typography>
          </Box>
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Box className="itinerary-html-output" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
          </Box>
          <Divider />
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="primary" startIcon={<FlightTakeoffIcon />}
              onClick={() => navigate('/itineraryPlanner')}>
              Plan Your Own Trip
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Explore India
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default SharedItinerary
