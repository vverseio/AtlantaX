const express = require('express');
const path = require('path');
const http = require('http'); // Required for Socket.IO
const { Server } = require("socket.io"); // Import Server from socket.io
const { connectDB, Player, Squad } = require('./db'); // Import DB connection and models (Squad might be needed)

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, { // Initialize Socket.IO server
  cors: {
    // In production, you should restrict this to your frontend's actual domain(s)
    // For example, via an environment variable: process.env.CLIENT_URL || "http://localhost:5173"
    // For wider initial testability, allowing '*' but this is NOT recommended for actual production.
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// --- Connect to MongoDB ---
connectDB().catch(err => {
  console.error("Failed to connect to MongoDB, server not started.", err);
  process.exit(1); // Exit if DB connection fails at startup
});
// --- End MongoDB Connection ---

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
// Serve static files from the 'public' directory (if any general static assets are needed)
app.use(express.static(path.join(__dirname, '..', '..', 'public')));


// API routes should be defined before the catch-all route for React
const apiRouter = express.Router();
app.use(express.json()); // Middleware to parse JSON bodies for API routes
// (apiRouter definitions will be below)

// Placeholder for API routes --> This line is effectively replaced by the new app.use('/api', apiRouter) below.
// const apiRouter = express.Router(); // Already defined
// app.use(express.json()); // Already applied

// Note: The actual app.use('/api', apiRouter); is much later in the file.
// The app.get('*', ...) catch-all should be AFTER that.

// --- User Identification (Temporary) ---
// In a real app, this would come from session/token after authentication
const MOCK_USER_ID = 'mockUser123';

// Middleware to load or create player data
const loadPlayer = async (req, res, next) => {
  try {
    let player = await Player.findOne({ userId: MOCK_USER_ID });
    if (!player) {
      console.log(`Player not found for userId: ${MOCK_USER_ID}. Creating new player.`);
      player = new Player({
        userId: MOCK_USER_ID,
        // Initialize with default values from schema or specific values
        coins: 0,
        tapPower: 1,
        upgrades: [],
        lastLogin: new Date(),
        lastDailyRewardClaimed: null
      });
      await player.save();
      console.log('New player created:', player);
    }
    req.player = player; // Attach player object to request
    next();
  } catch (error) {
    console.error('Error loading player:', error);
    res.status(500).json({ message: 'Error loading player data.', error: error.message });
  }
};
// --- End User Identification ---


const DAILY_REWARD_AMOUNT = 100; // Amount of coins for daily reward

// Define available upgrades
const availableUpgrades = {
  'doubleTap': { name: 'Double Tap Power', cost: 50, effect: (data) => data.tapPower *= 2, description: 'Doubles your coins per tap!' },
  'powerTap1': { name: 'Power Tap I', cost: 20, effect: (data) => data.tapPower += 1, description: 'Increases coins per tap by 1.' },
  'powerTap5': { name: 'Power Tap V', cost: 80, effect: (data) => data.tapPower += 5, description: 'Increases coins per tap by 5.'}
};

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'Server is healthy' });
});

// Apply loadPlayer middleware to routes that need player data
apiRouter.use(['/tap', '/playerdata', '/claimdailyreward', '/purchaseupgrade'], loadPlayer);

apiRouter.post('/tap', async (req, res) => {
  try {
    req.player.coins += req.player.tapPower;
    req.player.totalTaps = (req.player.totalTaps || 0) + 1; // Increment totalTaps
    await req.player.save();
    console.log(`Tap registered for ${req.player.userId}. Tap Power: ${req.player.tapPower}, Coins: ${req.player.coins}, Total Taps: ${req.player.totalTaps}`);
    res.json({ coins: req.player.coins, tapPower: req.player.tapPower, totalTaps: req.player.totalTaps, message: 'Tap successful!' });

    // Broadcast leaderboard update after successful tap
    broadcastLeaderboardUpdate('coins'); // Or based on current sort preference if tracked
    broadcastLeaderboardUpdate('totalTaps');
  } catch (error) {
    console.error('Error processing tap:', error);
    res.status(500).json({ message: 'Error processing tap.', error: error.message });
  }
});

