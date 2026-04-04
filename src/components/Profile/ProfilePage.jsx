import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, TextField, Button, Divider,
  Alert, CircularProgress, Avatar, Chip, InputAdornment, IconButton,
  Stack,
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import GoogleIcon from '@mui/icons-material/Google'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAuth } from '../../context/AuthContext'

// ── Section card ──────────────────────────────────────────────────────────────
const Section = ({ title, subtitle, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, mb: 3 }}>
    <Typography variant="h6" fontWeight={700} gutterBottom>{title}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary" mb={2.5}>{subtitle}</Typography>}
    {children}
  </Paper>
)

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const navigate = useNavigate()

  const isGoogle = user?.authProvider === 'google'

  // ── Profile info state ───────────────────────────────────────────────────────
  const [profileForm,  setProfileForm]  = useState({ name: user?.name || '', mobile: user?.mobile || '' })
  const [profileBusy,  setProfileBusy]  = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileOk,    setProfileOk]    = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileError(''); setProfileOk(false); setProfileBusy(true)
    try {
      await updateProfile({ name: profileForm.name.trim(), mobile: profileForm.mobile.trim() || undefined })
      setProfileOk(true)
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Could not update profile. Please try again.')
    } finally { setProfileBusy(false) }
  }

  // ── Change password state ────────────────────────────────────────────────────
  const [pwForm,  setPwForm]  = useState({ current: '', next: '', confirm: '' })
  const [showPw,  setShowPw]  = useState({ current: false, next: false, confirm: false })
  const [pwBusy,  setPwBusy]  = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwOk,    setPwOk]    = useState(false)

  const togglePw = (field) => setShowPw(v => ({ ...v, [field]: !v[field] }))

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    setPwError(''); setPwOk(false); setPwBusy(true)
    try {
      await changePassword(pwForm.current, pwForm.next)
      setPwOk(true)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Could not change password. Please try again.')
    } finally { setPwBusy(false) }
  }

  const pwField = (field, label) => (
    <TextField
      label={label}
      type={showPw[field] ? 'text' : 'password'}
      fullWidth required
      value={pwForm[field]}
      onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => togglePw(field)} edge="end">
              {showPw[field] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )

  if (!user) return null

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 5 } }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        Back
      </Button>

      {/* Avatar + account type */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: '#E05A1B', fontSize: '1.6rem' }}>
          {user.name?.[0]?.toUpperCase() || <AccountCircleIcon fontSize="large" />}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>{user.name}</Typography>
          <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            {isGoogle && (
              <Chip
                icon={<GoogleIcon sx={{ fontSize: '14px !important' }} />}
                label="Google account"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* ── Profile info ── */}
      <Section
        title="Personal information"
        subtitle="Update your name and mobile number."
      >
        <form onSubmit={handleProfileSave}>
          {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
          {profileOk    && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}
          <Stack spacing={2.5}>
            <TextField
              label="Full name" fullWidth required
              value={profileForm.name}
              onChange={e => { setProfileForm(f => ({ ...f, name: e.target.value })); setProfileOk(false) }}
            />
            <TextField
              label="Mobile number (optional)" fullWidth
              type="tel"
              value={profileForm.mobile}
              onChange={e => { setProfileForm(f => ({ ...f, mobile: e.target.value })); setProfileOk(false) }}
              inputProps={{ maxLength: 15 }}
              helperText="Used to help with travel bookings"
            />
          </Stack>
          <Button
            type="submit" variant="contained" color="primary"
            disabled={profileBusy || !profileForm.name.trim()}
            sx={{ mt: 3, borderRadius: 2, textTransform: 'none', px: 4 }}
          >
            {profileBusy ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
          </Button>
        </form>
      </Section>

      {/* ── Change password (hidden for Google users) ── */}
      {!isGoogle && (
        <Section
          title="Change password"
          subtitle="Choose a strong password and don't reuse it for other accounts."
        >
          <form onSubmit={handleChangePassword}>
            {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
            {pwOk    && <Alert severity="success" sx={{ mb: 2 }}>Password changed! You've been signed in with the new password.</Alert>}
            <Stack spacing={2.5}>
              {pwField('current', 'Current password')}
              {pwField('next',    'New password')}
              {pwField('confirm', 'Confirm new password')}
            </Stack>
            <Button
              type="submit" variant="contained" color="primary"
              disabled={pwBusy || !pwForm.current || !pwForm.next || !pwForm.confirm}
              sx={{ mt: 3, borderRadius: 2, textTransform: 'none', px: 4 }}
            >
              {pwBusy ? <CircularProgress size={20} color="inherit" /> : 'Change password'}
            </Button>
          </form>
        </Section>
      )}

      {/* ── Account info ── */}
      <Section title="Account information">
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body2" fontWeight={500}>{user.email}</Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Sign-in method</Typography>
            <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
              {isGoogle ? 'Google' : 'Email & Password / OTP'}
            </Typography>
          </Box>
          {user.createdAt && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Member since</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Section>
    </Container>
  )
}

export default ProfilePage
