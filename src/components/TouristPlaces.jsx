// src/components/TouristPlaces.js
import React, {useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import HeroBanner from './TouristPlaceComponent/HeroBanner';

const TouristPlaces = () => {
  const location = useLocation();
  const { stateName } = location.state || { stateName: 'India' }; // Get the state name from location.state

  // Example tourist places for each state
  const touristPlaces = {
    Maharashtra: ['Gateway of India', 'Ajanta and Ellora Caves', 'Marine Drive'],
    Rajasthan: ['Amber Fort', 'Hawa Mahal', 'Lake Pichola'],
    Kerala: ['Alleppey', 'Munnar', 'Kumarakom'],
    // Add more states and their tourist places
  };

  // Get tourist places for the selected state, or fallback to a default message
  const places = touristPlaces[stateName] || [`No tourist places found for ${stateName}.`];

  return (
    <div>
        <HeroBanner stateName={stateName}/>
      <h1>Welcome to {stateName}</h1>
      <ul>
        {places.map((place, idx) => <li key={idx}>{place}</li>)}
      </ul>
    </div>
  );
};

export default TouristPlaces;
