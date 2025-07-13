import React from 'react';

const MySquad = ({ squad, onLeaveSquad }) => {
  if (!squad) {
    // This case should ideally be handled by conditional rendering in App.jsx
    // but as a fallback:
    return (
      <div className="container">
        <h2>My Squad</h2>
        <p>You are not currently in a squad.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ border: '2px solid #007bff', backgroundColor: '#e7f5ff' }}>
      <h2>My Squad: {squad.name}</h2>
      <p>{squad.description || 'No description.'}</p>
      <p><strong>Leader:</strong> {squad.leader?.userId || 'Unknown'}</p>
      <p><strong>Members ({squad.members?.length || 0}):</strong></p>
      <ul style={{listStyle: 'none', paddingLeft: '0'}}>
        {squad.members?.map(member => (
          <li
            key={member._id || member.userId}
            style={{
              padding: '5px 0',
              borderBottom: '1px solid #cce7ff',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>{member.userId}</span>
            <span>Coins: {member.coins ?? 'N/A'}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onLeaveSquad}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          marginTop: '15px',
          padding: '10px 20px'
        }}
      >
        Leave Squad
      </button>
    </div>
  );
};

export default MySquad;
