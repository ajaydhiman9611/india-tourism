import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    Box, Typography, Chip, CircularProgress, Paper, Grid,
    Button, Rating, TextField, Divider, Alert, IconButton,
    Card, CardMedia
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import DeleteIcon from '@mui/icons-material/Delete'
import { constants } from '../../helpers/constants'
import { useAuth } from '../../context/AuthContext'

const PlaceDetail = () => {
    const { placeId } = useParams()
    const navigate = useNavigate()
    const { user, authHeader } = useAuth()

    const [place, setPlace] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImg, setSelectedImg] = useState(null)
    const [isSaved, setIsSaved] = useState(false)

    const [reviews, setReviews] = useState([])
    const [avgRating, setAvgRating] = useState(null)
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
    const [reviewError, setReviewError] = useState('')
    const [reviewLoading, setReviewLoading] = useState(false)

    useEffect(() => {
        axios.get(`${constants.API_URL}/places/${placeId}`)
            .then(res => {
                const data = res.data.data
                setPlace(data)
                setReviews(data.reviews || [])
                setAvgRating(data.avgRating)
                setSelectedImg(data.thumbImage || (data.images && data.images[0]))
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [placeId])

    useEffect(() => {
        if (user?.savedPlaces) {
            setIsSaved(user.savedPlaces.some(p => (p._id || p) === placeId))
        }
    }, [user, placeId])

    const handleSaveToggle = async () => {
        if (!user) { navigate('/login'); return }
        try {
            const res = await axios.post(`${constants.API_URL}/auth/save-place/${placeId}`, {}, { headers: authHeader() })
            setIsSaved(res.data.data.saved)
        } catch (err) {
            console.error(err)
        }
    }

    const submitReview = async (e) => {
        e.preventDefault()
        if (!user) { navigate('/login'); return }
        if (!reviewForm.rating || !reviewForm.comment.trim()) {
            setReviewError('Please provide a rating and comment.')
            return
        }
        setReviewLoading(true)
        setReviewError('')
        try {
            const res = await axios.post(
                `${constants.API_URL}/reviews/${placeId}`,
                reviewForm,
                { headers: authHeader() }
            )
            const newReview = res.data.data
            setReviews(prev => {
                const filtered = prev.filter(r => r._id !== newReview._id)
                return [newReview, ...filtered]
            })
            const all = [newReview, ...reviews.filter(r => r._id !== newReview._id)]
            setAvgRating(all.reduce((s, r) => s + r.rating, 0) / all.length)
            setReviewForm({ rating: 0, comment: '' })
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review')
        } finally {
            setReviewLoading(false)
        }
    }

    const deleteReview = async (reviewId) => {
        try {
            await axios.delete(`${constants.API_URL}/reviews/${reviewId}`, { headers: authHeader() })
            const updated = reviews.filter(r => r._id !== reviewId)
            setReviews(updated)
            setAvgRating(updated.length ? updated.reduce((s, r) => s + r.rating, 0) / updated.length : null)
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
    if (!place) return <Typography>Place not found.</Typography>

    const allImages = [place.thumbImage, ...(place.images || [])].filter(Boolean)

    return (
        <Box pb={6}>
            {/* Hero image */}
            <Box position="relative" mb={2}>
                <Box
                    component="img"
                    src={selectedImg || place.thumbImage}
                    alt={place.name}
                    sx={{ width: '100%', height: 420, objectFit: 'cover', borderRadius: 2 }}
                    onError={e => { e.target.style.display = 'none' }}
                />
                <IconButton
                    onClick={handleSaveToggle}
                    sx={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.85)' }}
                >
                    {isSaved ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
            </Box>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
                <Box display="flex" gap={1} mb={3} overflow="auto">
                    {allImages.map((img, i) => (
                        <Card
                            key={i}
                            onClick={() => setSelectedImg(img)}
                            sx={{
                                flexShrink: 0, cursor: 'pointer',
                                border: selectedImg === img ? '2px solid #1976d2' : '2px solid transparent',
                                borderRadius: 1
                            }}
                        >
                            <CardMedia component="img" image={img} alt="" sx={{ width: 80, height: 60, objectFit: 'cover' }} />
                        </Card>
                    ))}
                </Box>
            )}

            {/* Title + actions */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>{place.name}</Typography>
                    {place.state && <Typography color="text.secondary">{place.state}</Typography>}
                </Box>
                {avgRating && (
                    <Box textAlign="center">
                        <Rating value={avgRating} precision={0.5} readOnly />
                        <Typography variant="body2">{avgRating.toFixed(1)} ({reviews.length} reviews)</Typography>
                    </Box>
                )}
            </Box>

            <Typography variant="body1" mb={3}>{place.desc}</Typography>

            {/* Info chips */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                {place.bestTimeToVisit && (
                    <Chip icon={<WbSunnyIcon />} label={`Best time: ${place.bestTimeToVisit}`} color="warning" variant="outlined" />
                )}
                {place.openingHours && (
                    <Chip icon={<AccessTimeIcon />} label={place.openingHours} variant="outlined" />
                )}
                {place.entryFee && (
                    <Chip icon={<AttachMoneyIcon />} label={`Entry: ${place.entryFee}`} variant="outlined" />
                )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Reviews */}
            <Typography variant="h5" fontWeight={600} mb={2}>Reviews</Typography>

            {/* Submit review form */}
            <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
                <Typography variant="h6" mb={2}>{user ? 'Write a Review' : 'Sign in to write a review'}</Typography>
                {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
                <form onSubmit={submitReview}>
                    <Box mb={2}>
                        <Typography component="legend" variant="body2" gutterBottom>Your Rating</Typography>
                        <Rating
                            value={reviewForm.rating}
                            onChange={(_, val) => setReviewForm(f => ({ ...f, rating: val }))}
                            disabled={!user}
                        />
                    </Box>
                    <TextField
                        fullWidth multiline rows={3}
                        label="Comment"
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        disabled={!user}
                        sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" disabled={!user || reviewLoading}>
                        {reviewLoading ? 'Submitting…' : 'Submit Review'}
                    </Button>
                    {!user && (
                        <Button variant="text" sx={{ ml: 2 }} onClick={() => navigate('/login')}>Sign In</Button>
                    )}
                </form>
            </Paper>

            {reviews.length === 0 && (
                <Typography color="text.secondary">No reviews yet. Be the first!</Typography>
            )}

            <Grid container spacing={2}>
                {reviews.map(review => (
                    <Grid item xs={12} sm={6} key={review._id}>
                        <Paper sx={{ p: 2 }} elevation={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography fontWeight={600}>{review.user?.name || 'User'}</Typography>
                                    <Rating value={review.rating} readOnly size="small" />
                                </Box>
                                {user && (user.id === review.user?._id || user.isAdmin) && (
                                    <IconButton size="small" onClick={() => deleteReview(review._id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                            <Typography variant="body2" mt={1}>{review.comment}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default PlaceDetail
