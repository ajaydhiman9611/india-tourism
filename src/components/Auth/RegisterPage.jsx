import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Grid, TextField, Button, Typography, Alert, Divider,
  CircularProgress, alpha, InputAdornment, IconButton,
} from '@mui/material'
import MapIcon           from '@mui/icons-material/Map'
import VisibilityIcon    from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon   from '@mui/icons-material/CheckCircle'
import { useAuth } from '../../context/AuthContext'

// ── Google button ──────────────────────────────────────────────────────────────
const GoogleButton = ({ onClick, disabled }) => (
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
    Sign up with Google
  </Button>
)

// ── Left decorative panel ──────────────────────────────────────────────────────
const PERKS = [
  'AI-generated personalised itineraries',
  'Save & share trips with friends',
  'Explore all 36 states & UTs',
  'Discover UNESCO Heritage Sites',
]

const LeftPanel = () => (
  <Grid item xs={false} md={5}
    sx={{
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'linear-gradient(160deg, #1B7A3E 0%, #145C2F 55%, #1C1C2E 100%)',
      p: 6, position: 'relative', overflow: 'hidden',
    }}
  >
    <Box sx={{ position: 'absolute', top: -100, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,183,71,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Logo */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
      <MapIcon sx={{ color: '#FFB347', fontSize: 28 }} />
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
        India<Box component="span" sx={{ color: '#FFB347' }}>Tourism</Box>
      </Typography>
    </Box>

    {/* Headline */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography sx={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFB347', mb: 1.5 }}>
        Why join us?
      </Typography>
      <Typography sx={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '1.7rem', lineHeight: 1.4, mb: 3.5 }}>
        Begin your incredible journey through India
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {PERKS.map(perk => (
          <Box key={perk} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircleIcon sx={{ color: '#FFB347', fontSize: 18, flexShrink: 0 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.88rem' }}>{perk}</Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Bottom note */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
        Free forever. No credit card required.
      </Typography>
    </Box>
  </Grid>
)

// ── Main RegisterPage ──────────────────────────────────────────────────────────
const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form,   setForm]   = useState({ name: '', email: '', password: '', mobile: '' })
  const [showPw, setShowPw] = useState(false)
  const [error,  setError]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError(''); setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.mobile.trim() || undefined)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Grid container sx={{ height: 'calc(100vh - 68px - env(safe-area-inset-top))', overflow: 'hidden' }}>
      <LeftPanel />

      {/* Right — form panel */}
      <Grid item xs={12} md={7}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: { xs: 3, sm: 5 }, bgcolor: 'background.default', overflowY: 'auto' }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 5 }}>
            <MapIcon sx={{ color: '#E05A1B' }} />
            <Typography fontWeight={700} fontSize="1.1rem">
              India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Create your account</Typography>
          <Typography color="text.secondary" sx={{ mb: 3.5, fontSize: '0.95rem' }}>
            Free forever · No credit card required.
          </Typography>

          {/* Google SSO */}
          <GoogleButton onClick={loginWithGoogle} />

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, fontSize: '0.8rem' }}>
              or register with email
            </Typography>
          </Divider>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full name" fullWidth required
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email address" type="email" fullWidth required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password" type={showPw ? 'text' : 'password'} fullWidth required
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              helperText="Minimum 8 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end" tabIndex={-1}>
                      {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Mobile number" type="tel" fullWidth
              value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              placeholder="+91 98765 43210"
              helperText="Optional — for account recovery only"
              inputProps={{ maxLength: 15 }}
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth size="large"
              disabled={loading} sx={{ py: 1.5, borderRadius: 2 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Typography textAlign="center" fontSize="0.88rem" color="text.secondary" mt={3.5}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#E05A1B', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

export default RegisterPage
