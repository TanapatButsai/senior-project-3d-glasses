import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    navigate('/camera'); // Navigate to the Camera Page
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#000', // Black background
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          color: '#fff', // White text
          fontSize: '36px', // Larger font
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px',
          fontFamily: 'Arial, sans-serif', // Clean font
        }}
      >
        Welcome to the 3D Glasses App
      </h1>
      <button
        onClick={handleCameraClick}
        style={{
          padding: '15px 40px', // Button padding
          backgroundColor: '#1DB954', // Modern green (Spotify-like)
          color: '#000', // Black text for contrast
          border: 'none',
          borderRadius: '50px', // Rounded button
          cursor: 'pointer',
          fontSize: '18px', // Text size
          fontWeight: '600', // Semi-bold font
          transition: 'all 0.3s ease', // Smooth transition
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)', // Subtle shadow
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#17a74a')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#1DB954')}
      >
        Open Camera
      </button>
    </div>
  );
};

export default WelcomePage;

