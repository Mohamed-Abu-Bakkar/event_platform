const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract MongoDB URI
let mongoUri = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.substring('MONGODB_URI='.length).trim();
    if ((mongoUri.startsWith('"') && mongoUri.endsWith('"')) || 
        (mongoUri.startsWith("'") && mongoUri.endsWith("'"))) {
      mongoUri = mongoUri.slice(1, -1);
    }
  }
});

async function fixEventOwner() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('evently');
    const eventsCollection = db.collection('events');
    const usersCollection = db.collection('users');
    
    // Find events without ownerId
    const eventsWithoutOwner = await eventsCollection.find({ ownerId: { $exists: false } }).toArray();
    
    console.log(`\nFound ${eventsWithoutOwner.length} events without ownerId`);
    
    if (eventsWithoutOwner.length === 0) {
      console.log('✅ All events already have ownerId set!');
      return;
    }
    
    // Update each event
    let updated = 0;
    for (const event of eventsWithoutOwner) {
      // Get the organizer user
      const organizer = await usersCollection.findOne({ _id: event.organizer });
      
      if (organizer && organizer.clerkId) {
        await eventsCollection.updateOne(
          { _id: event._id },
          { $set: { ownerId: organizer.clerkId } }
        );
        console.log(`✅ Updated event "${event.title}" with ownerId: ${organizer.clerkId}`);
        updated++;
      } else {
        console.log(`⚠️  Could not find organizer for event "${event.title}"`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} events with ownerId`);
    console.log('You can now see your organized events in your profile!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

fixEventOwner();
