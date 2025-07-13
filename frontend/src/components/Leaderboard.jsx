import React from 'react';

const Leaderboard = ({ players, currentSortBy, onSortChange }) => {
  const SortButton = ({ sortBy, children }) => (
    <button
      onClick={() => onSortChange(sortBy)}
      disabled={currentSortBy === sortBy}
      style={{
        marginRight: '10px',
        padding: '8px 12px',
        backgroundColor: currentSortBy === sortBy ? '#007bff' : '#6c757d', // Active color blue, inactive gray
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="container">
      <h2>Leaderboard</h2>
      <div style={{ marginBottom: '15px' }}>
        Sort by:
        <SortButton sortBy="coins">Coins</SortButton>
        <SortButton sortBy="totalTaps">Taps</SortButton>
      </div>
      {(!players || players.length === 0) ? (
        <p>No player data available for the leaderboard yet. Keep tapping!</p>
      ) : (
        <ol style={{ listStyle: 'none', paddingLeft: '0' }}>
          {players.map((player, index) => (
            <li
              key={player._id || player.userId}
              style={{
                borderBottom: '1px solid #eee',
                padding: '10px 5px',
                backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white', // Zebra striping
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{flexBasis: '40%'}}>
                <span style={{fontWeight: 'bold'}}>{index + 1}. {player.userId}</span>
                {player.squadId && <span style={{ marginLeft: '10px', fontSize: '0.85em', color: '#555' }}>({player.squadId.name})</span>}
              </div>
              <div style={{flexBasis: '30%', textAlign: 'right'}}>Coins: {player.coins}</div>
              <div style={{flexBasis: '30%', textAlign: 'right'}}>Taps: {player.totalTaps || 0}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;
