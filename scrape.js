const { HLTV } = require('hltv');
const mongoose = require('mongoose');
const Event = require('./models/Tournament'); // Import the Event model

// MongoDB connection string
const mongoURI = 'mongodb+srv://muhammadhamza:kAxvPXj0vWHfjrsq@test.8y5a9sh.mongodb.net/HLTV-Data?retryWrites=true&w=majority'; // Updated MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function getEventData(eventId) {
    try {
        const event = await HLTV.getEvent({ id: eventId });
        return {
            id: event.id,
            tournamentName: event.name, // Updated to match the schema
            dateStart: new Date(event.dateStart),
            dateEnd: new Date(event.dateEnd),
            location: event.location ? `${event.location.name} (${event.location.code})` : 'Unknown', // Convert location object to string
            prizePool: event.prizePool,
            teams: event.teams ? event.teams.map(team => ({ name: team.name, id: team.id })) : [], // Added check for undefined
            matches: event.matches ? event.matches.map(match => ({
                id: match.id,
                team1: match.team1.name,
                team2: match.team2.name,
                date: new Date(match.date),
                result: match.result
            })) : [] // Added check for undefined
        };
    } catch (error) {
        console.error(`Error fetching event data: ${error}`);
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
            const event = await Event.findOneAndUpdate(
                { id: eventData.id }, // search query
                eventData, // new data
                { upsert: true, new: true } // options
            );
        }

        // Delay to avoid getting banned
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
    }
}

main();