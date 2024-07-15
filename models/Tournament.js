const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    tournamentName: { type: String, required: true },
    dateStart: { type: Date, required: true },
    dateEnd: { type: Date, required: true },
    location: { type: String, required: true },
    prizePool: { type: String, required: true },
    teams: [{ 
        name: String,
        id: Number
    }],
    matches: [{
        id: Number,
        team1: String,
        team2: String,
        date: Date,
        result: String
    }]
    // Add other fields as needed
});

const Tournament = mongoose.model('tournament', tournamentSchema);

module.exports = Tournament;