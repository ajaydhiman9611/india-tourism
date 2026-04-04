import React, { useRef, useState, useEffect } from 'react';
import {
  Box, Container, Grid, TextField, Button, Paper, Typography,
  FormControl, InputLabel, Select, MenuItem, Autocomplete,
  Snackbar, Alert, Tooltip, Divider, Chip, alpha, Skeleton,
  Fade, LinearProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DOMPurify from 'dompurify';
import apicalls from '../helpers/apicalls';
import axios from 'axios';
import { constants } from '../helpers/constants';
import { useAuth } from '../context/AuthContext';

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
].sort();

const TRIP_TYPES = [
  'Adventure','Backpacking','Business','Cultural','Family Getaway',
  'Honeymoon','Leisure/Vacation','Nature & Wildlife','Office Team Outing',
  'Roadtrip','Spa & Wellness'
].sort();

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// Skeleton shown while the AI is generating
const ItinerarySkeleton = () => (
  <Box sx={{ p: { xs: 3, md: 5 } }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5, gap: 1.5 }}>
      <AutoAwesomeIcon sx={{ fontSize: 40, color: alpha('#E05A1B', 0.4), animation: 'pulse 1.6s ease-in-out infinite' }} />
      <Typography variant="h6" color="text.secondary" fontWeight={500}>
        AI is crafting your personalised itinerary…
      </Typography>
      <Typography variant="caption" color="text.disabled">
        This may take 20–60 seconds
      </Typography>
    </Box>
    {[80, 55, 90, 45, 70, 60].map((w, i) => (
      <Skeleton key={i} height={i % 3 === 0 ? 28 : 18} width={`${w}%`} sx={{ mb: 1, borderRadius: 1 }} />
    ))}
    <Skeleton height={18} width="40%" sx={{ mt: 3, mb: 1, borderRadius: 1 }} />
    {[65, 85, 50, 75].map((w, i) => (
      <Skeleton key={i} height={18} width={`${w}%`} sx={{ mb: 1, borderRadius: 1 }} />
    ))}
  </Box>
);

