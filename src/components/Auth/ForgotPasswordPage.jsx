import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box, Grid, TextField, Button, Typography, Alert, CircularProgress, alpha,
  InputAdornment, IconButton,
} from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { constants } from '../../helpers/constants'

const API = constants.API_URL

// ── Left decorative panel (same style as LoginPage) ───────────────────────────
const LeftPanel = () => (
  <Grid item xs={false} md={6}
    sx={{
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'flex-end',
      background: 'linear-gradient(160deg, #1C1C2E 0%, #2D1B4E 50%, #1C1C2E 100%)',
      p: 6, position: 'relative', overflow: 'hidden',
    }}
  >
    <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,90,27,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <Box sx={{ position: 'absolute', bottom: 0, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,122,62,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <Box sx={{ position: 'absolute', top: 40, left: 48, display: 'flex', alignItems: 'center', gap: 1 }}>
      <MapIcon sx={{ color: '#E05A1B', fontSize: 28 }} />
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
        India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
      </Typography>
    </Box>
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography sx={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E05A1B', mb: 1 }}>Secure Access</Typography>
      <Typography variant="h3" sx={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '2rem', lineHeight: 1.4, mb: 2 }}>
        "Not all those who wander are lost."
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>— J.R.R. Tolkien</Typography>
    </Box>
  </Grid>
)

// ── Main ForgotPasswordPage ────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const navigate = useNavigate()

  // step: 'email' → 'reset' → 'done'
  const [step,    setStep]    = useState('email')
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [newPass, setNewPass] = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [info,    setInfo]    = useState('')
  const [error,   setError]   = useState('')
  const [busy,    setBusy]    = useState(false)

  // ── Step 1: request OTP ──────────────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await axios.post(`${API}/auth/forgot-password`, { email })
      setInfo(`If an account exists for ${email}, a reset code has been sent.`)
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  // ── Step 2: verify OTP + set new password ────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError(''); setBusy(true)
    try {
      await axios.post(`${API}/auth/reset-password`, { email, otp, newPassword: newPass })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.')
    } finally { setBusy(false) }
  }

  return (
    <Grid container sx={{ height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
      <LeftPanel />
      <Grid item xs={12} md={6}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'background.default', overflowY: 'auto' }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
            <MapIcon sx={{ color: '#E05A1B' }} />
            <Typography fontWeight={700} fontSize="1.1rem">
              India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
            </Typography>
          </Box>

          {/* ── Done state ── */}
          {step === 'done' && (
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} gutterBottom>Password reset!</Typography>
              <Typography color="text.secondary" mb={4}>
                Your password has been updated. You can now sign in with your new password.
              </Typography>
              <Button
                variant="contained" color="primary" fullWidth size="large"
                onClick={() => navigate('/login')}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Go to Sign In
              </Button>
            </Box>
          )}

          {/* ── Step 1: enter email ── */}
          {step === 'email' && (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>Forgot password?</Typography>
              <Typography color="text.secondary" mb={4}>
                Enter your email address and we'll send you a reset code.
              </Typography>
              <form onSubmit={handleRequestOtp}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  label="Email address" type="email" fullWidth required
                  value={email} onChange={e => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth size="large"
                  disabled={busy} sx={{ py: 1.5, borderRadius: 2 }}>
                  {busy ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Code'}
                </Button>
              </form>
            </>
          )}

          {/* ── Step 2: enter OTP + new password ── */}
          {step === 'reset' && (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>Check your email</Typography>
              <Typography color="text.secondary" mb={4}>
                {info}
              </Typography>
              <form onSubmit={handleResetPassword}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  label="6-digit reset code" fullWidth required
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="New password" type={showPw ? 'text' : 'password'} fullWidth required
                  value={newPass} onChange={e => setNewPass(e.target.value)}
                  helperText="Minimum 8 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end">
                          {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth size="large"
                  disabled={busy || otp.length < 6 || newPass.length < 8}
                  sx={{ py: 1.5, borderRadius: 2 }}>
                  {busy ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
                </Button>
                <Button
                  variant="text" fullWidth size="small"
                  sx={{ mt: 1.5, color: 'text.secondary', textTransform: 'none' }}
                  onClick={() => { setStep('email'); setError(''); setInfo(''); setOtp(''); setNewPass('') }}
                >
                  ← Use a different email
                </Button>
              </form>
            </>
          )}

          {step !== 'done' && (
            <Typography textAlign="center" fontSize="0.9rem" mt={3}>
              Remembered it?{' '}
              <Link to="/login" style={{ color: '#E05A1B', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}

export default ForgotPasswordPage
