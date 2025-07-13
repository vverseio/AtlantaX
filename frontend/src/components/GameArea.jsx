import React from 'react';

const GameArea = ({ playerData, onTap }) => {
  if (!playerData) return <div className="container"><p>Loading game data...</p></div>;

  return (
    <div className="container">
      <h2>Game</h2>
      <button
        onClick={onTap}
        style={{
          padding: '20px 40px', // Increased padding
          fontSize: '1.8em',   // Larger font
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',       // No border
          borderRadius: '8px',  // More rounded corners
          cursor: 'pointer',
          display: 'block',     // Block display
          margin: '20px auto',  // Centered with margin
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)' // Added shadow
        }}
      >
        Tap Me!
      </button>
      <div style={{textAlign: 'center', fontSize: '1.2em'}}>
        <p>Coins: <span style={{fontWeight: 'bold'}}>{playerData.coins ?? 0}</span></p>
        <p>Tap Power: <span style={{fontWeight: 'bold'}}>{playerData.tapPower ?? 1}</span></p>
      </div>
    </div>
  );
};

export default GameArea;
