const HLTV = require('hltv');
const fs = require('fs');
const mongoose = require('mongoose');
const Event = require('./models/Event'); // Import the Event model

// MongoDB connection string
const mongoURI = 'your_mongodb_connection_string_here';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function getEventData(eventId) {
    try {
        const event = await HLTV.getEvent({ id: eventId });
        return {
            id: event.id,
            name: event.name,
            dateStart: new Date(event.dateStart),
            dateEnd: new Date(event.dateEnd),
            location: event.location,
            prizePool: event.prizePool,
            teams: event.teams.map(team => ({ name: team.name, id: team.id })),
            matches: event.matches.map(match => ({
                id: match.id,
                team1: match.team1.name,
                team2: match.team2.name,
                date: new Date(match.date),
                result: match.result
            }))
        };
    } catch (error) {
        console.error(`Error fetching event data: ${error}`);
    }
}

async function main() {
    const eventIds = [7148]; // Add more event IDs as needed
    const eventsData = [];

    for (const eventId of eventIds) {
        const eventData = await getEventData(eventId);
        if (eventData) {
            eventsData.push(eventData);

            // Save event data to MongoDB
            const event = new Event(eventData);
            await event.save();
        }
    }

    // Save data to JSON file
    fs.writeFileSync('eventsData.json', JSON.stringify(eventsData, null, 2));
    console.log('Data saved to eventsData.json');
}

main();