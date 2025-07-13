import React from 'react';

const EventArea = ({ eventData }) => {
  if (!eventData) return <div className="container"><h2>Current Event</h2><p>Loading event info...</p></div>;

  if (!eventData.event) {
    return (
      <div className="container">
        <h2>Current Event</h2>
        <p>{eventData.message || 'No active events.'}</p>
      </div>
    );
  }

  const { name, description, endTime } = eventData.event;
  return (
    <div className="container" style={{backgroundColor: '#fff3cd', borderLeft: '5px solid #ffeeba'}}>
      <h2>Current Event</h2>
      <h3 style={{marginTop: 0, color: '#856404'}}>{name}</h3>
      <p>{description}</p>
      <p><em>Ends on: {new Date(endTime).toLocaleDateString()}</em></p>
    </div>
  );
};

export default EventArea;
