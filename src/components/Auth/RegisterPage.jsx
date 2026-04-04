import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Grid, TextField, Button, Typography, Alert, Divider, CircularProgress, alpha
} from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import { useAuth } from '../../context/AuthContext'

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
    Sign up with Google
  </Button>
)

const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.mobile || undefined)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left decorative */}
      <Grid item xs={false} md={6}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: 'linear-gradient(160deg, #1B7A3E 0%, #145C2F 50%, #1C1C2E 100%)',
          p: 6, position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: 40, left: 48, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapIcon sx={{ color: '#FFB347', fontSize: 28 }} />
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
            India<Box component="span" sx={{ color: '#FFB347' }}>Tourism</Box>
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFB347', mb: 1 }}>Join us</Typography>
          <Typography variant="h3" sx={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '2rem', lineHeight: 1.4, mb: 2 }}>
            Begin your incredible journey through India
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            Save favourites, write reviews, and create shareable itineraries.
          </Typography>
        </Box>
      </Grid>

      {/* Right form */}
      <Grid item xs={12} md={6}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'background.default' }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
            <MapIcon sx={{ color: '#E05A1B' }} />
            <Typography fontWeight={700} fontSize="1.1rem">
              India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={700} gutterBottom>Create your account</Typography>
          <Typography color="text.secondary" mb={4}>Free forever. No credit card required.</Typography>

          {/* Google SSO */}
          <GoogleButton onClick={loginWithGoogle} />

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>or register with email</Typography>
          </Divider>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField label="Full name" fullWidth required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} sx={{ mb: 2 }} />
            <TextField label="Email address" type="email" fullWidth required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} sx={{ mb: 2 }} />
            <TextField
              label="Mobile number" type="tel" fullWidth value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              placeholder="+91 98765 43210"
              helperText="Optional — used only for account recovery"
              sx={{ mb: 2 }}
            />
            <TextField label="Password" type="password" fullWidth required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              helperText="At least 8 characters recommended"
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" color="secondary" fullWidth size="large"
              disabled={loading} sx={{ py: 1.5, borderRadius: 2, mb: 2 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Typography textAlign="center" fontSize="0.9rem">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#E05A1B', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

export default RegisterPage
