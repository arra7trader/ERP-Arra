# PICA ERP - Setup Guide

## Prerequisites

Make sure you have the following installed:
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or pnpm

## Quick Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
npm install

# Return to root
cd ../..
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE pica_erp;
```

2. Configure environment variables:
```bash
# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Edit `apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pica_erp?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3001"
```

4. Generate Prisma client and push schema:
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

5. Seed the database with initial data:
```bash
npx ts-node prisma/seed.ts
```

### 3. Start Development Servers

```bash
# From root directory - start both servers
npm run dev

# Or start separately:
# API Server (http://localhost:3000)
npm run dev:api

# Web Server (http://localhost:3001)
npm run dev:web
```

### 4. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

### Default Login Credentials

```
Email: admin@pica.io
Password: admin123
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify the database exists

### Prisma Issues
```bash
# Reset Prisma client
cd apps/api
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
npx ts-node prisma/seed.ts
```

### Port Conflicts
- API defaults to port 3000
- Web defaults to port 3001
- Change in respective `.env` files if needed

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all development servers |
| `npm run dev:api` | Start only API server |
| `npm run dev:web` | Start only Web server |
| `npm run build` | Build all applications |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
pica-erp/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   ├── prisma/          # Prisma schema & seed
│   │   └── src/
│   │       ├── common/      # Shared modules (Prisma)
│   │       └── modules/     # Feature modules
│   │           ├── core/    # Auth, User, Dashboard
│   │           ├── crm/     # Customer, Lead, Sales
│   │           ├── finance/ # Invoice, Expense
│   │           ├── hrm/     # Employee, Attendance
│   │           └── inventory/ # Product, Warehouse
│   └── web/                 # Next.js Frontend
│       └── src/
│           ├── app/         # Pages
│           ├── components/  # UI Components
│           ├── contexts/    # React Contexts
│           ├── hooks/       # Custom Hooks
│           └── lib/         # API client
├── packages/                # Shared packages
└── docker/                  # Docker config
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard stats
- `GET /api/dashboard/charts` - Get chart data

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Customers (CRM)
- `GET /api/crm/customers` - List customers
- `GET /api/crm/customers/stats` - Get customer stats
- `POST /api/crm/customers` - Create customer
- `GET /api/crm/customers/:id` - Get customer
- `PUT /api/crm/customers/:id` - Update customer
- `DELETE /api/crm/customers/:id` - Delete customer

### Products (Inventory)
- `GET /api/inventory/products` - List products
- `GET /api/inventory/products/stats` - Get product stats
- `POST /api/inventory/products` - Create product
- `GET /api/inventory/products/:id` - Get product
- `PUT /api/inventory/products/:id` - Update product
- `DELETE /api/inventory/products/:id` - Delete product

### Invoices (Finance)
- `GET /api/finance/invoices` - List invoices
- `GET /api/finance/invoices/stats` - Get invoice stats
- `POST /api/finance/invoices` - Create invoice
- `GET /api/finance/invoices/:id` - Get invoice
- `PUT /api/finance/invoices/:id` - Update invoice
- `DELETE /api/finance/invoices/:id` - Delete invoice

### Employees (HRM)
- `GET /api/hrm/employees` - List employees
- `GET /api/hrm/employees/stats` - Get employee stats
- `POST /api/hrm/employees` - Create employee
- `GET /api/hrm/employees/:id` - Get employee
- `PUT /api/hrm/employees/:id` - Update employee
- `DELETE /api/hrm/employees/:id` - Delete employee
