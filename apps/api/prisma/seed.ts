import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function seed() {
  console.log('Seeding YouTube Creator ERP Database...');

  // Create admin user
  const adminId = uuid();
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await client.execute({
    sql: `INSERT OR REPLACE INTO User (id, email, password, name, role, isActive, createdAt, updatedAt) 
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [adminId, 'admin@creator.io', hashedPassword, 'Creator Admin', 'admin', 1],
  });
  console.log('Admin user created: admin@creator.io / admin123');

  // Create sample video projects
  const video1Id = uuid();
  const video2Id = uuid();
  const video3Id = uuid();

  await client.execute({
    sql: `INSERT INTO Video (id, title, description, concept, status, priority, duration, category, tags, userId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [video1Id, 'Tutorial AI untuk Pemula', 'Video tutorial lengkap tentang cara menggunakan AI tools', 'Edukasi AI tools populer dengan demo praktis', 'production', 'high', 18, 'Education', 'ai,tutorial,pemula,teknologi', adminId],
  });

  await client.execute({
    sql: `INSERT INTO Video (id, title, description, concept, status, priority, duration, category, tags, userId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [video2Id, 'Review Gadget Terbaru 2026', 'Review mendalam gadget-gadget terbaru', 'Unboxing dan review smartphone flagship', 'ideation', 'medium', 15, 'Technology', 'gadget,review,smartphone,tech', adminId],
  });

  await client.execute({
    sql: `INSERT INTO Video (id, title, description, concept, status, priority, duration, category, tags, userId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [video3Id, 'Vlog Perjalanan Bali', 'Dokumentasi perjalanan ke Bali', 'Travel vlog dengan cinematic shots', 'post_production', 'high', 20, 'Travel', 'bali,travel,vlog,indonesia', adminId],
  });
  console.log('Sample videos created');

  // Create budgets for videos
  const budgetCategories = ['talent_fee', 'equipment', 'location', 'editing', 'marketing', 'misc'];
  
  // Video 1 budgets
  await client.execute({
    sql: `INSERT INTO Budget (id, videoId, userId, category, description, plannedAmount, actualAmount, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video1Id, adminId, 'talent_fee', 'Host/Presenter fee', 2000000, 2000000, 'spent'],
  });
  await client.execute({
    sql: `INSERT INTO Budget (id, videoId, userId, category, description, plannedAmount, actualAmount, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video1Id, adminId, 'equipment', 'Camera & lighting rental', 1500000, 1200000, 'spent'],
  });
  await client.execute({
    sql: `INSERT INTO Budget (id, videoId, userId, category, description, plannedAmount, actualAmount, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video1Id, adminId, 'editing', 'Video editing service', 1000000, 0, 'planned'],
  });

  // Video 3 budgets
  await client.execute({
    sql: `INSERT INTO Budget (id, videoId, userId, category, description, plannedAmount, actualAmount, status, aiRiskFlag, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video3Id, adminId, 'location', 'Bali accommodation & transport', 5000000, 4800000, 'spent', 1],
  });
  await client.execute({
    sql: `INSERT INTO Budget (id, videoId, userId, category, description, plannedAmount, actualAmount, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video3Id, adminId, 'equipment', 'Drone rental', 800000, 800000, 'spent'],
  });
  console.log('Sample budgets created');

  // Create talents
  const talent1Id = uuid();
  const talent2Id = uuid();

  await client.execute({
    sql: `INSERT INTO Talent (id, name, email, phone, gender, ageRange, specialty, rate, currency, userId, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [talent1Id, 'Andi Pratama', 'andi@email.com', '081234567890', 'male', '26-35', 'host', 2000000, 'IDR', adminId, 1],
  });

  await client.execute({
    sql: `INSERT INTO Talent (id, name, email, phone, gender, ageRange, specialty, rate, currency, userId, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [talent2Id, 'Sari Dewi', 'sari@email.com', '081234567891', 'female', '18-25', 'voiceover', 1500000, 'IDR', adminId, 1],
  });
  console.log('Sample talents created');

  // Assign talents to videos
  await client.execute({
    sql: `INSERT INTO VideoTalent (id, videoId, talentId, role, agreedFee, paidAmount, paymentStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video1Id, talent1Id, 'main_character', 2000000, 2000000, 'paid'],
  });

  await client.execute({
    sql: `INSERT INTO VideoTalent (id, videoId, talentId, role, agreedFee, paidAmount, paymentStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video3Id, talent2Id, 'voiceover', 1500000, 750000, 'partial'],
  });
  console.log('Talent assignments created');

  // Create marketing campaigns
  await client.execute({
    sql: `INSERT INTO MarketingCampaign (id, videoId, userId, name, platform, campaignType, status, caption, hashtags, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video1Id, adminId, 'Teaser AI Tutorial', 'instagram', 'teaser', 'draft', 'Coming soon! Tutorial AI yang akan mengubah cara kamu bekerja', '#AI #Tutorial #Tech #Indonesia'],
  });

  await client.execute({
    sql: `INSERT INTO MarketingCampaign (id, videoId, userId, name, platform, campaignType, status, caption, hashtags, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [uuid(), video3Id, adminId, 'Bali Vlog Premiere', 'youtube', 'premiere', 'scheduled', 'Petualangan seru di Bali! Jangan lewatkan premiere-nya', '#Bali #Travel #Vlog #Indonesia'],
  });
  console.log('Marketing campaigns created');

  // Create notifications
  await client.execute({
    sql: `INSERT INTO Notification (id, userId, title, message, type, category, isAIGenerated, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [uuid(), adminId, 'Selamat Datang!', 'Selamat datang di YouTube Creator ERP. Sistem siap membantu mengelola channel Anda.', 'info', 'system', 0],
  });

  await client.execute({
    sql: `INSERT INTO Notification (id, userId, title, message, type, category, isAIGenerated, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [uuid(), adminId, 'Budget Alert', 'Budget lokasi untuk video Bali Vlog sudah mencapai 96%. Pertimbangkan untuk review pengeluaran.', 'warning', 'budget', 1],
  });
  console.log('Notifications created');

  console.log('\nSeeding complete!');
  console.log('Login credentials: admin@creator.io / admin123');
}

seed().catch(console.error);
