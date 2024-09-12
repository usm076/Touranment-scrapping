const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    country: {
        name: { type: String, required: true },
        code: { type: String, required: true }
    },
    rank: { type: Number },
    players: [{
        playerId: { type: Number, required: true },
        playerName: { type: String, required: true }
    }],
    rankingDevelopment: [{ type: Number }],
    news: [{
        id: { type: Number },
        title: { type: String },
        date: { type: Date },
        link: { type: String }
    }]
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;