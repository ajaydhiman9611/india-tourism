import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog, DialogTitle, DialogContent, IconButton, List, ListItemButton,
  ListItemText, ListItemSecondaryAction, Typography, Box, Divider,
  CircularProgress, Tooltip, Button, Tabs, Tab
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import MapIcon from '@mui/icons-material/Map'
import FavoriteIcon from '@mui/icons-material/Favorite'
import axios from 'axios'
import { constants } from '../../helpers/constants'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const PAGE_LIMIT = 10

const MyItinerariesDialog = ({ open, onClose }) => {
  const { authHeader, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab,    setActiveTab]    = useState(0)
  const [itineraries, setItineraries] = useState([])
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState('')

  // ── Fetch a page of itineraries ──────────────────────────────────────────────
  const fetchPage = useCallback(async (pageNum, append = false) => {
    const setter = append ? setLoadingMore : setLoading
    setter(true)
    setError('')
    try {
      const res = await axios.get(
        `${constants.API_URL}/itineraries/my?page=${pageNum}&limit=${PAGE_LIMIT}`,
        { headers: authHeader() }
      )
      const { itineraries: items, hasMore: more } = res.data.data
      setItineraries(prev => append ? [...prev, ...items] : items)
      setHasMore(more)
      setPage(pageNum)
    } catch {
      setError('Could not load itineraries. Please try again.')
    } finally {
      setter(false)
    }
  }, [authHeader]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset + fetch page 1 every time the dialog opens
  useEffect(() => {
    if (!open) return
    setItineraries([])
    setPage(1)
    setHasMore(false)
    fetchPage(1, false)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => fetchPage(page + 1, true)

  const openItinerary = (shareToken) => {
    window.open(`/itinerary/${shareToken}`, '_blank', 'noopener,noreferrer')
  }

  const handleClose = () => {
    setActiveTab(0)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <MapIcon sx={{ color: '#E05A1B' }} />
        My Saved Itineraries
        <IconButton onClick={handleClose} size="small" sx={{ ml: 'auto' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0, minHeight: 200 }}>
        {/* Tab switcher */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab
            label="My Itineraries"
            icon={<MapIcon />}
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
          <Tab
            label="Saved Places"
            icon={<FavoriteIcon />}
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
        </Tabs>

        {/* ── Tab 0: Itineraries ── */}
        {activeTab === 0 && (
          <>
            {/* Initial load spinner */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && error && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" mb={1}>{error}</Typography>
                <Button size="small" onClick={() => fetchPage(1, false)}>Retry</Button>
              </Box>
            )}

            {!loading && !error && itineraries.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" mb={1}>No saved itineraries yet.</Typography>
                <Typography variant="caption" color="text.disabled">
                  Plan a trip and save your itinerary to see it here.
                </Typography>
              </Box>
            )}

            {!loading && !error && itineraries.length > 0 && (
              <>
                <List disablePadding>
                  {itineraries.map((it, idx) => (
                    <React.Fragment key={it._id || it.shareToken}>
                      {idx > 0 && <Divider component="li" />}
                      <ListItemButton
                        onClick={() => openItinerary(it.shareToken)}
                        sx={{ py: 1.5, px: 3, '&:hover .open-icon': { opacity: 1 } }}
                      >
                        <ListItemText
                          primary={
                            <Typography fontWeight={600} fontSize="0.95rem" noWrap>
                              {it.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Saved on {formatDate(it.createdAt)}
                              {it.promptDetails?.daysOfItinerary &&
                                ` · ${it.promptDetails.daysOfItinerary} days`}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Open in new tab">
                            <IconButton
                              size="small"
                              className="open-icon"
                              onClick={(e) => { e.stopPropagation(); openItinerary(it.shareToken) }}
                              sx={{ opacity: 0.5, transition: 'opacity 0.2s', color: '#E05A1B' }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    </React.Fragment>
                  ))}
                </List>

                {/* Load more */}
                {hasMore && (
                  <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      startIcon={loadingMore ? <CircularProgress size={14} color="inherit" /> : null}
                      sx={{ textTransform: 'none', color: '#E05A1B' }}
                    >
                      {loadingMore ? 'Loading…' : 'Load more'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* ── Tab 1: Saved Places ── */}
        {activeTab === 1 && (
          <>
            {(!user?.savedPlaces || user.savedPlaces.length === 0) ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No saved places yet.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {user.savedPlaces.map((place, idx) => (
                  <React.Fragment key={place._id}>
                    {idx > 0 && <Divider component="li" />}
                    <ListItemButton
                      onClick={() => { navigate(`/place/${place._id}`); handleClose() }}
                      sx={{ py: 1.5, px: 3 }}
                    >
                      <Box
                        component="img"
                        src={place.thumbImage}
                        alt={place.name}
                        sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, mr: 2, flexShrink: 0 }}
                      />
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} fontSize="0.95rem" noWrap>
                            {place.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {place.state}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <FavoriteIcon sx={{ color: '#E05A1B', fontSize: 20 }} />
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MyItinerariesDialog
