import React, { useState } from 'react'
import {
    Box, Container, Typography, TextField, Button, Chip,
    CircularProgress, Alert, Card, CardContent, Tooltip,
    LinearProgress, Divider, useTheme, useMediaQuery,
    IconButton, Paper, Collapse,
} from '@mui/material'
import AddIcon              from '@mui/icons-material/Add'
import CloseIcon            from '@mui/icons-material/Close'
import PeopleIcon           from '@mui/icons-material/People'
import TrendingUpIcon       from '@mui/icons-material/TrendingUp'
import WbSunnyIcon          from '@mui/icons-material/WbSunny'
import EventIcon            from '@mui/icons-material/Event'
import CalendarMonthIcon    from '@mui/icons-material/CalendarMonth'
import StarIcon             from '@mui/icons-material/Star'
import EmojiPeopleIcon      from '@mui/icons-material/EmojiPeople'
import TrainIcon            from '@mui/icons-material/Train'
import InfoOutlinedIcon     from '@mui/icons-material/InfoOutlined'
import ExpandMoreIcon       from '@mui/icons-material/ExpandMore'
import ExpandLessIcon       from '@mui/icons-material/ExpandLess'
import LocationOnIcon       from '@mui/icons-material/LocationOn'
import FeedbackWidget       from './FeedbackWidget'
import api                  from '../../helpers/apicalls'

const SIGNAL_ICONS = {
    trends:     <TrendingUpIcon    sx={{ fontSize: 15 }} />,
    season:     <CalendarMonthIcon sx={{ fontSize: 15 }} />,
    holiday:    <EventIcon         sx={{ fontSize: 15 }} />,
    weather:    <WbSunnyIcon       sx={{ fontSize: 15 }} />,
    train:      <TrainIcon         sx={{ fontSize: 15 }} />,
    popularity: <StarIcon          sx={{ fontSize: 15 }} />,
}

const SIGNAL_ORDER = ['trends', 'season', 'holiday', 'train', 'weather', 'popularity']

