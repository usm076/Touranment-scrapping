const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String },
    ign: { type: String, required: true },
    image: { type: String },
    age: { type: Number },
    country: {
        name: { type: String, required: true },
        code: { type: String, required: true }
    },
    team: {
        id: { type: Number },
        name: { type: String }
    },
    twitter: { type: String },
    twitch: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    statistics: {
        rating: { type: Number },
        killsPerRound: { type: Number },
        headshots: { type: Number },
        mapsPlayed: { type: Number },
        deathsPerRound: { type: Number },
        roundsContributed: { type: Number }
    },
    teams: [{
        id: { type: Number },
        name: { type: String },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    achievements: [{
        id: { type: Number },
        name: { type: String },
        place: { type: Number },
        event: { type: String }
    }],
    news: [{
        id: { type: Number },
        title: { type: String },
        date: { type: Date },
        link: { type: String }
    }]
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;