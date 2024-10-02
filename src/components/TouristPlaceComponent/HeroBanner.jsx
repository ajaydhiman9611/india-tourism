// src/components/HeroBanner.js
import React from 'react';
import './TouristPlaceComponent.scss'; // Import the CSS file for styling

const HeroBanner = ({ imageUrl, header, description }) => {
  return (
    <div className="touristPlaceComponents">
        <div className="hero-banner" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="hero-content">
            <h1 className="hero-header">{header}</h1>
            <p className="hero-description">{description}</p>
        </div>
        </div>
    </div>
  );
};

export default HeroBanner;
