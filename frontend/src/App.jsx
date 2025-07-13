import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import './index.css';

import apiService from './ApiService';
import MessageArea from './components/MessageArea';
import GameArea from './components/GameArea';
import UpgradesArea from './components/UpgradesArea';
import DailyRewardArea from './components/DailyRewardArea';
import EventArea from './components/EventArea';
import MySquad from './components/MySquad';
import SquadsList from './components/SquadsList';
import Leaderboard from './components/Leaderboard';

// --- Socket Connection ---
const socket = io('http://localhost:3000');

// --- Main App Component ---
function App() {
  const [playerData, setPlayerData] = useState(null);
  const [availableUpgrades, setAvailableUpgrades] = useState({});
  const [dailyRewardStatus, setDailyRewardStatus] = useState({ canClaim: false, amount: 100 });
  const [eventData, setEventData] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [squads, setSquads] = useState([]);
  const [currentSquad, setCurrentSquad] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardSortBy, setLeaderboardSortBy] = useState('coins');

  const showTempMessage = useCallback((text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  }, []);

  const fetchGameData = useCallback(async () => {
    try {
      const data = await apiService.getPlayerData();
      setPlayerData(data);
      setAvailableUpgrades(data.availableUpgrades || {});
      setDailyRewardStatus(prev => ({ ...prev, canClaim: data.canClaimDailyReward }));
    } catch (error) {
      console.error("Failed to fetch player data:", error);
      showTempMessage(`Error loading player data: ${error.message}`, 'error');
    }
  }, [showTempMessage]);

  const fetchEventData = useCallback(async () => {
    try {
      const data = await apiService.getActiveEvent();
      setEventData(data);
    } catch (error) {
      console.error("Failed to fetch event data:", error);
      showTempMessage(`Error loading event data: ${error.message}`, 'error');
    }
  }, [showTempMessage]);

  const fetchSquadData = useCallback(async () => {
    try {
      const [squadsList, playerSquadData] = await Promise.all([
        apiService.getSquads(),
        apiService.getPlayerSquad()
      ]);
      setSquads(squadsList);
      setCurrentSquad(playerSquadData.squad);
    } catch (error) {
      console.error("Failed to fetch squad data:", error);
      showTempMessage(`Error loading squad data: ${error.message}`, 'error');
    }
  }, [showTempMessage]);

  const fetchLeaderboardData = useCallback(async (sortBy = 'coins') => {
    try {
      const data = await apiService.getLeaderboard(sortBy);
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
      showTempMessage(`Error loading leaderboard: ${error.message}`, 'error');
    }
  }, [showTempMessage]);

  useEffect(() => {
    fetchGameData();
    fetchEventData();
    fetchSquadData();
    fetchLeaderboardData(leaderboardSortBy);

    socket.on('connect', () => console.log('Connected to WebSocket server'));
    socket.on('disconnect', () => console.log('Disconnected from WebSocket server'));
    socket.on('leaderboardUpdate', (data) => {
      if (data.sortBy === leaderboardSortBy) { // Check against current leaderboardSortBy state
        setLeaderboard(data.players);
        showTempMessage(`Leaderboard updated (sorted by ${data.sortBy})!`, 'info', 1500);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('leaderboardUpdate');
    };
  }, [fetchGameData, fetchEventData, fetchSquadData, fetchLeaderboardData, leaderboardSortBy, showTempMessage]);


  const handleTap = async () => {
    try {
      const data = await apiService.tap();
      setPlayerData(prev => ({ ...prev, coins: data.coins, tapPower: data.tapPower, totalTaps: data.totalTaps }));
    } catch (error) {
      console.error("Tap failed:", error);
      showTempMessage(`Tap error: ${error.message}`, 'error');
    }
  };

  const handlePurchaseUpgrade = async (upgradeId) => {
    try {
      const data = await apiService.purchaseUpgrade(upgradeId);
      setPlayerData(data.playerData);
      showTempMessage(data.message, 'success');
    } catch (error) {
      console.error("Upgrade purchase failed:", error);
      showTempMessage(`Upgrade error: ${error.message}`, 'error');
    }
  };

  const handleClaimDailyReward = async () => {
    try {
      const data = await apiService.claimDailyReward();
      setPlayerData(prev => ({ ...prev, coins: data.coins, lastDailyRewardClaimed: data.lastDailyRewardClaimed }));
      setDailyRewardStatus({ ...dailyRewardStatus, canClaim: false });
      showTempMessage(data.message, 'success');
    } catch (error) {
      console.error("Daily reward claim failed:", error);
      showTempMessage(`Reward claim error: ${error.message}`, 'error');
    }
  };

  const handleCreateSquad = async (name, description) => {
    try {
      const data = await apiService.createSquad(name, description);
      showTempMessage(data.message, 'success');
      setCurrentSquad(data.squad);
      setPlayerData(prev => ({ ...prev, squadId: data.squad._id }));
      fetchSquadData(); // Refresh general squad list
    } catch (error) {
      console.error("Create squad failed:", error);
      showTempMessage(`Create squad error: ${error.message}`, 'error');
    }
  };

  const handleJoinSquad = async (squadId) => {
    try {
      const data = await apiService.joinSquad(squadId);
      showTempMessage(data.message, 'success');
      setCurrentSquad(data.squad);
      setPlayerData(prev => ({ ...prev, squadId: data.squad._id }));
      // fetchSquadData(); // No need to fetch all squads again, current player squad is updated
    } catch (error) {
      console.error("Join squad failed:", error);
      showTempMessage(`Join squad error: ${error.message}`, 'error');
    }
  };

  const handleLeaveSquad = async () => {
    try {
      const data = await apiService.leaveSquad();
      showTempMessage(data.message, 'success');
      setCurrentSquad(null);
      setPlayerData(prev => ({ ...prev, squadId: null }));
      // fetchSquadData(); // To refresh available squads list if needed, or rely on currentSquad state
    } catch (error) {
      console.error("Leave squad failed:", error);
      showTempMessage(`Leave squad error: ${error.message}`, 'error');
    }
  };

  const handleLeaderboardSortChange = (newSortBy) => {
    setLeaderboardSortBy(newSortBy);
    fetchLeaderboardData(newSortBy);
  };

  return (
    <>
      <h1>AtlantaX Game</h1>
      <MessageArea message={message.text} type={message.type} />

      {playerData ? (
        <>
          <GameArea playerData={playerData} onTap={handleTap} />
          <DailyRewardArea
            playerData={playerData}
            onClaimReward={handleClaimDailyReward}
            rewardStatus={dailyRewardStatus}
          />
           {currentSquad ? (
            <MySquad squad={currentSquad} onLeaveSquad={handleLeaveSquad} />
          ) : (
            <SquadsList
              squads={squads}
              onJoinSquad={handleJoinSquad}
              onCreateSquad={handleCreateSquad}
              currentSquadId={playerData?.squadId}
              playerData={playerData}
              showMessage={showTempMessage} // Pass showMessage for form validation
            />
          )}
          <UpgradesArea
            playerData={playerData}
            availableUpgrades={availableUpgrades}
            onPurchaseUpgrade={handlePurchaseUpgrade}
          />
        </>
      ) : (
        <div className="container"><p>Loading game data, please wait...</p></div>
      )}

      <EventArea eventData={eventData} />
      <Leaderboard
        players={leaderboard}
        currentSortBy={leaderboardSortBy}
        onSortChange={handleLeaderboardSortChange}
      />
    </>
  );
}

export default App;
