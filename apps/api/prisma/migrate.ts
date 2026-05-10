import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('Creating tables in Turso...');

  // Create User table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      phone TEXT,
      role TEXT DEFAULT 'admin',
      isActive INTEGER DEFAULT 1,
      lastLoginAt TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('User table created');

  // Create Video table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Video (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      concept TEXT,
      script TEXT,
      status TEXT DEFAULT 'ideation',
      priority TEXT DEFAULT 'medium',
      plannedStartDate TEXT,
      plannedEndDate TEXT,
      actualStartDate TEXT,
      actualEndDate TEXT,
      publishDate TEXT,
      duration INTEGER,
      category TEXT,
      tags TEXT,
      thumbnailUrl TEXT,
      videoUrl TEXT,
      youtubeId TEXT,
      aiRecommendations TEXT,
      aiScheduleSuggestion TEXT,
      userId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id)
    )
  `);
  console.log('Video table created');

  // Create Budget table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Budget (
      id TEXT PRIMARY KEY,
      videoId TEXT NOT NULL,
      userId TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      plannedAmount REAL NOT NULL,
      actualAmount REAL DEFAULT 0,
      status TEXT DEFAULT 'planned',
      paymentDate TEXT,
      paymentMethod TEXT,
      receipt TEXT,
      notes TEXT,
      aiRiskFlag INTEGER DEFAULT 0,
      aiNotes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (videoId) REFERENCES Video(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES User(id)
    )
  `);
  console.log('Budget table created');

  // Create Talent table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Talent (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      gender TEXT,
      ageRange TEXT,
      ethnicity TEXT,
      height TEXT,
      bodyType TEXT,
      hairColor TEXT,
      hairStyle TEXT,
      skinTone TEXT,
      faceReference TEXT,
      bodyReference TEXT,
      voiceSample TEXT,
      specialty TEXT,
      rate REAL,
      currency TEXT DEFAULT 'IDR',
      aiConsistencyScore REAL,
      aiParameters TEXT,
      isActive INTEGER DEFAULT 1,
      notes TEXT,
      userId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id)
    )
  `);
  console.log('Talent table created');

  // Create VideoTalent table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS VideoTalent (
      id TEXT PRIMARY KEY,
      videoId TEXT NOT NULL,
      talentId TEXT NOT NULL,
      role TEXT NOT NULL,
      characterName TEXT,
      agreedFee REAL,
      paidAmount REAL DEFAULT 0,
      paymentStatus TEXT DEFAULT 'pending',
      shootingDates TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (videoId) REFERENCES Video(id) ON DELETE CASCADE,
      FOREIGN KEY (talentId) REFERENCES Talent(id),
      UNIQUE(videoId, talentId)
    )
  `);
  console.log('VideoTalent table created');

  // Create MarketingCampaign table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS MarketingCampaign (
      id TEXT PRIMARY KEY,
      videoId TEXT NOT NULL,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      campaignType TEXT NOT NULL,
      scheduledDate TEXT,
      publishedDate TEXT,
      status TEXT DEFAULT 'draft',
      caption TEXT,
      hashtags TEXT,
      mediaUrl TEXT,
      postUrl TEXT,
      aiGeneratedCopy TEXT,
      aiSuggestions TEXT,
      impressions INTEGER,
      engagement INTEGER,
      clicks INTEGER,
      adBudget REAL DEFAULT 0,
      adSpent REAL DEFAULT 0,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (videoId) REFERENCES Video(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES User(id)
    )
  `);
  console.log('MarketingCampaign table created');

  // Create AILog table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS AILog (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      requestType TEXT NOT NULL,
      prompt TEXT NOT NULL,
      context TEXT,
      response TEXT NOT NULL,
      tokensUsed INTEGER,
      entityType TEXT,
      entityId TEXT,
      status TEXT DEFAULT 'success',
      errorMessage TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id)
    )
  `);
  console.log('AILog table created');

  // Create Notification table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Notification (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      category TEXT,
      entityType TEXT,
      entityId TEXT,
      link TEXT,
      isRead INTEGER DEFAULT 0,
      isAIGenerated INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )
  `);
  console.log('Notification table created');

  console.log('\nAll tables created successfully!');
}

migrate().catch(console.error);
