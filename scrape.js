const HLTV = require('hltv');
const fs = require('fs');
const mongoose = require('mongoose');

// MongoDB connection string
const mongoURI = 'your_mongodb_connection_string_here';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schema and model
const eventSchema = new mongoose.Schema({
    id: Number,
    name: String,
    dateStart: Date,
    dateEnd: Date,
    // Add other fields as needed
});

const Event = mongoose.model('Event', eventSchema);

async function getEventData(eventId) {
    try {
        const event = await HLTV.getEvent({ id: eventId });
        return event;
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