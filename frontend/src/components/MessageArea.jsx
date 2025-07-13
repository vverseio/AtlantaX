import React from 'react';

const MessageArea = ({ message, type }) => {
  if (!message) return null;

  // Basic styling, can be enhanced with CSS classes per type
  const style = {
    padding: '10px',
    margin: '10px auto', // Centered with auto margins
    width: 'fit-content', // Take up space of content
    minWidth: '200px', // Minimum width
    maxWidth: '90%', // Max width relative to parent
    textAlign: 'center',
    borderRadius: '5px',
    border: '1px solid',
    borderColor: type === 'error' ? 'red' : type === 'success' ? 'green' : 'gray',
    backgroundColor: type === 'error' ? '#fdd' : type === 'success' ? '#dfd' : '#eee',
    position: 'fixed', // Fixed position
    top: '20px',       // At the top
    left: '50%',       // Center horizontally
    transform: 'translateX(-50%)', // Adjust for exact centering
    zIndex: 1000,      // Ensure it's on top
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return <div style={style}>{message}</div>;
};

export default MessageArea;
