import React, { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  Box, Grid, TextField, Button, Typography, Alert, Divider, CircularProgress, alpha
} from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import { useAuth } from '../../context/AuthContext'

const QUOTES = [
  { text: "India is not a country, it's a journey.", attr: "Rumi (paraphrased)" },
  { text: "To travel is to live.", attr: "Hans Christian Andersen" },
  { text: "Once a year, go someplace you've never been before.", attr: "Dalai Lama" },
]
const Q = QUOTES[Math.floor(Math.random() * QUOTES.length)]

// ── Google colour button ───────────────────────────────────────────────────────
const GoogleButton = ({ onClick, disabled }) => (
  <Button
    fullWidth
    variant="outlined"
    size="large"
    disabled={disabled}
    onClick={onClick}
    startIcon={
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
    }
    sx={{
      borderColor: 'divider',
      color: 'text.primary',
      py: 1.4,
      borderRadius: 2,
      textTransform: 'none',
      fontSize: '0.95rem',
      '&:hover': { borderColor: '#4285F4', background: alpha('#4285F4', 0.04) },
    }}
  >
    Continue with Google
  </Button>
)

// ── Left decorative panel ──────────────────────────────────────────────────────
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
      <Typography sx={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E05A1B', mb: 1 }}>Travel Wisdom</Typography>
      <Typography variant="h3" sx={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '2rem', lineHeight: 1.4, mb: 2 }}>"{Q.text}"</Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>— {Q.attr}</Typography>
    </Box>
  </Grid>
)

// ── Password login tab ─────────────────────────────────────────────────────────
const PasswordForm = ({ onSuccess }) => {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await login(form.email, form.password)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField label="Email address" type="email" fullWidth required value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} sx={{ mb: 2 }} />
      <TextField label="Password" type="password" fullWidth required value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
        <Link to="/forgot-password" style={{ color: '#E05A1B', fontSize: '0.85rem', textDecoration: 'none' }}>
          Forgot password?
        </Link>
      </Box>
      <Button type="submit" variant="contained" color="primary" fullWidth size="large"
        disabled={busy} sx={{ py: 1.5, borderRadius: 2 }}>
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
      </Button>
    </form>
  )
}

// ── OTP login tab ──────────────────────────────────────────────────────────────
const OtpForm = ({ onSuccess }) => {
  const { requestOtp, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await requestOtp(email)
      setInfo(`A 6-digit code was sent to ${email}`)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP')
    } finally { setBusy(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await verifyOtp(email, otp)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP')
    } finally { setBusy(false) }
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleRequestOtp}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Email address" type="email" fullWidth required value={email}
          onChange={e => setEmail(e.target.value)} sx={{ mb: 3 }} />
        <Button type="submit" variant="contained" color="primary" fullWidth size="large"
          disabled={busy} sx={{ py: 1.5, borderRadius: 2 }}>
          {busy ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyOtp}>
      {info && <Alert severity="info" sx={{ mb: 2 }}>{info}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="6-digit code" fullWidth required value={otp}
        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
        sx={{ mb: 1 }}
      />
      <Button variant="text" size="small" sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
        onClick={() => { setStep('email'); setError(''); setInfo(''); setOtp('') }}>
        ← Change email
      </Button>
      <Button type="submit" variant="contained" color="primary" fullWidth size="large"
        disabled={busy || otp.length < 6} sx={{ py: 1.5, borderRadius: 2 }}>
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Verify & Sign In'}
      </Button>
    </form>
  )
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('otp') // 'otp' | 'password'

  const oauthError = searchParams.get('error')

  const onSuccess = () => navigate('/')

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <LeftPanel />
      <Grid item xs={12} md={6}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'background.default' }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
            <MapIcon sx={{ color: '#E05A1B' }} />
            <Typography fontWeight={700} fontSize="1.1rem">
              India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={700} gutterBottom>Welcome back</Typography>
          <Typography color="text.secondary" mb={oauthError ? 2 : 4}>Sign in to continue your journey across India.</Typography>

          {/* OAuth error (e.g. Google SSO failed) */}
          {oauthError && (
            <Alert severity="error" sx={{ mb: 3 }}>{decodeURIComponent(oauthError)}</Alert>
          )}

          {/* Google SSO */}
          <GoogleButton onClick={loginWithGoogle} />

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>or sign in with email</Typography>
          </Divider>

          {/* Tab switcher */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, background: 'action.hover', borderRadius: 2, p: 0.5 }}>
            {['otp', 'password'].map(t => (
              <Button key={t} fullWidth size="small"
                variant={tab === t ? 'contained' : 'text'}
                color={tab === t ? 'primary' : 'inherit'}
                onClick={() => setTab(t)}
                sx={{ borderRadius: 1.5, textTransform: 'none', py: 0.8,
                  color: tab === t ? undefined : 'text.secondary' }}
              >
                {t === 'otp' ? 'Email OTP' : 'Password'}
              </Button>
            ))}
          </Box>

          {tab === 'otp' ? <OtpForm onSuccess={onSuccess} /> : <PasswordForm onSuccess={onSuccess} />}

          <Typography textAlign="center" fontSize="0.9rem" mt={3}>
            No account?{' '}
            <Link to="/register" style={{ color: '#E05A1B', fontWeight: 600, textDecoration: 'none' }}>
              Create one free
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

export default LoginPage
