import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box, Typography, CircularProgress, Paper, Chip } from '@mui/material'
import DOMPurify from 'dompurify'
import { constants } from '../../helpers/constants'

const SharedItinerary = () => {
    const { shareToken } = useParams()
    const [itinerary, setItinerary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        axios.get(`${constants.API_URL}/itineraries/shared/${shareToken}`)
            .then(res => setItinerary(res.data.data))
            .catch(() => setError('Itinerary not found or link is invalid.'))
            .finally(() => setLoading(false))
    }, [shareToken])

    if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
    if (error) return <Typography color="error" textAlign="center" mt={4}>{error}</Typography>

    const cleanHtml = DOMPurify.sanitize(
        (itinerary.htmlContent || '')
            .replace(/^```html\s*\n/i, '')
            .replace(/\n\s*```$/, '')
            .trim()
    )

    return (
        <Box pb={6}>
            <Paper sx={{ p: 4 }} elevation={2}>
                <Typography variant="h4" fontWeight={700} mb={1}>{itinerary.title}</Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                    {itinerary.promptDetails?.selectedStates?.map(s => (
                        <Chip key={s} label={s} size="small" />
                    ))}
                    {itinerary.promptDetails?.monthOfVisit && (
                        <Chip label={itinerary.promptDetails.monthOfVisit} size="small" color="primary" variant="outlined" />
                    )}
                    {itinerary.promptDetails?.tripType && (
                        <Chip label={itinerary.promptDetails.tripType} size="small" color="secondary" variant="outlined" />
                    )}
                </Box>
                <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
            </Paper>
        </Box>
    )
}

export default SharedItinerary