// --- Leaderboard API Endpoint ---
// GET /api/leaderboard - Get top players
apiRouter.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to top 10
    const sortBy = req.query.sortBy || 'coins'; // Default sort by coins, could be 'totalTaps'

    let sortCriteria = {};
    if (sortBy === 'totalTaps') {
      sortCriteria = { totalTaps: -1 };
    } else {
      sortCriteria = { coins: -1 }; // Default to coins
    }

    const leaderboard = await Player.find({})
      .sort(sortCriteria)
      .limit(limit)
      .select('userId coins totalTaps squadId') // Select relevant fields
      .populate('squadId', 'name'); // Populate squad name if player is in a squad

    res.json(leaderboard.map(p => p.toObject()));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard.', error: error.message });
  }
});

// GET /api/squads/:squadId - Get details of a specific squad
apiRouter.get('/squads/:squadId', async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.squadId)
      .populate('leader', 'userId coins') // Populate with more leader details
      .populate('members', 'userId coins'); // Populate with more member details

    if (!squad) {
      return res.status(404).json({ message: 'Squad not found.' });
    }
    res.json(squad.toObject());
  } catch (error) {
    console.error('Error fetching squad details:', error);
    res.status(500).json({ message: 'Failed to fetch squad details.', error: error.message });
  }
});

// POST /api/squads/:squadId/join - Join a squad
apiRouter.post('/squads/:squadId/join', loadPlayer, async (req, res) => {
  try {
    const squadId = req.params.squadId;
    const player = req.player;

    if (player.squadId) {
      if (player.squadId.toString() === squadId) {
        return res.status(400).json({ message: 'You are already a member of this squad.' });
      }
      const existingSquad = await Squad.findById(player.squadId);
      return res.status(400).json({ message: `You are already in a squad: ${existingSquad?.name || 'Unknown'}. Please leave it first.` });
    }

    const squad = await Squad.findById(squadId);
    if (!squad) {
      return res.status(404).json({ message: 'Squad not found.' });
    }

    // Using the Mongoose method defined in schema (if available and preferred)
    // Or manual update:
    if (!squad.members.includes(player._id)) {
      squad.members.push(player._id);
      await squad.save();
    }

    player.squadId = squad._id;
    await player.save();

    res.json({ message: `Successfully joined squad: ${squad.name}!`, squad: squad.toObject(), player: player.toObject() });
  } catch (error) {
    console.error('Error joining squad:', error);
    res.status(500).json({ message: 'Failed to join squad.', error: error.message });
  }
});

// POST /api/squads/:squadId/leave - Leave the current squad
// For simplicity, player leaves their current squad, ID in param is for consistency but not strictly needed if we use player's squadId
apiRouter.post('/squads/leave', loadPlayer, async (req, res) => { // Changed to /squads/leave
  try {
    const player = req.player;
    if (!player.squadId) {
      return res.status(400).json({ message: "You are not in any squad." });
    }

    const squad = await Squad.findById(player.squadId);
    if (squad) {
      squad.members.pull(player._id); // Mongoose .pull removes item from array

      // Simple leader leaving logic: if leader leaves, disband squad or pick new leader
      // For now, if leader leaves, another member becomes leader (if any) or squad is disbanded.
      // This is a simplified placeholder. Real leader migration is complex.
      if (squad.leader.equals(player._id)) {
        if (squad.members.length > 0) {
          squad.leader = squad.members[0]; // Assign first member as new leader
          await Player.findByIdAndUpdate(squad.members[0], { $addToSet: { roles: 'squad_leader' } }); // Example role
        } else {
          // If no members left, delete the squad
          await Squad.findByIdAndDelete(squad._id);
          player.squadId = null;
          await player.save();
          return res.json({ message: `You have left and disbanded squad: ${squad.name}.` });
        }
      }
      await squad.save();
    }

    const leftSquadName = squad ? squad.name : 'Unknown';
    player.squadId = null;
    await player.save();

    res.json({ message: `Successfully left squad: ${leftSquadName}.`, player: player.toObject() });
  } catch (error) {
    console.error('Error leaving squad:', error);
    res.status(500).json({ message: 'Failed to leave squad.', error: error.message });
  }
});


// GET /api/player/squad - Get current player's squad details
apiRouter.get('/player/squad', loadPlayer, async (req, res) => {
  try {
    if (!req.player.squadId) {
      return res.json({ squad: null, message: "You are not currently in a squad." });
    }
    const squad = await Squad.findById(req.player.squadId)
      .populate('leader', 'userId coins') // Also populate leader coins for consistency if needed elsewhere
      .populate('members', 'userId coins'); // Populate member coins

    if (!squad) {
      // Data inconsistency: player has a squadId but squad doesn't exist
      req.player.squadId = null;
      await req.player.save();
      return res.status(404).json({ squad: null, message: "Squad not found, your squad status has been cleared." });
    }
    res.json({ squad: squad.toObject() });
  } catch (error) {
    console.error("Error fetching player's squad:", error);
    res.status(500).json({ message: "Failed to fetch player's squad.", error: error.message });
  }
});

