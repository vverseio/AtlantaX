import React from 'react';

const UpgradesArea = ({ playerData, availableUpgrades, onPurchaseUpgrade }) => {
  if (!playerData || !availableUpgrades || Object.keys(availableUpgrades).length === 0) {
    return <div className="container"><h2>Upgrades</h2><p>Loading upgrades or no upgrades available...</p></div>;
  }

  return (
    <div className="container">
      <h2>Upgrades</h2>
      {Object.entries(availableUpgrades).map(([id, upgrade]) => (
        <div
          key={id}
          style={{
            border: '1px solid #ddd',
            padding: '15px', // Increased padding
            marginBottom: '15px', // Increased margin
            borderRadius: '8px', // Rounded corners
            backgroundColor: '#f9f9f9' // Light background for each item
          }}
        >
          <h4 style={{marginTop: 0, marginBottom: '5px'}}>{upgrade.name}</h4>
          <p style={{fontSize: '0.9em', margin: '5px 0'}}>{upgrade.description}</p>
          <p style={{fontWeight: 'bold', margin: '5px 0 10px 0'}}>Cost: {upgrade.cost} coins</p>
          <button
            onClick={() => onPurchaseUpgrade(id)}
            disabled={playerData.coins < upgrade.cost || (id === 'doubleTap' && playerData.upgrades?.includes(id))} // Example for non-repeatable
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 15px', // Standard button padding
              fontSize: '1em',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              opacity: (playerData.coins < upgrade.cost || (id === 'doubleTap' && playerData.upgrades?.includes(id))) ? 0.6 : 1 // Dim if disabled
            }}
          >
            Purchase
          </button>
        </div>
      ))}
    </div>
  );
};

export default UpgradesArea;
