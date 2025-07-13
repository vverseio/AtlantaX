import React, { useState } from 'react';

const SquadsList = ({ squads, onJoinSquad, onCreateSquad, currentSquadId, playerData, showMessage }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadDescription, setNewSquadDescription] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newSquadName.trim()) {
      if (showMessage) showMessage('Squad name is required.', 'error');
      else alert('Squad name is required.');
      return;
    }
    // The actual creation and message display will be handled by `onCreateSquad` prop from App.jsx
    await onCreateSquad(newSquadName, newSquadDescription);
    setNewSquadName('');
    setNewSquadDescription('');
    setShowCreateForm(false); // Hide form after submission attempt
  };

  // Player must exist (playerData is not null) and not be in a squad (currentSquadId is null)
  const canCreateOrJoinSquads = playerData && !currentSquadId;

  return (
    <div className="container">
      <h2>Squads</h2>
      {canCreateOrJoinSquads && (
         <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              marginBottom: '15px',
              backgroundColor: '#17a2b8',
              color: 'white',
              padding: '10px 15px'
            }}
          >
          {showCreateForm ? 'Cancel Creation' : 'Create New Squad'}
        </button>
      )}

      {canCreateOrJoinSquads && showCreateForm && (
        <form onSubmit={handleCreateSubmit} style={{marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px'}}>
          <h3>Create Squad</h3>
          <div style={{marginBottom: '10px'}}>
            <label htmlFor="squadName" style={{display: 'block', marginBottom: '5px'}}>Name:</label>
            <input
              type="text"
              id="squadName"
              value={newSquadName}
              onChange={(e) => setNewSquadName(e.target.value)}
              required
              style={{width: 'calc(100% - 22px)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
            />
          </div>
          <div style={{marginBottom: '15px'}}>
            <label htmlFor="squadDesc" style={{display: 'block', marginBottom: '5px'}}>Description (optional):</label>
            <input
              type="text"
              id="squadDesc"
              value={newSquadDescription}
              onChange={(e) => setNewSquadDescription(e.target.value)}
              style={{width: 'calc(100% - 22px)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
            />
          </div>
          <button type="submit" style={{backgroundColor: '#28a745', color: 'white', padding: '10px 20px'}}>Create</button>
        </form>
      )}

      <h3>Available Squads</h3>
      {squads.length === 0 && <p>No squads available. Why not create one?</p>}
      {squads.map(squad => (
        <div
          key={squad._id}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h4 style={{marginTop: 0, marginBottom: '5px'}}>{squad.name}</h4>
          <p style={{fontSize: '0.9em', margin: '5px 0'}}>Leader: {squad.leader?.userId || 'N/A'}</p>
          <p style={{fontSize: '0.9em', margin: '5px 0 10px 0'}}>Members: {squad.members?.length || 0}</p>
          {canCreateOrJoinSquads && (
            <button
              onClick={() => onJoinSquad(squad._id)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '8px 15px'
              }}
            >
              Join Squad
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SquadsList;
