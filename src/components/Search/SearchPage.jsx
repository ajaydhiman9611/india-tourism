import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    Box, TextField, InputAdornment, CircularProgress, Typography,
    Card, CardContent, CardMedia, Grid, Chip, Paper
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { constants } from '../../helpers/constants'

let debounceTimer = null

const SearchPage = () => {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const doSearch = useCallback((q) => {
        if (!q.trim()) { setResults([]); setSearched(false); return }
        setLoading(true)
        axios.get(`${constants.API_URL}/search?q=${encodeURIComponent(q)}`)
            .then(res => { setResults(res.data.data?.places || []); setSearched(true) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleChange = (e) => {
        const val = e.target.value
        setQuery(val)
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => doSearch(val), 400)
    }

    return (
        <Box>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" fontWeight={700} mb={2}>Search Places</Typography>
                <TextField
                    fullWidth
                    placeholder="Search by name, state, or description…"
                    value={query}
                    onChange={handleChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                            </InputAdornment>
                        )
                    }}
                />
            </Paper>

            {searched && results.length === 0 && (
                <Typography color="text.secondary" textAlign="center">No places found for "{query}"</Typography>
            )}

            <Grid container spacing={2}>
                {results.map(place => (
                    <Grid item xs={12} sm={6} md={4} key={place._id}>
                        <Card
                            sx={{ cursor: 'pointer', height: '100%', '&:hover': { boxShadow: 6 } }}
                            onClick={() => navigate(`/place/${place._id}`)}
                        >
                            {place.thumbImage && (
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={place.thumbImage}
                                    alt={place.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6" fontWeight={600}>{place.name}</Typography>
                                {place.state && (
                                    <Typography variant="body2" color="text.secondary" mb={1}>{place.state}</Typography>
                                )}
                                <Typography variant="body2" noWrap>{place.desc}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default SearchPage
