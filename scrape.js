const HLTV = require('hltv');
const fs = require('fs');

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
        }
    }

    // Save data to JSON file
    fs.writeFileSync('eventsData.json', JSON.stringify(eventsData, null, 2));
    console.log('Data saved to eventsData.json');
}

main();