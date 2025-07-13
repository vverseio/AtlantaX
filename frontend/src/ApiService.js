// --- API Service (helper functions for API calls) ---
const apiService = {
  getPlayerData: async () => {
    const response = await fetch('/api/playerdata');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  tap: async () => {
    const response = await fetch('/api/tap', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  purchaseUpgrade: async (upgradeId) => {
    const response = await fetch('/api/purchaseupgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upgradeId }),
    });
    if (!response.ok) { // Check for non-2xx responses that might still be JSON
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  claimDailyReward: async () => {
    const response = await fetch('/api/claimdailyreward', { method: 'POST' });
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  getActiveEvent: async () => {
    const response = await fetch('/api/activeevent');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  createSquad: async (name, description) => {
    const response = await fetch('/api/squads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to create squad'); }
    return response.json();
  },
  getSquads: async () => {
    const response = await fetch('/api/squads');
    if (!response.ok) throw new Error('Failed to fetch squads');
    return response.json();
  },
  joinSquad: async (squadId) => {
    const response = await fetch(`/api/squads/${squadId}/join`, { method: 'POST' });
    if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to join squad'); }
    return response.json();
  },
  leaveSquad: async () => {
    const response = await fetch('/api/squads/leave', { method: 'POST' });
    if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to leave squad'); }
    return response.json();
  },
  getPlayerSquad: async () => {
    const response = await fetch('/api/player/squad');
    if (!response.ok) throw new Error('Failed to fetch player squad');
    return response.json();
  },
  getLeaderboard: async (sortBy = 'coins', limit = 10) => {
    const response = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  }
};

export default apiService;
