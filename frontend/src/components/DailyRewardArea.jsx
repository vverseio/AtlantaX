import React from 'react';

const DailyRewardArea = ({ playerData, onClaimReward, rewardStatus }) => {
  if (!playerData) return <div className="container"><h2>Daily Reward</h2><p>Loading reward status...</p></div>;

  return (
    <div className="container">
      <h2>Daily Reward</h2>
      {rewardStatus.canClaim ? (
        <button
          onClick={onClaimReward}
          style={{
            backgroundColor: '#ffc107',
            color: '#333',
            padding: '10px 20px',
            fontSize: '1.1em', // Slightly larger font
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Subtle shadow
          }}
        >
          Claim Daily Reward ({rewardStatus.amount} coins)!
        </button>
      ) : (
        <p style={{fontStyle: 'italic', color: '#555'}}>Daily reward claimed for today. Come back tomorrow!</p>
      )}
    </div>
  );
};

export default DailyRewardArea;
