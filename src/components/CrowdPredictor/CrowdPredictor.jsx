import React, { useState } from 'react'
import {
    Box, Container, Typography, TextField, Button, Chip,
    CircularProgress, Alert, Card, CardContent, Tooltip,
    LinearProgress, Divider, useTheme, useMediaQuery,
    IconButton, Paper,
} from '@mui/material'
import AddIcon          from '@mui/icons-material/Add'
import CloseIcon        from '@mui/icons-material/Close'
import PeopleIcon       from '@mui/icons-material/People'
import TrendingUpIcon   from '@mui/icons-material/TrendingUp'
import WbSunnyIcon      from '@mui/icons-material/WbSunny'
import EventIcon        from '@mui/icons-material/Event'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import StarIcon         from '@mui/icons-material/Star'
import EmojiPeopleIcon  from '@mui/icons-material/EmojiPeople'
import api              from '../../helpers/apicalls'

const SIGNAL_ICONS = {
    trends:     <TrendingUpIcon   sx={{ fontSize: 16 }} />,
    season:     <CalendarMonthIcon sx={{ fontSize: 16 }} />,
    holiday:    <EventIcon        sx={{ fontSize: 16 }} />,
    weather:    <WbSunnyIcon      sx={{ fontSize: 16 }} />,
    popularity: <StarIcon         sx={{ fontSize: 16 }} />,
}

// ── Signal bar row ────────────────────────────────────────────────────────────
function SignalBar({ signalKey, signal }) {
    const barColor =
        signal.score >= 75 ? '#D32F2F'
        : signal.score >= 50 ? '#F57C00'
        : '#388E3C'

    return (
        <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: 'text.secondary', fontSize: '0.78rem' }}>
                    {SIGNAL_ICONS[signalKey]}
                    {signal.label}
                    <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
                        ({signal.weight})
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: barColor }}>
                    {signal.score}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={signal.score}
                sx={{
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': { backgroundColor: barColor, borderRadius: 3 },
                }}
            />
        </Box>
    )
}

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
    const colors = { 1: '#D32F2F', 2: '#F57C00', 3: '#388E3C' }
    return (
        <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            background: colors[rank] || '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
            boxShadow: `0 2px 8px ${colors[rank]}55`,
        }}>
            #{rank}
        </Box>
    )
}

