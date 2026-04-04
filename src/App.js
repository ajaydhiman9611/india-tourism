import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import IndiaMap from './components/Homepage_v2';
import StateDetails from './components/StateDetails';
import ItineraryPlanner from './components/ItineraryPlanner';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import ProfilePage from './components/Profile/ProfilePage';
import SearchPage from './components/Search/SearchPage';
import PlaceDetail from './components/PlaceDetail/PlaceDetail';
import SharedItinerary from './components/SharedItinerary/SharedItinerary';
import AdminDashboard from './components/Admin/AdminDashboard';
import MyItinerariesDialog from './components/MyItineraries/MyItinerariesDialog';
import {
  AppBar, Toolbar, Box, Container, Button, IconButton,
  InputBase, Avatar, Menu, MenuItem, Divider, Tooltip,
  useScrollTrigger, Slide, alpha, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  useMediaQuery, useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from './context/AuthContext';

// Hide header on scroll down
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

const HEADER_HEIGHT = 68;

// ── Google OAuth callback page ─────────────────────────────────────────────────
// Reads ?token= and ?refreshToken= from URL, persists them, then redirects home.
const AuthCallbackPage = () => {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token        = params.get('token');
    const refreshToken = params.get('refreshToken');
    const error        = params.get('error');

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }
    if (token) {
      loginWithToken(token, refreshToken);
    }
    navigate('/', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
};

// ── Mobile number prompt (shown once after Google sign-in) ────────────────────
const MobilePromptDialog = ({ open, onClose }) => {
  const { updateMobile } = useAuth();
  const [mobile, setMobile]   = useState('');
  const [busy,   setBusy]     = useState(false);

  const handleSave = async () => {
    if (!mobile.trim()) { onClose(); return; }
    setBusy(true);
    try {
      await updateMobile(mobile.trim());
    } catch { /* non-critical */ } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>One last thing 👋</DialogTitle>
      <DialogContent>
        <Box sx={{ color: 'text.secondary', mb: 2, fontSize: '0.9rem' }}>
          Add your mobile number so we can assist with travel bookings. You can always do this later in your profile.
        </Box>
        <TextField
          label="Mobile number" type="tel" fullWidth autoFocus
          value={mobile} onChange={e => setMobile(e.target.value)}
          inputProps={{ maxLength: 15 }}
          placeholder="+91 98765 43210"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
          Skip for now
        </Button>
        <Button
          variant="contained" color="primary" onClick={handleSave}
          disabled={busy} sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {busy ? <CircularProgress size={18} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itinerariesOpen, setItinerariesOpen] = useState(false);

  // Show mobile prompt once after Google sign-in when mobile is missing
  const [mobilePromptOpen, setMobilePromptOpen] = useState(false);
  const [mobilePromptShown, setMobilePromptShown] = useState(false);
  useEffect(() => {
    if (user && user.authProvider === 'google' && !user.mobile && !mobilePromptShown) {
      setMobilePromptShown(true);
      // Small delay so the page settles first
      setTimeout(() => setMobilePromptOpen(true), 800);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : '/search');
    setSearchQuery('');
  };

  const isHome = location.pathname === '/';
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            background: isHome
              ? 'linear-gradient(to bottom, rgba(28,28,46,0.95), rgba(28,28,46,0.85))'
              : 'rgba(28,28,46,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            height: HEADER_HEIGHT,
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 } }}>
            <Toolbar disableGutters sx={{ height: HEADER_HEIGHT, gap: { xs: 1, sm: 2 } }}>

              {/* Logo */}
              <Box
                onClick={() => navigate('/')}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  cursor: 'pointer', userSelect: 'none', flexShrink: 0,
                  '&:hover .logo-icon': { transform: 'rotate(-8deg) scale(1.1)' },
                }}
              >
                <MapIcon className="logo-icon"
                  sx={{ color: '#E05A1B', fontSize: 26, transition: 'transform 0.25s ease' }} />
                <Box>
                  <Box sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.05rem' }, lineHeight: 1.1 }}>
                    India<Box component="span" sx={{ color: '#E05A1B' }}>Tourism</Box>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, color: 'rgba(255,255,255,0.45)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Incredible India
                  </Box>
                </Box>
              </Box>

              {/* Search — full pill on sm+, icon-only tap on xs */}
              {isMobile ? (
                <IconButton onClick={() => navigate('/search')} size="small"
                  sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#E05A1B' } }}>
                  <SearchIcon />
                </IconButton>
              ) : (
                <Box component="form" onSubmit={handleSearchSubmit}
                  sx={{
                    flex: 1, maxWidth: 420,
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '999px', px: 2, py: 0.5,
                    border: '1px solid rgba(255,255,255,0.12)',
                    transition: 'all 0.2s ease',
                    '&:focus-within': {
                      background: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(224,90,27,0.5)',
                      boxShadow: '0 0 0 3px rgba(224,90,27,0.15)',
                    },
                  }}
                >
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, mr: 1 }} />
                  <InputBase placeholder="Search destinations…" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    sx={{ color: 'white', flex: 1, fontSize: '0.88rem',
                      '& input::placeholder': { color: 'rgba(255,255,255,0.4)' } }} />
                </Box>
              )}

              <Box sx={{ flex: 1 }} />

              {/* Plan a Trip — text on sm+, icon only on xs */}
              {isMobile ? (
                <Tooltip title="Plan a Trip">
                  <IconButton onClick={() => navigate('/itineraryPlanner')} size="small"
                    sx={{ color: '#E05A1B' }}>
                    <FlightTakeoffIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Button onClick={() => navigate('/itineraryPlanner')}
                  startIcon={<FlightTakeoffIcon sx={{ fontSize: '1rem !important' }} />}
                  variant="contained" color="primary" size="small"
                  sx={{ borderRadius: '999px', px: 2.5, py: 0.8, flexShrink: 0 }}>
                  Plan a Trip
                </Button>
              )}

              {user?.isAdmin && !isMobile && (
                <Tooltip title="Admin Dashboard">
                  <IconButton onClick={() => navigate('/admin')} size="small"
                    sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#E05A1B' } }}>
                    <AdminPanelSettingsIcon />
                  </IconButton>
                </Tooltip>
              )}

              {user ? (
                <>
                  {/* My Itineraries — hidden on xs (accessible via avatar menu) */}
                  {!isMobile && (
                    <Tooltip title="My saved itineraries">
                      <IconButton onClick={() => setItinerariesOpen(true)} size="small"
                        sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#E05A1B' } }}>
                        <BookmarksIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={user.name}>
                    <IconButton onClick={e => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0.5 }}>
                      <Avatar sx={{
                        width: 32, height: 32, fontSize: '0.82rem', fontWeight: 700,
                        background: 'linear-gradient(135deg, #E05A1B, #F07A45)',
                        border: '2px solid rgba(255,255,255,0.2)',
                      }}>
                        {user.name?.[0]?.toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                    PaperProps={{ elevation: 4, sx: { mt: 1.5, minWidth: 200, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' } }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Box sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</Box>
                      <Box sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.2 }}>{user.email}</Box>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}
                      sx={{ gap: 1.5, fontSize: '0.9rem' }}>
                      <AccountCircleIcon fontSize="small" sx={{ color: '#E05A1B' }} />
                      My Profile
                    </MenuItem>
                    <MenuItem onClick={() => { setItinerariesOpen(true); setAnchorEl(null); }}
                      sx={{ gap: 1.5, fontSize: '0.9rem' }}>
                      <BookmarksIcon fontSize="small" sx={{ color: '#E05A1B' }} />
                      My Itineraries
                    </MenuItem>
                    {user.isAdmin && (
                      <MenuItem onClick={() => { navigate('/admin'); setAnchorEl(null); }}
                        sx={{ gap: 1.5, fontSize: '0.9rem' }}>
                        <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#E05A1B' }} />
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => { logout(); setAnchorEl(null); navigate('/'); }}
                      sx={{ gap: 1.5, fontSize: '0.9rem', color: 'error.main' }}>
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => navigate('/login')} size="small"
                    sx={{ color: 'rgba(255,255,255,0.85)', borderRadius: '999px', px: 2,
                      '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/register')} variant="outlined" size="small"
                    sx={{ borderRadius: '999px', px: 2, borderColor: 'rgba(255,255,255,0.3)', color: 'white',
                      '&:hover': { borderColor: '#E05A1B', background: alpha('#E05A1B', 0.1) } }}>
                    Register
                  </Button>
                </Box>
              )}

            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Spacer — only on non-home pages */}
      {!isHome && <Box sx={{ height: HEADER_HEIGHT }} />}

      <Routes>
        <Route path="/" element={<IndiaMap />} />
        <Route path="/state/:stateName" element={<StateDetails />} />
        <Route path="/itineraryPlanner" element={<ItineraryPlanner />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/place/:placeId" element={<PlaceDetail />} />
        <Route path="/itinerary/:shareToken" element={<SharedItinerary />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      {/* My Itineraries dialog */}
      <MyItinerariesDialog open={itinerariesOpen} onClose={() => setItinerariesOpen(false)} />

      {/* Mobile number prompt for Google sign-in users */}
      <MobilePromptDialog open={mobilePromptOpen} onClose={() => setMobilePromptOpen(false)} />

      {/* Footer — hidden on auth pages (they are exact-height, no room for footer) */}
      {!isAuthPage && (
        <Box component="footer"
          sx={{ background: '#1C1C2E', color: 'rgba(255,255,255,0.5)', textAlign: 'center',
            py: 1, fontSize: '0.82rem', mt: 'auto' }}>
          © {new Date().getFullYear()} IndiaExplore · Made with ♥ for incredible India
        </Box>
      )}
    </>
  );
};

export default App;