export default function ItineraryPlanner() {
  const { user, authHeader } = useAuth();
  const resultRef = useRef(null);

  const [form, setForm] = useState({
    selectedStates: [],
    daysOfItinerary: 5,
    monthOfVisit: MONTHS[new Date().getMonth()],
    tripType: '',
    compulsoryPlace: '',
    reachingPoint: '',
    departingPoint: '',
    otherInfo: '',
  });

  const [loading, setLoading] = useState(false);
  const [genStarted, setGenStarted] = useState(false);  // has user ever submitted?
  const [genError, setGenError] = useState('');
  const [itineraryHtml, setItineraryHtml] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [shareToken, setShareToken] = useState(null);

  // Scroll to result section as soon as loading starts (section is rendered immediately)
  useEffect(() => {
    if (loading && genStarted) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [loading, genStarted]);

  // Clean up on unmount so stale state doesn't persist if the user navigates away mid-generation
  useEffect(() => {
    return () => {
      setGenStarted(false);
      setItineraryHtml('');
      setGenError('');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.selectedStates.length) {
      setSnackbar({ open: true, message: 'Please select at least one state.', severity: 'warning' });
      return;
    }
    setLoading(true);
    setGenStarted(true);
    setGenError('');
    setItineraryHtml('');
    setShareToken(null);

    apicalls.apiHelper({ url: '/g_prmpt/test', method: 'POST', data: { promptBody: form } })
      .then(res => {
        setItineraryHtml(res.data);
      })
      .catch((err) => {
        const msg = err?.data?.message || err?.message || 'Failed to generate itinerary. Please try again.';
        setGenError(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    if (!itineraryHtml) return;
    setSaveLoading(true);
    try {
      const title = `${form.selectedStates.join(', ')} — ${form.daysOfItinerary} days (${form.monthOfVisit})`;
      const res = await axios.post(
        `${constants.API_URL}/itineraries/save`,
        { title, htmlContent: itineraryHtml, promptDetails: form },
        { headers: authHeader() }
      );
      setShareToken(res.data.data.shareToken);
      setSnackbar({ open: true, message: 'Itinerary saved!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save itinerary.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally { setSaveLoading(false); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/itinerary/${shareToken}`;
    navigator.clipboard.writeText(url)
      .then(() => setSnackbar({ open: true, message: 'Share link copied!', severity: 'success' }));
  };

  const cleanHtml = (html) => {
    if (!html) return '';
    return DOMPurify.sanitize(
      html.replace(/^```html\s*\n/i, '').replace(/\n\s*```$/, '').trim()
    );
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B4E 100%)',
        py: { xs: 6, md: 9 }, mb: 5,
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography className="section-label" sx={{ color: '#FFB347', mb: 1 }}>
            AI-Powered · Personalised
          </Typography>
          <Typography variant="h2" sx={{ color: 'white', fontSize: { xs: '2rem', md: '2.8rem' }, mb: 2 }}>
            Plan your perfect Indian adventure
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: 500, mx: 'auto' }}>
            Fill in your preferences and let our AI craft a day-by-day itinerary with hotel suggestions.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden' }}>

          {/* Form header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #E05A1B 0%, #F07A45 100%)',
            px: 4, py: 3,
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <FlightTakeoffIcon sx={{ color: 'white', fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Trip Planner</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
                Powered by AI, tailored for you
              </Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 5 } }}>
            <Grid container spacing={4}>

              {/* Section 1 — Where & When */}
              <Grid item style={{ width: "100%"}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, width: "80%" }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>🗺️</Typography>
                  <Typography variant="h6" fontWeight={600}>Where & When</Typography>
                  <Divider sx={{ flex: 1, ml: 1 }} />
                </Box>
                <Grid container spacing={1.5}>
                  <Grid item style={{width: "30%"}}>
                    <Autocomplete
                      multiple
                      style={{ width: '100%' }}
                      options={STATES}
                      value={form.selectedStates}
                      onChange={(_, v) => setForm(f => ({ ...f, selectedStates: v }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="States to Visit *"
                          placeholder={form.selectedStates.length ? '' : 'Select one or more states…'}
                          helperText="Choose the states you'd like to explore"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            size="small"
                            sx={{ bgcolor: alpha('#E05A1B', 0.1), color: '#E05A1B', border: `1px solid ${alpha('#E05A1B', 0.3)}` }}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item style={{width: "15%"}}>
                    <TextField
                      label="Duration (days) *"
                      type="number"
                      value={form.daysOfItinerary}
                      onChange={e => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 1 && v <= 90) setForm(f => ({ ...f, daysOfItinerary: v }));
                      }}
                      fullWidth
                      inputProps={{ min: 1, max: 90 }}
                      helperText="1 – 90 days"
                    />
                  </Grid>
                  <Grid item style={{width: "25%"}}>
                    <FormControl fullWidth>
                      <InputLabel>Month of Visit *</InputLabel>
                      <Select
                        value={form.monthOfVisit}
                        label="Month of Visit *"
                        onChange={e => setForm(f => ({ ...f, monthOfVisit: e.target.value }))}
                      >
                        {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item style={{width: "25%"}}>
                    <Autocomplete
                      options={TRIP_TYPES}
                      value={form.tripType}
                      onChange={(_, v) => setForm(f => ({ ...f, tripType: v || '' }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Trip Type" placeholder="e.g. Adventure" />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Section 2 — Journey Details */}
              <Grid style={{width: "100%"}} item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>✈️</Typography>
                  <Typography variant="h6" fontWeight={600}>Journey Details</Typography>
                  <Divider sx={{ flex: 1, ml: 1 }} />
                </Box>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      label="Must-visit places (optional)"
                      value={form.compulsoryPlace}
                      onChange={e => setForm(f => ({ ...f, compulsoryPlace: e.target.value }))}
                      fullWidth
                      placeholder="e.g. Taj Mahal, Varanasi Ghats, Jaisalmer Fort"
                      helperText="Specific places you absolutely want included"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Arrival point"
                      value={form.reachingPoint}
                      onChange={e => setForm(f => ({ ...f, reachingPoint: e.target.value }))}
                      fullWidth
                      placeholder="e.g. Indira Gandhi International Airport, Delhi"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Departure point"
                      value={form.departingPoint}
                      onChange={e => setForm(f => ({ ...f, departingPoint: e.target.value }))}
                      fullWidth
                      placeholder="e.g. Chhatrapati Shivaji Airport, Mumbai"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Section 3 — Preferences */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>💬</Typography>
                  <Typography variant="h6" fontWeight={600}>Additional Preferences</Typography>
                  <Divider sx={{ flex: 1, ml: 1 }} />
                </Box>
                <TextField
                  label="Anything else we should know?"
                  value={form.otherInfo}
                  onChange={e => setForm(f => ({ ...f, otherInfo: e.target.value }))}
                  fullWidth multiline rows={3}
                  placeholder="Budget preferences, dietary restrictions, mobility needs, interests…"
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? null : <AutoAwesomeIcon />}
                  sx={{ py: 1.8, fontSize: '1.1rem', borderRadius: 2 }}
                >
                  {loading ? 'Generating your itinerary…' : 'Generate AI Itinerary'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* ── Result section — shown as soon as user submits ── */}
        {genStarted && (
          <Box ref={resultRef} sx={{ mt: 6 }}>
            <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden' }}>

              {/* Progress bar while loading */}
              {loading && (
                <LinearProgress
                  color="primary"
                  sx={{ height: 3 }}
                />
              )}

              {/* Header */}
              <Box sx={{
                background: loading
                  ? 'linear-gradient(135deg, #555, #777)'
                  : genError
                    ? 'linear-gradient(135deg, #c0392b, #e74c3c)'
                    : 'linear-gradient(135deg, #1B7A3E, #2DA357)',
                px: 4, py: 3,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.6s ease',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {genError
                    ? <ErrorOutlineIcon sx={{ color: 'white' }} />
                    : <AutoAwesomeIcon sx={{ color: 'white' }} />
                  }
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                    {loading
                      ? 'Generating your itinerary…'
                      : genError
                        ? 'Generation failed'
                        : 'Your Personalised Itinerary'
                    }
                  </Typography>
                </Box>

                {/* Save / Share buttons — only when we have content */}
                {!loading && !genError && itineraryHtml && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saveLoading}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white',
                        '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' } }}
                    >
                      {saveLoading ? 'Saving…' : 'Save'}
                    </Button>
                    {shareToken && (
                      <Tooltip title="Copy shareable link">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ShareIcon />}
                          onClick={handleShare}
                          sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white',
                            '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' } }}
                        >
                          Share
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>

              {/* Body */}
              {loading && <ItinerarySkeleton />}

              {!loading && genError && (
                <Box sx={{ p: { xs: 3, md: 5 } }}>
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={handleSubmit}>
                        Retry
                      </Button>
                    }
                  >
                    {genError}
                  </Alert>
                </Box>
              )}

              {!loading && !genError && itineraryHtml && (
                <Fade in timeout={600}>
                  <Box sx={{ p: { xs: 3, md: 5 } }}>
                    <Box
                      className="itinerary-html-output"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(itineraryHtml) }}
                    />
                  </Box>
                </Fade>
              )}
            </Paper>
          </Box>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </Box>
  );
}
