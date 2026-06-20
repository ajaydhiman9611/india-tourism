import React, { useState } from 'react'
import {
    Box, Typography, Button, TextField, Collapse,
    ToggleButton, ToggleButtonGroup, CircularProgress, Alert,
} from '@mui/material'
import ThumbUpAltIcon   from '@mui/icons-material/ThumbUpAlt'
import FeedbackIcon     from '@mui/icons-material/Feedback'
import CheckCircleIcon  from '@mui/icons-material/CheckCircle'
import api              from '../../helpers/apicalls'

const LEVELS = [
    { value: 'low',       label: '🟢 Quiet',       desc: 'Barely anyone around' },
    { value: 'moderate',  label: '🟡 Moderate',    desc: 'Manageable crowds'    },
    { value: 'high',      label: '🟠 Busy',         desc: 'Noticeably crowded'   },
    { value: 'very_high', label: '🔴 Very Crowded', desc: 'Extremely packed'     },
]

/**
 * FeedbackWidget — shown below each result card.
 * Props:
 *   place          {string}   — destination name
 *   visitDate      {string}   — ISO date the user searched for
 *   predictedScore {number}   — what we predicted
 *   predictedLabel {string}   — e.g. "High"
 *   rawSignals     {object}   — signal breakdown for retraining
 */
export default function FeedbackWidget({ place, visitDate, predictedScore, predictedLabel, rawSignals }) {
    const [open,       setOpen]       = useState(false)
    const [level,      setLevel]      = useState('')
    const [note,       setNote]       = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done,       setDone]       = useState(false)
    const [error,      setError]      = useState('')

    const handleSubmit = async () => {
        if (!level) { setError('Please select a crowd level.'); return }
        setSubmitting(true)
        setError('')
        try {
            await api.apiHelper({
                url:    '/crowd/feedback',
                method: 'POST',
                data: {
                    place,
                    visitDate,
                    predictedScore,
                    predictedLabel,
                    actualLevel: level,
                    signalScores: rawSignals || {},
                    userNote: note.trim(),
                },
            })
            setDone(true)
        } catch (e) {
            setError('Could not save feedback. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (done) {
        return (
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, p: 1.2,
                borderRadius: 2, background: 'rgba(56,142,60,0.08)', border: '1px solid rgba(56,142,60,0.2)',
            }}>
                <CheckCircleIcon sx={{ color: '#388E3C', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#388E3C', fontWeight: 600 }}>
                    Thanks! Your feedback helps improve predictions.
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ mt: 1.5 }}>
            {!open ? (
                <Button
                    size="small"
                    startIcon={<FeedbackIcon sx={{ fontSize: '14px !important' }} />}
                    onClick={() => setOpen(true)}
                    sx={{
                        fontSize: '0.75rem', color: 'text.secondary', textTransform: 'none',
                        px: 1.5, py: 0.5, borderRadius: 2,
                        border: '1px dashed rgba(0,0,0,0.2)',
                        '&:hover': { background: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.35)' },
                    }}
                >
                    Already visited? Rate actual crowd
                </Button>
            ) : (
                <Collapse in={open}>
                    <Box sx={{
                        p: 1.5, borderRadius: 2,
                        background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)',
                    }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, mb: 1, color: 'text.primary' }}>
                            How crowded was <strong>{place}</strong>?
                        </Typography>

                        <ToggleButtonGroup
                            value={level} exclusive
                            onChange={(_, v) => { if (v) setLevel(v) }}
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.2 }}
                        >
                            {LEVELS.map(l => (
                                <ToggleButton
                                    key={l.value} value={l.value}
                                    sx={{
                                        fontSize: '0.72rem', py: 0.5, px: 1, borderRadius: '8px !important',
                                        border: '1px solid rgba(0,0,0,0.15) !important',
                                        textTransform: 'none', flex: '1 1 auto',
                                        '&.Mui-selected': {
                                            background: 'rgba(224,90,27,0.12)',
                                            borderColor: 'rgba(224,90,27,0.5) !important',
                                            color: '#E05A1B', fontWeight: 700,
                                        },
                                    }}
                                >
                                    {l.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>

                        <TextField
                            size="small" fullWidth multiline rows={1}
                            placeholder="Optional note (e.g. 'Long weekend really packed the roads')"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            inputProps={{ maxLength: 300 }}
                            sx={{
                                mb: 1,
                                '& .MuiOutlinedInput-root': { fontSize: '0.78rem', borderRadius: 1.5,
                                    '&.Mui-focused fieldset': { borderColor: '#E05A1B' } },
                            }}
                        />

                        {error && <Alert severity="warning" sx={{ mb: 1, py: 0, fontSize: '0.75rem' }}>{error}</Alert>}

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small" variant="contained"
                                startIcon={submitting ? <CircularProgress size={12} color="inherit" /> : <ThumbUpAltIcon sx={{ fontSize: '14px !important' }} />}
                                onClick={handleSubmit}
                                disabled={submitting || !level}
                                sx={{
                                    fontSize: '0.75rem', textTransform: 'none', borderRadius: 1.5,
                                    background: '#E05A1B', '&:hover': { background: '#c44d14' },
                                    '&.Mui-disabled': { background: 'rgba(0,0,0,0.1)' },
                                }}
                            >
                                Submit
                            </Button>
                            <Button
                                size="small"
                                onClick={() => { setOpen(false); setLevel(''); setNote(''); setError('') }}
                                sx={{ fontSize: '0.75rem', textTransform: 'none', color: 'text.secondary', borderRadius: 1.5 }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            )}
        </Box>
    )
}
