import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function fixDates() {
  console.log('Fixing date formats...');
  
  // Update User dates to ISO format
  await client.execute(`
    UPDATE User SET 
      createdAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', createdAt),
      updatedAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', updatedAt)
    WHERE createdAt NOT LIKE '%T%'
  `);
  
  // Update Video dates
  await client.execute(`
    UPDATE Video SET 
      createdAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', createdAt),
      updatedAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', updatedAt)
    WHERE createdAt NOT LIKE '%T%'
  `);
  
  // Update Budget dates
  await client.execute(`
    UPDATE Budget SET 
      createdAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', createdAt),
      updatedAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', updatedAt)
    WHERE createdAt NOT LIKE '%T%'
  `);
  
  // Update Talent dates
  await client.execute(`
    UPDATE Talent SET 
      createdAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', createdAt),
      updatedAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', updatedAt)
    WHERE createdAt NOT LIKE '%T%'
  `);
  
  // Update Notification dates
  await client.execute(`
    UPDATE Notification SET 
      createdAt = strftime('%Y-%m-%dT%H:%M:%S.000Z', createdAt)
    WHERE createdAt NOT LIKE '%T%'
  `);
  
  console.log('Date formats fixed!');
  
  // Verify
  const result = await client.execute('SELECT id, email, createdAt FROM User LIMIT 1');
  console.log('Sample user:', result.rows[0]);
}

fixDates().catch(console.error);
