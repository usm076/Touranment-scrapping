const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true }
});

const Player = mongoose.model('player', playerSchema);

module.exports = Player;