apiRouter.get('/playerdata', async (req, res) => {
  try {
    // Update lastLogin on fetching player data
    req.player.lastLogin = new Date();
    await req.player.save();

    const today = new Date().toISOString().split('T')[0];
    const canClaimDailyReward = req.player.lastDailyRewardClaimed !== today;

    console.log('Fetching player data for:', req.player.userId, req.player);
    // Return a plain object version of the player document
    res.json({ ...req.player.toObject(), availableUpgrades, canClaimDailyReward });
  } catch (error) {
    console.error('Error fetching player data:', error);
    res.status(500).json({ message: 'Error fetching player data.', error: error.message });
  }
});

apiRouter.post('/claimdailyreward', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD

    if (req.player.lastDailyRewardClaimed === today) {
      return res.status(400).json({ success: false, message: 'Daily reward already claimed for today.' });
    }

    req.player.coins += DAILY_REWARD_AMOUNT;
    req.player.lastDailyRewardClaimed = today;
    await req.player.save();

    console.log(`Daily reward claimed for ${req.player.userId}. Amount: ${DAILY_REWARD_AMOUNT}. New coins: ${req.player.coins}`);
    res.json({
      success: true,
      message: `Daily reward of ${DAILY_REWARD_AMOUNT} coins claimed!`,
      coins: req.player.coins,
      lastDailyRewardClaimed: req.player.lastDailyRewardClaimed
    });
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    res.status(500).json({ message: 'Error claiming daily reward.', error: error.message });
  }
});

// --- Conceptual Event System ---
// Example structure for an event
const mockActiveEvent = {
  id: 'summerFest2024',
  name: 'Summer Tapping Fest!',
  description: 'Tap as much as you can during the event for bonus rewards!',
  startTime: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // Started yesterday
  endTime: new Date(Date.now() + 3600 * 1000 * 24 * 2).toISOString(), // Ends in 2 days
  // objectives: [{ type: 'tapCount', goal: 1000, reward: 500 coins }], // Future enhancement
  isActive: true
};

// In a real system, you'd have logic to determine the currently active event.
apiRouter.get('/activeevent', (req, res) => {
  // For now, just return the mock event if it's "active"
  // A real implementation would check current time against event start/end times
  if (mockActiveEvent.isActive &&
      new Date() > new Date(mockActiveEvent.startTime) &&
      new Date() < new Date(mockActiveEvent.endTime)) {
    res.json({ event: mockActiveEvent });
  } else {
    res.json({ event: null, message: 'No active events at the moment.' });
  }
});
// --- End Conceptual Event System ---

apiRouter.post('/purchaseupgrade', async (req, res) => {
  try {
    const { upgradeId } = req.body;
    const upgrade = availableUpgrades[upgradeId];

    if (!upgrade) {
      return res.status(404).json({ success: false, message: 'Upgrade not found.' });
    }

    // Example: some upgrades might be non-repeatable
    if (req.player.upgrades.includes(upgradeId) && (upgradeId === 'doubleTap')) {
        return res.status(400).json({ success: false, message: 'Upgrade already purchased and non-repeatable.'});
    }

    if (req.player.coins >= upgrade.cost) {
      req.player.coins -= upgrade.cost;
      // Apply effect by modifying req.player directly
      // The 'effect' functions in availableUpgrades might need to be adjusted if they expect a plain object
      // For now, let's assume they can modify the Mongoose document (or we adapt them)
      // Example: upgrade.effect(req.player);
      // Adapting the effect application for Mongoose document:
      if (upgradeId === 'doubleTap') req.player.tapPower *= 2;
      else if (upgradeId === 'powerTap1') req.player.tapPower += 1;
      else if (upgradeId === 'powerTap5') req.player.tapPower += 5;
      // Add other effects similarly

      if (!req.player.upgrades.includes(upgradeId)) {
          req.player.upgrades.push(upgradeId);
      }

      await req.player.save();

      console.log(`Upgrade ${upgradeId} purchased for ${req.player.userId}. Cost: ${upgrade.cost}. Remaining coins: ${req.player.coins}. New Tap Power: ${req.player.tapPower}`);
      res.json({ success: true, message: `Upgrade '${upgrade.name}' purchased!`, playerData: req.player.toObject() });

      // Broadcast leaderboard update after successful upgrade purchase
      broadcastLeaderboardUpdate('coins');
    } else {
      console.log(`Failed to purchase upgrade ${upgradeId} for ${req.player.userId}. Insufficient coins.`);
      res.status(400).json({ success: false, message: 'Insufficient coins' });
    }
  } catch (error) {
    console.error('Error purchasing upgrade:', error);
    res.status(500).json({ message: 'Error purchasing upgrade.', error: error.message });
  }
});

