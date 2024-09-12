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
        const event = await HLTV.getEvent({ id: eventId });

        if (!event.teams) {
            console.error(`Event ID ${eventId} has no teams`);
        }

        const teams = event.teams ? await Promise.all(event.teams.map(async team => {
            try {
                const teamDetails = await HLTV.getTeam({ id: team.id });
                const players = teamDetails.players ? await Promise.all(teamDetails.players.map(async player => {
                    const playerDetails = await HLTV.getPlayer({ id: player.id });

                    // Validate and sanitize player data
                    const sanitizedPlayerDetails = {
                        id: playerDetails.id,
                        name: playerDetails.name,
                        ign: playerDetails.ign,
                        image: playerDetails.image,
                        age: playerDetails.age,
                        country: playerDetails.country,
                        team: playerDetails.team,
                        twitter: playerDetails.twitter,
                        twitch: playerDetails.twitch,
                        facebook: playerDetails.facebook,
                        instagram: playerDetails.instagram,
                        statistics: {
                            rating: playerDetails.statistics?.rating || 0,
                            killsPerRound: playerDetails.statistics?.killsPerRound || 0,
                            headshots: playerDetails.statistics?.headshots || 0,
                            mapsPlayed: playerDetails.statistics?.mapsPlayed || 0,
                            deathsPerRound: playerDetails.statistics?.deathsPerRound || 0,
                            roundsContributed: playerDetails.statistics?.roundsContributed || 0
                        },
                        teams: playerDetails.teams || [],
                        news: playerDetails.news || []
                    };

                    return sanitizedPlayerDetails;
                })) : [];

                // Save players
                const playerIds = await Promise.all(players.map(async player => {
                    await Player.findOneAndUpdate(
                        { id: player.id },
                        player,
                        { upsert: true, new: true }
                    );
                    return {
                        playerId: player.id, // Use the HLTV player ID
                        playerName: player.name
                    };
                }));

                // Validate and sanitize team data
                const sanitizedTeamDetails = {
                    id: team.id,
                    name: team.name,
                    logo: teamDetails.logo,
                    facebook: teamDetails.facebook,
                    twitter: teamDetails.twitter,
                    instagram: teamDetails.instagram,
                    country: teamDetails.country,
                    rank: teamDetails.rank,
                    players: playerIds,
                    rankingDevelopment: teamDetails.rankingDevelopment || [],
                    news: teamDetails.news || []
                };

                // Save team
                await Team.findOneAndUpdate(
                    { id: team.id },
                    sanitizedTeamDetails,
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
                date: match.date ? new Date(match.date) : null,
                result: match.result
            })) : [] // Added check for undefined
        };
    } catch (error) {
        console.error(`Error fetching event data for event ID ${eventId}: ${error}`);
        return null; // Return null in case of error
    }
}

async function getAllTournaments() {
    try {
        const tournaments = await HLTV.getEvents(); // Ensure getEvents is correctly called
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
            eventsData.push(eventData);

            // Save or update event data in MongoDB
            await Tournament.findOneAndUpdate(
                { id: eventData.id }, // search query
                eventData, // new data
                { upsert: true, new: true } // options
            );
        }

        // Delay to avoid getting banned
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
    }

    // Save the JSON data to a file on the desktop
    const filePath = path.join(require('os').homedir(), 'Desktop', 'eventsData.json');
    fs.writeFileSync(filePath, JSON.stringify(eventsData, null, 2));
}

main();