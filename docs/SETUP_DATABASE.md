# Database & Prisma ORM Setup

1. Pastikan PostgreSQL sudah berjalan dan DATABASE_URL sudah diatur di .env
2. Jalankan perintah berikut dari root monorepo:
   
   cd packages/prisma
   npm install prisma --save-dev
   npx prisma generate
   npx prisma migrate dev --name init

3. Skema awal sudah mencakup User, Role, Employee, Inventory, Finance, HRM, CRM, Sales.

4. Untuk update skema, edit schema.prisma lalu jalankan migrasi ulang.

---

Lanjutkan ke setup Next.js frontend setelah database siap.