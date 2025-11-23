const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract MongoDB URI more carefully
let mongoUri = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.substring('MONGODB_URI='.length).trim();
    // Remove surrounding quotes if present
    if ((mongoUri.startsWith('"') && mongoUri.endsWith('"')) || 
        (mongoUri.startsWith("'") && mongoUri.endsWith("'"))) {
      mongoUri = mongoUri.slice(1, -1);
    }
  }
});

console.log('Using MongoDB URI:', mongoUri.substring(0, 30) + '...');

async function fixOrderIndex() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('evently'); // Use the correct database name
    const ordersCollection = db.collection('orders');
    
    // Drop the unique index on stripeId
    try {
      await ordersCollection.dropIndex('stripeId_1');
      console.log('✅ Successfully dropped stripeId_1 unique index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist (already dropped or never created)');
      } else {
        console.log('⚠️  Error dropping index:', error.message);
      }
    }
    
    // List all indexes to verify
    const indexes = await ordersCollection.indexes();
    console.log('\nCurrent indexes on orders collection:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    console.log('\n✅ Done! You can now create orders without stripeId.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixOrderIndex();
