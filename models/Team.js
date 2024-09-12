const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    players: [{
        playerId: { type: Number, required: true },
        playerName: { type: String, required: true }
    }]
});

const Team = mongoose.model('team', teamSchema);

module.exports = Team;