// src/App.js
import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import IndiaMap from './components/Homepage';
import TouristPlaces from './components/TouristPlaces';

const App = () => {
  const navigate = useNavigate(); // This handles navigation

  const handleStateClick = (stateName) => {
    console.log("On click :: ", stateName)
    // Navigate to the tourist places page with the clicked state name
    navigate(`/tourist-places`, { state: { stateName } });
  };

  return (
    <Routes>
      <Route path="/" element={<IndiaMap onStateClick={handleStateClick} />} />
      <Route path="/tourist-places" element={<TouristPlaces />} />
    </Routes>
  );
};

export default App;