// ── Crowd meter arc ───────────────────────────────────────────────────────────
function CrowdMeter({ score, color }) {
    const r     = 36
    const circ  = 2 * Math.PI * r
    const half  = circ / 2           // only top half visible
    const fill  = (score / 100) * half

    return (
        <Box sx={{ position: 'relative', width: 90, height: 50, mx: 'auto' }}>
            <svg width="90" height="50" viewBox="0 0 90 50">
                {/* background arc */}
                <path
                    d="M 9 45 A 36 36 0 0 1 81 45"
                    fill="none"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="8"
                    strokeLinecap="round"
                />
                {/* filled arc */}
                <path
                    d="M 9 45 A 36 36 0 0 1 81 45"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 113} 113`}
                />
            </svg>
            <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color,
            }}>
                {score}
            </Box>
        </Box>
    )
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ result, isMobile }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <Card elevation={3} sx={{
            borderRadius: 3,
            border: `2px solid ${result.color}33`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${result.color}22` },
        }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                {/* Header row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <RankBadge rank={result.rank} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.15rem' }, lineHeight: 1.2 }}>
                            {result.place}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4, flexWrap: 'wrap' }}>
                            <Chip
                                label={`${result.emoji} ${result.label} Crowd`}
                                size="small"
                                sx={{ background: result.color + '18', color: result.color, fontWeight: 700, fontSize: '0.75rem', height: 22 }}
                            />
                            {result.holidayContext.isWeekend && (
                                <Chip label="Weekend" size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
                            )}
                            {result.holidayContext.daysToHoliday <= 7 && (
                                <Chip
                                    label={`${result.holidayContext.daysToHoliday}d to ${result.holidayContext.nearestHoliday}`}
                                    size="small" variant="outlined"
                                    sx={{ fontSize: '0.72rem', height: 22, color: '#F57C00', borderColor: '#F57C00' }}
                                />
                            )}
                        </Box>
                    </Box>
                    <CrowdMeter score={result.score} color={result.color} />
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Signal bars */}
                <Box>
                    {Object.entries(result.signals).map(([key, signal]) => (
                        <SignalBar key={key} signalKey={key} signal={signal} />
                    ))}
                </Box>

                {/* Advice */}
                <Box sx={{
                    mt: 1.5, p: 1.2, borderRadius: 2,
                    background: 'rgba(56,142,60,0.08)', border: '1px solid rgba(56,142,60,0.2)',
                    display: 'flex', alignItems: 'flex-start', gap: 1,
                }}>
                    <EmojiPeopleIcon sx={{ fontSize: 16, color: '#388E3C', mt: 0.1, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.78rem', color: '#388E3C', fontWeight: 500 }}>
                        {result.advice}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CrowdPredictor() {
    const theme   = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const [placeInput, setPlaceInput] = useState('')
    const [places,     setPlaces]     = useState([])
    const [date,       setDate]       = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() + 30)
        return d.toISOString().split('T')[0]
    })
    const [loading,  setLoading]  = useState(false)
    const [results,  setResults]  = useState(null)
    const [error,    setError]    = useState('')

    const addPlace = () => {
        const trimmed = placeInput.trim()
        if (!trimmed) return
        if (places.length >= 3) { setError('Maximum 3 places allowed.'); return }
        if (places.map(p => p.toLowerCase()).includes(trimmed.toLowerCase())) {
            setError('Place already added.')
            return
        }
        setPlaces(prev => [...prev, trimmed])
        setPlaceInput('')
        setError('')
    }

    const removePlace = (i) => setPlaces(prev => prev.filter((_, idx) => idx !== i))

    const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addPlace() } }

    const handlePredict = async () => {
        if (places.length < 2) { setError('Add at least 2 places to compare.'); return }
        setError('')
        setLoading(true)
        setResults(null)
        try {
            const res = await api.apiHelper({
                url:    '/crowd/predict',
                method: 'POST',
                data:   { places, date },
            })
            if (res.success) setResults(res.data)
            else setError(res.message || 'Something went wrong.')
        } catch (e) {
            setError(e?.data?.message || 'Failed to fetch prediction. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const todayStr = new Date().toISOString().split('T')[0]

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f4ef 0%, #fdf6ee 60%, #f0f4ff 100%)', pb: 8 }}>
            {/* Hero */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1C1C2E 0%, #2d2d44 100%)',
                py: { xs: 5, sm: 7 }, px: 2, textAlign: 'center',
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <PeopleIcon sx={{ color: '#E05A1B', fontSize: { xs: 28, sm: 36 } }} />
                    <Typography variant="h4" sx={{
                        color: 'white', fontWeight: 800,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}>
                        Crowd Traffic <Box component="span" sx={{ color: '#E05A1B' }}>Predictor</Box>
                    </Typography>
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.88rem', sm: '1rem' }, maxWidth: 500, mx: 'auto' }}>
                    Compare 2–3 destinations and find out which will be most crowded on your travel date.
                </Typography>
            </Box>

            <Container maxWidth="md" sx={{ mt: { xs: -2, sm: -3 }, px: { xs: 2, sm: 3 } }}>
                {/* Input card */}
                <Paper elevation={4} sx={{ borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, mb: 4 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2, color: 'text.primary' }}>
                        Enter destinations &amp; travel date
                    </Typography>

                    {/* Place chips */}
                    {places.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {places.map((p, i) => (
                                <Chip
                                    key={i}
                                    label={p}
                                    onDelete={() => removePlace(i)}
                                    deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                                    sx={{
                                        fontWeight: 600, fontSize: '0.85rem',
                                        background: 'rgba(224,90,27,0.1)',
                                        border: '1.5px solid rgba(224,90,27,0.3)',
                                        color: '#E05A1B',
                                        '& .MuiChip-deleteIcon': { color: '#E05A1B' },
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Add place input */}
                    {places.length < 3 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={places.length === 0 ? 'e.g. Mussoorie, Nainital, Rishikesh' : 'Add another place…'}
                                value={placeInput}
                                onChange={e => setPlaceInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                inputProps={{ maxLength: 80 }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: '#E05A1B' },
                                    },
                                }}
                            />
                            <Tooltip title="Add place">
                                <span>
                                    <IconButton
                                        onClick={addPlace}
                                        disabled={!placeInput.trim()}
                                        sx={{
                                            background: '#E05A1B', color: 'white', borderRadius: 2,
                                            px: 1.5,
                                            '&:hover': { background: '#c44d14' },
                                            '&.Mui-disabled': { background: 'rgba(0,0,0,0.08)' },
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    )}

                    {/* Date picker */}
                    <TextField
                        label="Travel date"
                        type="date"
                        size="small"
                        fullWidth
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        inputProps={{ min: todayStr }}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            mb: 2.5,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&.Mui-focused fieldset': { borderColor: '#E05A1B' },
                            },
                        }}
                    />

                    {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handlePredict}
                        disabled={loading || places.length < 2}
                        sx={{
                            borderRadius: 2.5, py: 1.3, fontWeight: 700, fontSize: '0.95rem',
                            background: 'linear-gradient(135deg, #E05A1B, #F07A45)',
                            boxShadow: '0 4px 16px rgba(224,90,27,0.35)',
                            '&:hover': { background: 'linear-gradient(135deg, #c44d14, #d96a35)' },
                            '&.Mui-disabled': { background: 'rgba(0,0,0,0.12)' },
                        }}
                    >
                        {loading
                            ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> Analyzing…</>
                            : `Predict Crowd for ${places.length} Place${places.length !== 1 ? 's' : ''}`
                        }
                    </Button>

                    <Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: 'text.disabled', textAlign: 'center' }}>
                        Uses Google Trends · Seasonal patterns · Holiday calendar · Weather data
                    </Typography>
                </Paper>

                {/* Results */}
                {results && (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                            <TrendingUpIcon sx={{ color: '#E05A1B' }} />
                            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                Crowd Ranking —{' '}
                                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.95rem' }}>
                                    {new Date(results.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Box>
                            </Typography>
                        </Box>

                        {/* Summary banner */}
                        <Paper sx={{
                            p: 2, borderRadius: 3, mb: 3,
                            background: 'linear-gradient(135deg, rgba(224,90,27,0.06), rgba(240,122,69,0.04))',
                            border: '1px solid rgba(224,90,27,0.15)',
                        }}>
                            <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary', lineHeight: 1.6 }}>
                                <strong style={{ color: results.results[0].color }}>
                                    {results.results[0].place}
                                </strong>{' '}
                                is expected to be the most crowded (score {results.results[0].score}/100).{' '}
                                {results.results.length > 1 && (
                                    <>
                                        <strong style={{ color: results.results[results.results.length - 1].color }}>
                                            {results.results[results.results.length - 1].place}
                                        </strong>{' '}
                                        will be relatively quieter (score {results.results[results.results.length - 1].score}/100).
                                    </>
                                )}
                            </Typography>
                        </Paper>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {results.results.map((result) => (
                                <ResultCard key={result.place} result={result} isMobile={isMobile} />
                            ))}
                        </Box>

                        <Typography sx={{ mt: 3, fontSize: '0.75rem', color: 'text.disabled', textAlign: 'center' }}>
                            Scores are estimates based on historical patterns, search trends, and calendar data.
                            Actual crowd levels may vary.
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    )
}
