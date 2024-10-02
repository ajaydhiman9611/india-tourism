// src/components/TouristPlaces.js
import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import HeroBanner from './TouristPlaceComponent/HeroBanner';
import TouristPlaceLoader from './Loader/TouristPlacesLoader';
import {apiHelper} from "../helpers/apicalls"

const TouristPlaces = () => {
  const location = useLocation();
  const { stateName } = location.state || { stateName: 'India' }; // Get the state name from location.state
  const [firstTimeloading, setFirstTimeLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    apiHelper({})
  }, [])

  if(firstTimeloading){
    return <TouristPlaceLoader placeName={stateName}/>
  } else if (isLoading){
    return <p>Loading...!</p>
  }
  return (
    <div>
        <HeroBanner stateName={stateName}/>
      <h1>Welcome to {stateName}</h1>
      <ul>
        {/* {places.map((place, idx) => <li key={idx}>{place}</li>)} */}
      </ul>
    </div>
  );
};

export default TouristPlaces;
