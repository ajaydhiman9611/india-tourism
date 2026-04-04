import React, { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  Box, Grid, TextField, Button, Typography, Alert, Divider,
  CircularProgress, alpha, InputAdornment, IconButton,
} from '@mui/material'
import MapIcon        from '@mui/icons-material/Map'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useAuth } from '../../context/AuthContext'

const QUOTES = [
  { text: "India is not a country, it's a journey.", attr: "Rumi (paraphrased)" },
  { text: "Once a year, go someplace you've never been before.", attr: "Dalai Lama" },
  { text: "To travel is to live.", attr: "Hans Christian Andersen" },
]
const Q = QUOTES[Math.floor(Math.random() * QUOTES.length)]

// ── Google button ──────────────────────────────────────────────────────────────
const GoogleButton = ({ onClick, disabled, label = 'Continue with Google' }) => (
  <Button
    fullWidth variant="outlined" size="large"
    disabled={disabled} onClick={onClick}
    startIcon={
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
    }
    sx={{
      py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: '0.95rem',
      borderColor: 'divider', color: 'text.primary', fontWeight: 600,
      '&:hover': { borderColor: '#4285F4', background: alpha('#4285F4', 0.04) },
    }}
  >
    {label}
  </Button>
)

// ── Left decorative panel ──────────────────────────────────────────────────────
const LeftPanel = () => (
  <Grid item xs={false} md={5}
    sx={{
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'linear-gradient(160deg, #1C1C2E 0%, #2D1B4E 60%, #1C1C2E 100%)',
      p: 6, position: 'relative', overflow: 'hidden',
    }}
  >
    {/* Blobs */}
    <Box sx={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,90,27,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <Box sx={{ position: 'absolute', bottom: 60, left: -100, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,122,62,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Logo */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
      <MapIcon sx={{ color: '#E05A1B', fontSize: 28 }} />
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
        India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
      </Typography>
    </Box>

    {/* Stats strip */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      {[
        { value: '36', label: 'States & UTs' },
        { value: '40+', label: 'UNESCO Sites' },
        { value: '5000+', label: 'Years of History' },
      ].map(stat => (
        <Box key={stat.label} sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#E05A1B', lineHeight: 1 }}>{stat.value}</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', mt: 0.3 }}>{stat.label}</Typography>
        </Box>
      ))}
    </Box>

    {/* Quote */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography sx={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E05A1B', mb: 1 }}>Travel Wisdom</Typography>
      <Typography sx={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '1.35rem', lineHeight: 1.5, mb: 1.5, fontStyle: 'italic' }}>
        "{Q.text}"
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem' }}>— {Q.attr}</Typography>
    </Box>
  </Grid>
)

// ── Tab switcher ───────────────────────────────────────────────────────────────
const TabSwitcher = ({ tab, onChange }) => (
  <Box sx={{
    display: 'flex', gap: 0.5, mb: 3,
    p: 0.5, background: 'rgba(0,0,0,0.05)', borderRadius: 2,
  }}>
    {[{ id: 'otp', label: 'Email OTP' }, { id: 'password', label: 'Password' }].map(t => (
      <Button key={t.id} fullWidth size="small"
        variant={tab === t.id ? 'contained' : 'text'}
        color={tab === t.id ? 'primary' : 'inherit'}
        onClick={() => onChange(t.id)}
        sx={{
          borderRadius: 1.5, textTransform: 'none', py: 0.9, fontWeight: 600,
          fontSize: '0.88rem',
          color: tab === t.id ? undefined : 'text.secondary',
          boxShadow: tab === t.id ? 2 : 'none',
        }}
      >
        {t.label}
      </Button>
    ))}
  </Box>
)

// ── Password form ──────────────────────────────────────────────────────────────
const PasswordForm = ({ onSuccess }) => {
  const { login } = useAuth()
  const [form,   setForm]   = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error,  setError]  = useState('')
  const [busy,   setBusy]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await login(form.email, form.password)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
      <TextField label="Email address" type="email" fullWidth required
        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        sx={{ mb: 2 }} />
      <TextField label="Password" type={showPw ? 'text' : 'password'} fullWidth required
        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end" tabIndex={-1}>
                {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Link to="/forgot-password" style={{ color: '#E05A1B', fontSize: '0.84rem', fontWeight: 600, textDecoration: 'none' }}>
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

// ── OTP form ───────────────────────────────────────────────────────────────────
const OtpForm = ({ onSuccess }) => {
  const { requestOtp, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [otp,   setOtp]   = useState('')
  const [step,  setStep]  = useState('email')
  const [info,  setInfo]  = useState('')
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await requestOtp(email)
      setInfo(`A 6-digit code was sent to ${email}`)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Please try again.')
    } finally { setBusy(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await verifyOtp(email, otp)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
    } finally { setBusy(false) }
  }

  if (step === 'email') return (
    <form onSubmit={handleRequestOtp}>
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
      <TextField label="Email address" type="email" fullWidth required
        value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 3 }} />
      <Button type="submit" variant="contained" color="primary" fullWidth size="large"
        disabled={busy} sx={{ py: 1.5, borderRadius: 2 }}>
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Send One-Time Code'}
      </Button>
    </form>
  )

  return (
    <form onSubmit={handleVerifyOtp}>
      {info  && <Alert severity="info"  sx={{ mb: 2, borderRadius: 2 }}>{info}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      <TextField
        label="6-digit code" fullWidth required
        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
        autoFocus sx={{ mb: 3 }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth size="large"
        disabled={busy || otp.length < 6} sx={{ py: 1.5, borderRadius: 2 }}>
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Verify & Sign In'}
      </Button>
      <Button variant="text" fullWidth size="small"
        onClick={() => { setStep('email'); setError(''); setInfo(''); setOtp('') }}
        sx={{ mt: 1.5, textTransform: 'none', color: 'text.secondary', fontSize: '0.84rem' }}>
        ← Use a different email
      </Button>
    </form>
  )
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('otp')

  const oauthError = searchParams.get('error')
  const onSuccess  = () => navigate('/')

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <LeftPanel />

      {/* Right — form panel */}
      <Grid item xs={12} md={7}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: { xs: 3, sm: 5 }, bgcolor: 'background.default' }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 5 }}>
            <MapIcon sx={{ color: '#E05A1B' }} />
            <Typography fontWeight={700} fontSize="1.1rem">
              India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mb: oauthError ? 2 : 3.5, fontSize: '0.95rem' }}>
            Sign in to continue your journey across India.
          </Typography>

          {oauthError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {decodeURIComponent(oauthError)}
            </Alert>
          )}

          {/* Google SSO */}
          <GoogleButton onClick={loginWithGoogle} />

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, fontSize: '0.8rem' }}>
              or continue with email
            </Typography>
          </Divider>

          {/* Tab switcher */}
          <TabSwitcher tab={tab} onChange={setTab} />

          {tab === 'otp' ? <OtpForm onSuccess={onSuccess} /> : <PasswordForm onSuccess={onSuccess} />}

          <Typography textAlign="center" fontSize="0.88rem" color="text.secondary" mt={3.5}>
            No account?{' '}
            <Link to="/register" style={{ color: '#E05A1B', fontWeight: 700, textDecoration: 'none' }}>
              Create one free
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

export default LoginPage
