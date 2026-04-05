import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Box, Container, Typography, Chip, Grid, Paper,
  Button, Rating, TextField, Divider, Alert,
  IconButton, Skeleton, Avatar, alpha,
  Modal, Fade, Backdrop
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StarIcon from '@mui/icons-material/Star'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { constants } from '../../helpers/constants'
import { useAuth } from '../../context/AuthContext'
import TripDistancePlanner from './TripDistancePlanner'

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
  const [saveToggleLoading, setSaveToggleLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  useEffect(() => {
    axios.get(`${constants.API_URL}/places/${placeId}`)
      .then(res => {
        const d = res.data.data
        setPlace(d)
        setReviews(d.reviews || [])
        setAvgRating(d.avgRating)
        setSelectedImg(d.thumbImage || d.images?.[0])
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
    setSaveToggleLoading(true)
    setSaveError('')
    try {
      const res = await axios.post(
        `${constants.API_URL}/auth/save-place/${placeId}`, {},
        { headers: authHeader() }
      )
      setIsSaved(res.data.data.saved)
    } catch (err) {
      console.error(err)
      setSaveError(err.response?.data?.message || 'Could not update saved status. Please try again.')
    } finally {
      setSaveToggleLoading(false)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!reviewForm.rating || !reviewForm.comment.trim()) {
      setReviewError('Please provide a rating and a comment.')
      return
    }
    setReviewLoading(true); setReviewError('')
    try {
      const res = await axios.post(
        `${constants.API_URL}/reviews/${placeId}`, reviewForm,
        { headers: authHeader() }
      )
      const nr = res.data.data
      setReviews(prev => {
        const filtered = prev.filter(r => r._id !== nr._id)
        return [nr, ...filtered]
      })
      const all = [nr, ...reviews.filter(r => r._id !== nr._id)]
      setAvgRating(all.reduce((s, r) => s + r.rating, 0) / all.length)
      setReviewForm({ rating: 0, comment: '' })
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit')
    } finally { setReviewLoading(false) }
  }

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(`${constants.API_URL}/reviews/${reviewId}`, { headers: authHeader() })
      const updated = reviews.filter(r => r._id !== reviewId)
      setReviews(updated)
      setAvgRating(updated.length ? updated.reduce((s, r) => s + r.rating, 0) / updated.length : null)
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <Box>
      <Skeleton variant="rectangular" height={480} />
      <Container sx={{ mt: 4 }}>
        <Skeleton height={40} width="60%" />
        <Skeleton height={100} />
      </Container>
    </Box>
  )

  if (!place) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Typography color="text.secondary">Place not found.</Typography>
    </Box>
  )

  const allImages = [place.thumbImage, ...(place.images || [])].filter(Boolean)

  return (
    <Box sx={{ bgcolor: 'background.default', pb: 8 }}>

      {/* ── Hero image ── */}
      <Box sx={{ position: 'relative', height: { xs: 300, md: 480 }, background: '#1C1C2E', overflow: 'hidden' }}>
        <Box
          component="img"
          src={selectedImg || place.thumbImage}
          alt={place.name}
          onClick={() => { setLightboxIdx(allImages.indexOf(selectedImg)); setLightboxOpen(true) }}
          sx={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: 0.8, display: 'block', cursor: 'pointer',
          }}
          onError={e => { e.target.style.opacity = 0 }}
        />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(28,28,46,0.85) 0%, transparent 60%)',
        }} />

        {/* Back button */}
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(0,0,0,0.45)', color: 'white',
            backdropFilter: 'blur(8px)',
            '&:hover': { background: 'rgba(0,0,0,0.65)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Save button */}
        <IconButton
          onClick={handleSaveToggle}
          disabled={saveToggleLoading}
          sx={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.45)', color: isSaved ? '#E05A1B' : 'white',
            backdropFilter: 'blur(8px)',
            '&:hover': { background: 'rgba(0,0,0,0.65)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.3)' },
          }}
        >
          {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>

        {/* Title overlay */}
        <Container maxWidth="xl" sx={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          pb: 4,
        }}>
          <Typography variant="h2" sx={{ color: 'white', fontSize: { xs: '2rem', md: '2.8rem' } }}>
            {place.name}
          </Typography>
          {place.state && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#E05A1B' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{place.state}</Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Thumbnail strip ── */}
      {allImages.length > 1 && (
        <Box sx={{ background: '#1C1C2E', py: 1.5 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
              {allImages.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => {
                    setSelectedImg(img)
                    setLightboxIdx(i)
                    setLightboxOpen(true)
                  }}
                  sx={{
                    flexShrink: 0, cursor: 'pointer',
                    borderRadius: 1.5, overflow: 'hidden',
                    border: `2px solid ${selectedImg === img ? '#E05A1B' : 'transparent'}`,
                    transition: 'border-color 0.2s ease',
                    opacity: selectedImg === img ? 1 : 0.65,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <Box component="img" src={img} alt="" sx={{ width: 80, height: 56, objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 5 }, px: { xs: 1.5, sm: 3 } }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>

          {/* ── Left column ── */}
          <Grid item xs={12} md={8}>
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>{saveError}</Alert>
            )}

            {/* Rating + description */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>{place.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, maxWidth: 680 }}>
                  {place.desc}
                </Typography>
              </Box>
              {avgRating && (
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', minWidth: 110, borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#E05A1B', lineHeight: 1 }}>
                    {avgRating.toFixed(1)}
                  </Typography>
                  <Rating value={avgRating} precision={0.5} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Info chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
              {place.bestTimeToVisit && (
                <Chip icon={<WbSunnyIcon />} label={`Best time: ${place.bestTimeToVisit}`}
                  sx={{ background: alpha('#E05A1B', 0.1), color: '#E05A1B', fontWeight: 600, border: `1px solid ${alpha('#E05A1B', 0.25)}` }} />
              )}
              {place.openingHours && (
                <Chip icon={<AccessTimeIcon />} label={place.openingHours} variant="outlined" />
              )}
              {place.entryFee && (
                <Chip icon={<AttachMoneyIcon />} label={`Entry: ${place.entryFee}`} variant="outlined" />
              )}
              {place.isFeatured && (
                <Chip icon={<StarIcon />} label="Featured" color="secondary" />
              )}
            </Box>

            {/* Trip Distance Planner */}
            <TripDistancePlanner place={place} />

            <Divider sx={{ mb: 4 }} />

            {/* Reviews section */}
            <Typography variant="h4" gutterBottom>Reviews</Typography>

            {/* Write review */}
            <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid rgba(224,90,27,0.12)' }}>
              <Typography variant="h6" gutterBottom>
                {user ? 'Share your experience' : 'Sign in to write a review'}
              </Typography>
              {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
              <form onSubmit={submitReview}>
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Rating
                  </Typography>
                  <Rating
                    value={reviewForm.rating}
                    onChange={(_, v) => setReviewForm(f => ({ ...f, rating: v }))}
                    disabled={!user}
                    size="large"
                  />
                </Box>
                <TextField
                  fullWidth multiline rows={3}
                  placeholder="Tell others about your experience…"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  disabled={!user}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained" color="primary" disabled={!user || reviewLoading}>
                    {reviewLoading ? 'Submitting…' : 'Submit Review'}
                  </Button>
                  {!user && (
                    <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  )}
                </Box>
              </form>
            </Paper>

            {reviews.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No reviews yet — be the first!
              </Typography>
            )}

            <Grid container spacing={2}>
              {reviews.map(review => (
                <Grid item xs={12} sm={6} key={review._id}>
                  <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#E05A1B', 0.15), color: '#E05A1B', fontSize: '0.9rem', fontWeight: 700 }}>
                          {review.user?.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} fontSize="0.9rem">{review.user?.name || 'User'}</Typography>
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                      </Box>
                      {user && (user.id === review.user?._id || user.isAdmin) && (
                        <IconButton size="small" onClick={() => deleteReview(review._id)} sx={{ color: 'text.secondary' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block" mt={1}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* ── Right sidebar ── */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: 'sticky' }, top: 88 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Quick Info</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: 'State', value: place.state },
                  { label: 'Best Time', value: place.bestTimeToVisit },
                  { label: 'Entry Fee', value: place.entryFee },
                  { label: 'Hours', value: place.openingHours },
                ].filter(i => i.value).map(item => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                  </Box>
                ))}
              </Paper>

              <Button
                variant="contained" color="primary" fullWidth size="large"
                onClick={handleSaveToggle}
                disabled={saveToggleLoading}
                startIcon={isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {saveToggleLoading ? 'Updating…' : isSaved ? 'Saved to Favourites' : 'Save to Favourites'}
              </Button>

              <Button
                variant="outlined" color="secondary" fullWidth size="large"
                onClick={() => navigate('/itineraryPlanner')}
                sx={{ borderRadius: 2 }}
              >
                Plan a Trip Here
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Container>

      {/* Lightbox */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.92)' } } }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}
      >
        <Fade in={lightboxOpen}>
          <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', outline: 'none' }}>
            {/* Close */}
            <IconButton onClick={() => setLightboxOpen(false)}
              sx={{ position: 'absolute', top: -44, right: 0, color: 'white', zIndex: 1 }}>
              <CloseIcon />
            </IconButton>
            {/* Counter */}
            <Typography sx={{ position: 'absolute', top: -40, left: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              {lightboxIdx + 1} / {allImages.length}
            </Typography>
            {/* Image */}
            <Box component="img"
              src={allImages[lightboxIdx]}
              alt=""
              sx={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 1, display: 'block' }}
            />
            {/* Prev */}
            {allImages.length > 1 && (
              <IconButton onClick={() => setLightboxIdx(i => (i - 1 + allImages.length) % allImages.length)}
                sx={{ position: 'absolute', left: -56, top: '50%', transform: 'translateY(-50%)', color: 'white',
                  background: 'rgba(255,255,255,0.1)', '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
                <ArrowBackIosNewIcon />
              </IconButton>
            )}
            {/* Next */}
            {allImages.length > 1 && (
              <IconButton onClick={() => setLightboxIdx(i => (i + 1) % allImages.length)}
                sx={{ position: 'absolute', right: -56, top: '50%', transform: 'translateY(-50%)', color: 'white',
                  background: 'rgba(255,255,255,0.1)', '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
                <ArrowForwardIosIcon />
              </IconButton>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  )
}

export default PlaceDetail
