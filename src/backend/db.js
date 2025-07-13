const mongoose = require('mongoose');

// Environment variable for MongoDB URI from .env file or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/atlantax';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // useNewUrlParser and useUnifiedTopology are no longer needed for Mongoose 6+
      // but serverSelectionTimeoutMS can be useful.
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    console.log('MongoDB connected successfully to:', MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Exit process with failure if DB connection fails, or handle gracefully
    // For a server, you might want to retry or have a fallback.
    // For this script, exiting might be too drastic if it's just a dev environment.
    // process.exit(1);
    throw error; // Re-throw error to be caught by server startup logic
  }
};

// Define Player Schema
const playerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true }, // E.g., a unique identifier like a username or device ID
  coins: { type: Number, default: 0 },
  tapPower: { type: Number, default: 1 },
  upgrades: [{ type: String }], // Array of upgrade IDs
  lastLogin: { type: Date, default: Date.now },
  lastDailyRewardClaimed: { type: String, default: null }, // Store as 'YYYY-MM-DD'
  // Fields for squads/leaderboards
  squadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad', default: null, index: true },
  totalTaps: { type: Number, default: 0 }, // For leaderboards
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Player = mongoose.model('Player', playerSchema);

// Define Squad Schema
const squadSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, index: true },
  description: { type: String, trim: true, default: '' },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  // totalSquadScore could be a virtual or calculated field later
  // For now, we can focus on membership and basic info
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true }); // timestamps will add createdAt and updatedAt automatically

// Ensure leader is also part of members for easier querying if needed, or handle in logic.
// For simplicity, we'll assume leader is implicitly a member.

// Method to add a member (ensure not already a member)
squadSchema.methods.addMember = async function(playerId) {
  if (!this.members.includes(playerId)) {
    this.members.push(playerId);
    // Optionally update player's squadId field
    await Player.findByIdAndUpdate(playerId, { squadId: this._id });
    await this.save();
    return true;
  }
  return false; // Already a member
};

// Method to remove a member
squadSchema.methods.removeMember = async function(playerId) {
  const index = this.members.indexOf(playerId);
  if (index > -1) {
    this.members.splice(index, 1);
    // Optionally update player's squadId field
    await Player.findByIdAndUpdate(playerId, { squadId: null });
    // If leader leaves, need logic to disband or assign new leader (complex, for later)
    await this.save();
    return true;
  }
  return false; // Not a member
};


const Squad = mongoose.model('Squad', squadSchema);

// Add squadId to Player schema
// This requires modifying the Player schema above or by re-opening it.
// For simplicity here, I'll note it should be done.
// playerSchema.add({ squadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad', default: null } });
// This change should ideally be done when Player schema is first defined.
// Let's assume for now we manage this relationship primarily from the Squad side or update Player docs separately.

module.exports = { connectDB, Player, Squad };
