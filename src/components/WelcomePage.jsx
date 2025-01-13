import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    navigate('/camera'); // Navigate to the Camera Page
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
    
      <h1>Welcome to the 3D Glasses App</h1>
      <button
        onClick={handleCameraClick}
        style={{
          padding: '15px 30px', // Larger button
          backgroundColor: '#007BFF', // Blue color
          color: '#fff',
          border: 'none',
          borderRadius: '8px', // Rounded corners
          cursor: 'pointer',
          fontSize: '18px', // Bigger font size
          fontWeight: 'bold', // Bold text
          marginTop: '20px', // Space from the title
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
          transition: 'all 0.3s ease', // Smooth hover effect
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#007BFF')}
      >
        Open Camera
      </button>

    </div>
  );
};

export default WelcomePage;
