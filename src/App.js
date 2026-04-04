import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import IndiaMap from './components/Homepage_v2';
import StateDetails from './components/StateDetails';
import ItineraryPlanner from './components/ItineraryPlanner';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import SearchPage from './components/Search/SearchPage';
import PlaceDetail from './components/PlaceDetail/PlaceDetail';
import SharedItinerary from './components/SharedItinerary/SharedItinerary';
import AdminDashboard from './components/Admin/AdminDashboard';
import {
  Button, Container, Grid, IconButton, Menu, MenuItem,
  Avatar, Tooltip, InputBase, Box, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from './context/AuthContext';

const App = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStateClick = (stateName) => {
    navigate(`/state/${stateName}`, { state: { stateName } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (<>
    <header style={{ zIndex: 1000, position: "fixed", top: 0, width: "100%", backgroundColor: 'black' }}>
      <Container sx={{ py: 1 }}>
        <Grid container spacing={1} sx={{ alignItems: "center" }}>
          {/* Logo */}
          <Grid item xs={2}>
            <Box
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer', color: 'white', fontSize: '1.2rem', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              Indian Tourism
            </Box>
          </Grid>

          {/* Search bar */}
          <Grid item xs={4}>
            <form onSubmit={handleSearchSubmit}>
              <Box sx={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 1, px: 1, alignItems: 'center' }}>
                <InputBase
                  placeholder="Search places…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ color: 'white', flex: 1, fontSize: '0.9rem' }}
                />
                <IconButton type="submit" size="small" sx={{ color: 'white' }}>
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Box>
            </form>
          </Grid>

          {/* Nav buttons */}
          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
            <Button onClick={() => navigate('/itineraryPlanner')} variant="contained" color="primary" size="small">
              Plan Trip
            </Button>

            {user?.isAdmin && (
              <Tooltip title="Admin Dashboard">
                <IconButton onClick={() => navigate('/admin')} sx={{ color: 'white' }}>
                  <AdminPanelSettingsIcon />
                </IconButton>
              </Tooltip>
            )}

            {user ? (
              <>
                <Tooltip title={user.name}>
                  <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ color: 'white' }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#1976d2' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem disabled>
                    <Box>
                      <Box fontWeight={600}>{user.name}</Box>
                      <Box fontSize="0.8rem" color="text.secondary">{user.email}</Box>
                    </Box>
                  </MenuItem>
                  <Divider />
                  {user.isAdmin && (
                    <MenuItem onClick={() => { navigate('/admin'); setAnchorEl(null) }}>
                      <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: '1rem' }} /> Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { logout(); setAnchorEl(null); navigate('/') }}>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="outlined" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')} variant="contained" size="small" color="success">
                  Register
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </header>

    <Container sx={{ marginTop: "80px", mb: 6 }}>
      <Routes>
        <Route path="/" element={<IndiaMap onStateClick={handleStateClick} />} />
        <Route path="/state/:stateName" element={<StateDetails />} />
        <Route path="/itineraryPlanner" element={<ItineraryPlanner />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/place/:placeId" element={<PlaceDetail />} />
        <Route path="/itinerary/:shareToken" element={<SharedItinerary />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Container>

    <footer className="text-center p-2 pt-3" style={{ zIndex: 1, position: "fixed", bottom: 0, width: "100%", backgroundColor: '#f8f9fa', borderTop: '1px solid #e7e7e7' }}>
      <p style={{ marginBottom: "0px" }}>© {new Date().getFullYear()} Indian Tourism. All rights reserved.</p>
    </footer>
  </>);
};

export default App;
