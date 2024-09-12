const { HLTV } = require('hltv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Tournament = require('./models/Tournament'); // Import the Event model
const Team = require('./models/Team');
const Player = require('./models/Player');

// MongoDB connection string
const mongoURI = 'mongodb+srv://muhammadhamza:kAxvPXj0vWHfjrsq@test.8y5a9sh.mongodb.net/HLTV-Data?retryWrites=true&w=majority'; // Updated MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function getEventData(eventId) {
    try {
        // console.log(`Fetching data for event ID: ${eventId}`);
        const event = await HLTV.getEvent({ id: eventId });
        // console.log(`Fetched event data: ${JSON.stringify(event)}`);

        if (!event.teams) {
            console.error(`Event ID ${eventId} has no teams`);
        }

        const teams = event.teams ? await Promise.all(event.teams.map(async team => {
            try {
                const teamDetails = await HLTV.getTeam({ id: team.id });
                const players = teamDetails.players ? await Promise.all(teamDetails.players.map(async player => {
                    const playerDetails = await HLTV.getPlayer({ id: player.id });
                    return {
                        id: playerDetails.id,
                        name: playerDetails.name
                    };
                })) : [];

                // Save players
                const playerIds = await Promise.all(players.map(async player => {
                    await Player.findOneAndUpdate(
                        { id: player.id },
                        { id: player.id, name: player.name },
                        { upsert: true, new: true }
                    );
                    return {
                        playerId: player.id, // Use the HLTV player ID
                        playerName: player.name
                    };
                }));

                // Save team
                await Team.findOneAndUpdate(
                    { id: team.id },
                    { id: team.id, name: team.name, players: playerIds },
                    { upsert: true, new: true }
                );

                return {
                    name: team.name,
                    id: team.id,
                    players: players.map(player => player.name)
                };
            } catch (teamError) {
                console.error(`Error fetching team data for team ID ${team.id}: ${teamError}`);
                return {
                    name: team.name,
                    id: team.id,
                    players: []
                };
            }
        })) : [];

        return {
            id: event.id,
            tournamentName: event.name, // Updated to match the schema
            dateStart: new Date(event.dateStart),
            dateEnd: new Date(event.dateEnd),
            location: event.location ? `${event.location.name} (${event.location.code})` : 'Unknown', // Convert location object to string
            prizePool: event.prizePool,
            teams: teams,
            matches: event.matches ? event.matches.map(match => ({
                id: match.id,
                team1: match.team1 ? match.team1.name : 'Unknown',
                team2: match.team2 ? match.team2.name : 'Unknown',
                date: new Date(match.date),
                result: match.result
            })) : [] // Added check for undefined
        };
    } catch (error) {
        console.error(`Error fetching event data for event ID ${eventId}: ${error}`);
    }
}

async function getAllTournaments() {
    try {
        // console.log('Fetching all tournaments');
        const tournaments = await HLTV.getEvents(); // Ensure getEvents is correctly called
        // console.log(`Fetched tournaments: ${JSON.stringify(tournaments)}`);
        return tournaments.map(tournament => tournament.id);
    } catch (error) {
        console.error(`Error fetching tournaments: ${error}`);
        return []; // Return an empty array in case of error
    }
}

async function main() {
    const eventIds = await getAllTournaments();
    if (!Array.isArray(eventIds)) {
        console.error('eventIds is not an array');
        return;
    }
    const eventsData = [];

    for (const eventId of eventIds) {
        const eventData = await getEventData(eventId);
        if (eventData) {
            // console.log(`Event data to be saved: ${JSON.stringify(eventData)}`);
            eventsData.push(eventData);

            // Save or update event data in MongoDB
            await Tournament.findOneAndUpdate(
                { id: eventData.id }, // search query
                eventData, // new data
                { upsert: true, new: true } // options
            );
            // console.log(`Saved event data for event ID: ${eventData.id}`);
        }

        // Delay to avoid getting banned
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
    }

    // Save the JSON data to a file on the desktop
    const filePath = path.join(require('os').homedir(), 'Desktop', 'eventsData.json');
    fs.writeFileSync(filePath, JSON.stringify(eventsData, null, 2));
    // console.log(`Data saved to ${filePath}`);
}

main();