// --- Squad API Endpoints ---

// POST /api/squads - Create a new squad
apiRouter.post('/squads', loadPlayer, async (req, res) => {
  const { name, description } = req.body;
  const leaderId = req.player._id; // Player performing the action is the leader

  if (!name) {
    return res.status(400).json({ message: 'Squad name is required.' });
  }

  try {
    // Check if player is already in a squad
    if (req.player.squadId) {
      const existingSquad = await Squad.findById(req.player.squadId);
      return res.status(400).json({ message: `You are already in a squad: ${existingSquad?.name || 'Unknown'}. Please leave it first.` });
    }

    // Check if squad name already exists
    const existingSquad = await Squad.findOne({ name });
    if (existingSquad) {
      return res.status(400).json({ message: `Squad name '${name}' is already taken.` });
    }

    const newSquad = new Squad({
      name,
      description: description || '',
      leader: leaderId,
      members: [leaderId] // Leader is automatically a member
    });
    await newSquad.save();

    // Update player's squadId
    req.player.squadId = newSquad._id;
    await req.player.save();

    res.status(201).json({ message: `Squad '${name}' created successfully!`, squad: newSquad.toObject() });
  } catch (error) {
    console.error('Error creating squad:', error);
    if (error.code === 11000) { // Duplicate key error (e.g. for unique name, though we check above)
        return res.status(400).json({ message: 'Squad name might already be taken or another unique field constraint failed.' });
    }
    res.status(500).json({ message: 'Failed to create squad.', error: error.message });
  }
});

// GET /api/squads - List all squads
apiRouter.get('/squads', async (req, res) => {
  try {
    // Populate leader and members with basic info (e.g., userId or a chosen display name if available)
    // For now, just returning their ObjectIds. Full population can be complex.
    const squads = await Squad.find({})
      .populate('leader', 'userId') // Populate leader with their userId
      .populate('members', 'userId') // Populate members with their userIds
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(squads.map(s => s.toObject()));
  } catch (error) {
    console.error('Error fetching squads:', error);
    res.status(500).json({ message: 'Failed to fetch squads.', error: error.message });
  }
});


app.use('/api', apiRouter);

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
// This should be AFTER all other routes, especially API routes.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});


// --- Socket.IO Setup ---
const getTopPlayers = async (sortBy = 'coins', limit = 10) => {
  let sortCriteria = sortBy === 'totalTaps' ? { totalTaps: -1 } : { coins: -1 };
  return Player.find({})
    .sort(sortCriteria)
    .limit(limit)
    .select('userId coins totalTaps squadId')
    .populate('squadId', 'name')
    .lean(); // Use .lean() for plain JS objects, good for sending over Socket.IO
};

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  // Send initial leaderboard data or handle requests for it
  // socket.on('getInitialLeaderboard', async () => {
  //   try {
  //     const leaderboardData = await getTopPlayers();
  //     socket.emit('leaderboardUpdate', leaderboardData);
  //   } catch (error) {
  //     console.error("Error sending initial leaderboard:", error);
  //   }
  // });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Function to broadcast leaderboard updates
const broadcastLeaderboardUpdate = async (sortBy = 'coins') => {
  try {
    const leaderboardData = await getTopPlayers(sortBy);
    io.emit('leaderboardUpdate', { sortBy, players: leaderboardData });
    console.log('Leaderboard update broadcasted.');
  } catch (error) {
    console.error("Error broadcasting leaderboard update:", error);
  }
};
// --- End Socket.IO Setup ---


// Start the server using the http server instance
server.listen(PORT, () => { // Changed app.listen to server.listen
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.IO server initialized and listening.`);
});

module.exports = { app, server, io }; // Export server and io for potential testing or other modules