// ── Crowd meter arc ───────────────────────────────────────────────────────────
function CrowdMeter({ score, color }) {
    // Semi-circle arc: radius 36, total arc length ≈ 113px
    const arcLen = Math.PI * 36  // ~113
    const fill   = (score / 100) * arcLen
    return (
        <Box sx={{ position: 'relative', width: 92, height: 52, flexShrink: 0 }}>
            <svg width="92" height="52" viewBox="0 0 92 52">
                <path d="M 10 46 A 36 36 0 0 1 82 46" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="8" strokeLinecap="round" />
                <path d="M 10 46 A 36 36 0 0 1 82 46" fill="none" stroke={color}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${fill} ${arcLen}`} />
            </svg>
            <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center',
                fontWeight: 800, fontSize: '1.05rem', color, lineHeight: 1,
            }}>
                {score}
            </Box>
        </Box>
    )
}

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
    const bg = { 1: 'linear-gradient(135deg,#D32F2F,#EF5350)', 2: 'linear-gradient(135deg,#F57C00,#FFA726)', 3: 'linear-gradient(135deg,#388E3C,#66BB6A)' }
    return (
        <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            background: bg[rank] || 'linear-gradient(135deg,#607d8b,#90a4ae)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>
            #{rank}
        </Box>
    )
}

// ── Signal bar ────────────────────────────────────────────────────────────────
function SignalBar({ signalKey, signal }) {
    const barColor = signal.score >= 75 ? '#D32F2F' : signal.score >= 50 ? '#F57C00' : '#388E3C'
    return (
        <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'text.secondary' }}>
                    <Box sx={{ color: barColor, display: 'flex', alignItems: 'center' }}>{SIGNAL_ICONS[signalKey]}</Box>
                    <Typography sx={{ fontSize: '0.77rem' }}>{signal.label}</Typography>
                    <Typography sx={{ fontSize: '0.69rem', color: 'text.disabled' }}>({signal.weight})</Typography>
                    {signal.source === 'open-meteo-forecast' && (
                        <Tooltip title="Live weather forecast"><InfoOutlinedIcon sx={{ fontSize: 12, color: '#42A5F5' }} /></Tooltip>
                    )}
                    {signal.source === 'open-meteo-history' && (
                        <Tooltip title="Based on historical climate data"><InfoOutlinedIcon sx={{ fontSize: 12, color: '#AB47BC' }} /></Tooltip>
                    )}
                    {signal.temp !== undefined && (
                        <Typography sx={{ fontSize: '0.69rem', color: 'text.disabled' }}>
                            {signal.temp}°C {signal.rain > 0 ? `· ${signal.rain}mm rain` : ''}
                        </Typography>
                    )}
                </Box>
                <Typography sx={{ fontSize: '0.77rem', fontWeight: 700, color: barColor }}>{signal.score}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={signal.score} sx={{
                height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.07)',
                '& .MuiLinearProgress-bar': { backgroundColor: barColor, borderRadius: 3 },
            }} />
        </Box>
    )
}

// ── Monthly crowd chart (simple bar sparkline) ────────────────────────────────
function MonthlySparks({ peakMonths = [], offPeakMonths = [] }) {
    const months = ['J','F','M','A','M','J','J','A','S','O','N','D']
    return (
        <Box>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', mb: 0.5 }}>Best months to avoid crowds</Typography>
            <Box sx={{ display: 'flex', gap: 0.3 }}>
                {months.map((m, i) => {
                    const isPeak    = peakMonths.includes(i)
                    const isOffPeak = offPeakMonths.includes(i)
                    const bg = isPeak ? '#D32F2F' : isOffPeak ? '#388E3C' : 'rgba(0,0,0,0.12)'
                    return (
                        <Tooltip key={i} title={isPeak ? 'Peak — very crowded' : isOffPeak ? 'Off-peak — quiet' : 'Average'}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                                <Box sx={{ width: '100%', height: isPeak ? 20 : isOffPeak ? 8 : 14, borderRadius: 1, background: bg, transition: 'all 0.2s' }} />
                                <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>{m}</Typography>
                            </Box>
                        </Tooltip>
                    )
                })}
            </Box>
        </Box>
    )
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ result, searchDate }) {
    const [expanded, setExpanded] = useState(false)

    const orderedSignals = SIGNAL_ORDER
        .filter(k => result.signals[k])
        .map(k => [k, result.signals[k]])

    return (
        <Card elevation={3} sx={{
            borderRadius: 3,
            border: `2px solid ${result.color}28`,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: `0 6px 24px ${result.color}22` },
        }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>

                {/* ── Header ── */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <RankBadge rank={result.rank} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.2, mb: 0.5 }}>
                            {result.place}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                            <Chip label={`${result.emoji} ${result.label} Crowd`} size="small"
                                sx={{ background: result.color + '18', color: result.color, fontWeight: 700, fontSize: '0.73rem', height: 22 }} />
                            {result.holidayContext.isWeekend && (
                                <Chip label="Weekend" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                            )}
                            {result.holidayContext.daysToHoliday <= 7 && (
                                <Chip
                                    label={`${result.holidayContext.daysToHoliday}d to ${result.holidayContext.nearestHoliday}`}
                                    size="small" variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 22, color: '#F57C00', borderColor: '#F57C00aa' }}
                                />
                            )}
                            {result.meta?.nearestStation && (
                                <Chip
                                    icon={<LocationOnIcon sx={{ fontSize: '12px !important' }} />}
                                    label={`${result.meta.nearestStation.name} (${result.meta.nearestStation.distanceKm}km)`}
                                    size="small" variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 22 }}
                                />
                            )}
                        </Box>
                    </Box>
                    <CrowdMeter score={result.score} color={result.color} />
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* ── Signal bars ── */}
                <Box sx={{ mb: 0.5 }}>
                    {orderedSignals.map(([key, signal]) => (
                        <SignalBar key={key} signalKey={key} signal={signal} />
                    ))}
                </Box>

                {/* ── Advice ── */}
                <Box sx={{
                    mt: 1, p: 1.2, borderRadius: 2,
                    background: 'rgba(56,142,60,0.07)', border: '1px solid rgba(56,142,60,0.18)',
                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                }}>
                    <EmojiPeopleIcon sx={{ fontSize: 15, color: '#388E3C', mt: 0.15, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.77rem', color: '#388E3C', fontWeight: 500 }}>{result.advice}</Typography>
                </Box>

                {/* ── Expandable: monthly pattern ── */}
                {(result.meta?.peakMonths?.length > 0 || result.meta?.offPeakMonths?.length > 0) && (
                    <>
                        <Button
                            size="small" endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => setExpanded(e => !e)}
                            sx={{ mt: 1, fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary', p: 0,
                                  '&:hover': { background: 'transparent', color: '#E05A1B' } }}
                        >
                            {expanded ? 'Hide' : 'Show'} monthly pattern
                        </Button>
                        <Collapse in={expanded}>
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                                <MonthlySparks
                                    peakMonths={result.meta.peakMonths}
                                    offPeakMonths={result.meta.offPeakMonths}
                                />
                            </Box>
                        </Collapse>
                    </>
                )}

                {/* ── Feedback widget ── */}
                <FeedbackWidget
                    place={result.place}
                    visitDate={searchDate}
                    predictedScore={result.score}
                    predictedLabel={result.label}
                    rawSignals={result._rawSignals}
                />

            </CardContent>
        </Card>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CrowdPredictor() {
    const theme    = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const [placeInput, setPlaceInput] = useState('')
    const [places,     setPlaces]     = useState([])
    const [date,       setDate]       = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 30)
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
            setError('Already added.'); return
        }
        setPlaces(prev => [...prev, trimmed])
        setPlaceInput('')
        setError('')
    }

    const removePlace = i => setPlaces(prev => prev.filter((_, idx) => idx !== i))

    const handleKeyDown = e => { if (e.key === 'Enter') { e.preventDefault(); addPlace() } }

    const handlePredict = async () => {
        if (places.length < 2) { setError('Add at least 2 places to compare.'); return }
        setError(''); setLoading(true); setResults(null)
        try {
            const res = await api.apiHelper({ url: '/crowd/predict', method: 'POST', data: { places, date } })
            if (res.success) setResults(res.data)
            else setError(res.message || 'Something went wrong.')
        } catch (e) {
            setError(e?.data?.message || 'Prediction failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const todayStr = new Date().toISOString().split('T')[0]

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f8f4ef 0%,#fdf6ee 60%,#f0f4ff 100%)', pb: 8 }}>

            {/* ── Hero ── */}
            <Box sx={{ background: 'linear-gradient(135deg,#1C1C2E 0%,#2d2d44 100%)', py: { xs: 5, sm: 7 }, px: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <PeopleIcon sx={{ color: '#E05A1B', fontSize: { xs: 28, sm: 36 } }} />
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Crowd Traffic <Box component="span" sx={{ color: '#E05A1B' }}>Predictor</Box>
                    </Typography>
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.88rem', sm: '1rem' }, maxWidth: 520, mx: 'auto', mb: 1.5 }}>
                    Compare 2–3 destinations and discover which will be most crowded on your travel date.
                </Typography>
                {/* Signal pills */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.8 }}>
                    {[
                        { icon: <TrendingUpIcon sx={{ fontSize: 12 }} />,    label: 'Google Trends' },
                        { icon: <TrainIcon sx={{ fontSize: 12 }} />,         label: 'Train Availability' },
                        { icon: <WbSunnyIcon sx={{ fontSize: 12 }} />,       label: 'Open-Meteo Weather' },
                        { icon: <CalendarMonthIcon sx={{ fontSize: 12 }} />, label: 'Seasonal Patterns' },
                        { icon: <EventIcon sx={{ fontSize: 12 }} />,         label: 'Holiday Calendar' },
                    ].map(s => (
                        <Chip
                            key={s.label} icon={s.icon} label={s.label} size="small"
                            sx={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                                  fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.15)',
                                  '& .MuiChip-icon': { color: '#E05A1B' } }}
                        />
                    ))}
                </Box>
            </Box>

            <Container maxWidth="md" sx={{ mt: { xs: -2, sm: -3 }, px: { xs: 2, sm: 3 } }}>

                {/* ── Input card ── */}
                <Paper elevation={5} sx={{ borderRadius: 4, p: { xs: 2.5, sm: 3.5 }, mb: 4 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 1.5 }}>
                        Enter destinations &amp; travel date
                    </Typography>

                    {/* Place chips */}
                    {places.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.8 }}>
                            {places.map((p, i) => (
                                <Chip key={i} label={p} onDelete={() => removePlace(i)}
                                    deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                                    sx={{ fontWeight: 600, fontSize: '0.83rem',
                                          background: 'rgba(224,90,27,0.1)', border: '1.5px solid rgba(224,90,27,0.3)',
                                          color: '#E05A1B', '& .MuiChip-deleteIcon': { color: '#E05A1B' } }}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Add place */}
                    {places.length < 3 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField fullWidth size="small"
                                placeholder={places.length === 0 ? 'e.g. Mussoorie, Nainital, Rishikesh…' : 'Add another place…'}
                                value={placeInput}
                                onChange={e => setPlaceInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                inputProps={{ maxLength: 80 }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2,
                                    '&.Mui-focused fieldset': { borderColor: '#E05A1B' } } }}
                            />
                            <Tooltip title="Add place (or press Enter)">
                                <span>
                                    <IconButton onClick={addPlace} disabled={!placeInput.trim()}
                                        sx={{ background: '#E05A1B', color: 'white', borderRadius: 2, px: 1.5,
                                              '&:hover': { background: '#c44d14' },
                                              '&.Mui-disabled': { background: 'rgba(0,0,0,0.08)' } }}>
                                        <AddIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    )}

                    {/* Date */}
                    <TextField label="Travel date" type="date" size="small" fullWidth
                        value={date} onChange={e => setDate(e.target.value)}
                        inputProps={{ min: todayStr }}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2,
                            '&.Mui-focused fieldset': { borderColor: '#E05A1B' } } }}
                    />

                    {error && <Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2 }}>{error}</Alert>}

                    <Button fullWidth variant="contained" size="large" onClick={handlePredict}
                        disabled={loading || places.length < 2}
                        sx={{ borderRadius: 2.5, py: 1.3, fontWeight: 700, fontSize: '0.95rem',
                              background: 'linear-gradient(135deg,#E05A1B,#F07A45)',
                              boxShadow: '0 4px 16px rgba(224,90,27,0.3)',
                              '&:hover': { background: 'linear-gradient(135deg,#c44d14,#d96a35)' },
                              '&.Mui-disabled': { background: 'rgba(0,0,0,0.12)' } }}>
                        {loading
                            ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Analysing signals…</>
                            : `Predict Crowd for ${places.length} Place${places.length !== 1 ? 's' : ''}`}
                    </Button>

                    {loading && (
                        <Box sx={{ mt: 1.5 }}>
                            {['Fetching Google Trends…','Checking train availability…','Reading weather data…','Scoring holiday proximity…'].map((msg, i) => (
                                <Typography key={i} sx={{ fontSize: '0.72rem', color: 'text.disabled', textAlign: 'center', lineHeight: 1.8 }}>
                                    {msg}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Paper>

                {/* ── Results ── */}
                {results && (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <TrendingUpIcon sx={{ color: '#E05A1B' }} />
                            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                                Crowd Ranking —{' '}
                                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.9rem' }}>
                                    {new Date(results.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Box>
                            </Typography>
                        </Box>

                        {/* Summary banner */}
                        <Paper sx={{ p: 2, borderRadius: 3, mb: 3,
                            background: 'linear-gradient(135deg,rgba(224,90,27,0.06),rgba(240,122,69,0.04))',
                            border: '1px solid rgba(224,90,27,0.15)' }}>
                            <Typography sx={{ fontSize: '0.87rem', color: 'text.secondary', lineHeight: 1.7 }}>
                                <strong style={{ color: results.results[0].color }}>{results.results[0].place}</strong>{' '}
                                is expected to be the most crowded (score {results.results[0].score}/100).{' '}
                                {results.results.length > 1 && <>
                                    <strong style={{ color: results.results[results.results.length - 1].color }}>
                                        {results.results[results.results.length - 1].place}
                                    </strong>{' '}
                                    will be relatively quieter (score {results.results[results.results.length - 1].score}/100).
                                </>}
                            </Typography>
                        </Paper>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {results.results.map(result => (
                                <ResultCard key={result.place} result={result} searchDate={results.date} />
                            ))}
                        </Box>

                        <Typography sx={{ mt: 3, fontSize: '0.72rem', color: 'text.disabled', textAlign: 'center', lineHeight: 1.8 }}>
                            Powered by Google Trends · Open-Meteo · ConfirmTkt · Per-place seasonal data · Indian holiday calendar.
                            <br />Scores are probabilistic estimates. Actual crowds may vary.
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    )
}
