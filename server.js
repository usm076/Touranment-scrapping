const express = require('express');
const mongoose = require('mongoose');
const Tournament = require('./models/Tournament');
const Team = require('./models/Team');
const Player = require('./models/Player');

const app = express();
const port = 3000;

// MongoDB connection string
const mongoURI = 'mongodb+srv://muhammadhamza:kAxvPXj0vWHfjrsq@test.8y5a9sh.mongodb.net/HLTV-Data?retryWrites=true&w=majority'; // Updated MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware to parse JSON
app.use(express.json());

// Get tournament by ID or name
app.get('/tournament', async (req, res) => {
    try {
        const { id, name } = req.query;
        let query = {};
        if (id) {
            query = { id: parseInt(id) }; // Ensure id is treated as a number
        } else if (name) {
            query = { tournamentName: decodeURIComponent(name) }; // Decode the name
        } else {
            return res.status(400).json({ message: 'Please provide either id or name as query parameter' });
        }
        const tournament = await Tournament.findOne(query);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get team by ID or name
app.get('/team', async (req, res) => {
    try {
        const { id, name } = req.query;
        let query = {};
        if (id) {
            query = { id: parseInt(id) }; // Ensure id is treated as a number
        } else if (name) {
            query = { name: decodeURIComponent(name) }; // Decode the name
        } else {
            return res.status(400).json({ message: 'Please provide either id or name as query parameter' });
        }
        const team = await Team.findOne(query);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get player by ID or name
app.get('/player', async (req, res) => {
    try {
        const { id, name } = req.query;
        let query = {};
        if (id) {
            query = { id: parseInt(id) }; // Ensure id is treated as a number
        } else if (name) {
            query = { name: decodeURIComponent(name) }; // Decode the name
        } else {
            return res.status(400).json({ message: 'Please provide either id or name as query parameter' });
        }
        const player = await Player.findOne(query);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
