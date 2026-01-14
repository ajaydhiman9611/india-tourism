// src/App.js
import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import IndiaMap from './components/Homepage_v2';
import StateDetails from './components/StateDetails';
import ItineraryPlanner from './components/ItineraryPlanner';
import { Button, Container, Grid } from '@mui/material';

const App = () => {
  const navigate = useNavigate(); // This handles navigation

  const handleStateClick = (stateName) => {
    console.log("On click :: ", stateName)
    // Navigate to the tourist places page with the clicked state name
    navigate(`/${stateName}`, { state: { stateName } });
  };

  return (<>
      <header className="text-center p-2" style={{ zIndex: 1000, position: "fixed", top: 0, width: "100%", backgroundColor: 'black', color: ""}} >
      <Container  sx={{ mt: 1, mb: 1, pl: 1 }}>
        <Grid container spacing={12} sx={{alignItems: "center"}}>
          <Grid item size={3} sx={{justifyContent: "flex-start"}}>
            <h6 style={{color: "white"}} className="display-6">Indian Tourism</h6>
          </Grid>
          <Grid item size={5}>
            <p style={{color: "white"}} className="lead">Discover the beauty of India and plan your adventure.</p>
          </Grid>
          <Grid item size={3} sx={{justifyContent: "center", alignItems: "center"}}>
            <Button onClick={() => navigate('/itineraryPlanner')} variant="contained" color="primary" size="large" fullWidth>
              Plan your trip
            </Button>
          </Grid>
        </Grid>
      </Container>
      </header>
      <Container sx={{marginTop: "150px"}}>
        <Routes>
          <Route path="/" element={<IndiaMap onStateClick={handleStateClick} />} />
          <Route path="/state/:stateName" element={<StateDetails />} />
          <Route path="/itineraryPlanner" element={<ItineraryPlanner />} />
        </Routes>
      </Container>
      <footer className="text-center p-2 pt-3" style={{ zIndex: 1, position: "fixed", bottom: 0, width: "100%", backgroundColor: '#f8f9fa', borderTop: '1px solid #e7e7e7'}}>
        <p style={{marginBottom: "0px"}}>© {new Date().getFullYear()} Indian Tourism. All rights reserved.</p>
      </footer>
    </>
  );
};

export default App;
