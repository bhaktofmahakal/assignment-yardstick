# Multi-Tenant SaaS Notes Application

A production-ready multi-tenant SaaS application built with Next.js, TypeScript, Prisma, and PostgreSQL. Deployed on Vercel with comprehensive E2E testing.

## Features

- **Multi-Tenancy**: Shared schema approach with tenant ID isolation
- **Authentication**: JWT-based authentication with role-based access control
- **Subscription Plans**: Free (3 notes max) and Pro (unlimited) tiers
- **Notes Management**: Full CRUD operations with tenant isolation
- **Real-time UI**: React-based frontend with responsive design
- **Production Ready**: Deployed on Vercel with CORS enabled

## Multi-Tenancy Architecture

This application implements a **shared schema with tenant ID** approach for multi-tenancy:

- Single database with all tables containing a `tenantId` column
- Strict data isolation enforced at the application level
- All queries automatically filtered by tenant context
- Cost-effective and scalable solution for moderate tenant counts

### Why Shared Schema?
- **Cost Efficiency**: Single database reduces infrastructure costs
- **Maintenance**: Easier schema migrations and updates
- **Scalability**: Can handle hundreds of tenants efficiently
- **Development**: Simpler codebase compared to schema-per-tenant

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Testing**: Playwright

## Test Accounts

All accounts use password: `password`

| Email | Role | Tenant | Plan |
|-------|------|--------|------|
| admin@acme.test | Admin | Acme | Free |
| user@acme.test | Member | Acme | Free |
| admin@globex.test | Admin | Globex | Free |
| user@globex.test | Member | Globex | Free |

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Authentication
- `POST /api/auth/login` - User login

### Notes Management
- `GET /api/notes` - List tenant notes
- `POST /api/notes` - Create note (enforces plan limits)
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro (Admin only)

## Development Setup

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > Database
   - Copy your connection string
   - Update `.env.local` with your Supabase DATABASE_URL

3. **Environment Variables**
   ```bash
   cp .env.example .env.local
   # Update DATABASE_URL with your Supabase connection string
   # Example: DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

4. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```

6. **Run Tests**
   ```bash
   npm test
   ```

## Deployment

The application is configured for Vercel deployment with Supabase:

1. **Supabase Production Setup**:
   - Create a production project at [supabase.com](https://supabase.com)
   - Run the migration: `npx prisma db push`
   - Run the seed: `npm run db:seed`

2. **Vercel Environment Variables**:
   - `DATABASE_URL`: Supabase PostgreSQL connection string
   - `JWT_SECRET`: Strong secret key for JWT tokens
   - `NEXTAUTH_SECRET`: NextAuth secret

3. **Deploy**:
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy automatically

## Security Features

- **Tenant Isolation**: Strict data separation at query level
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and Member role enforcement
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Proper cross-origin resource sharing

## Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Static generation where appropriate
- **API Response**: Minimal data transfer
- **Client-Side**: Efficient React state management

## Production Considerations

- **Database Connection Pooling**: Configured for Vercel serverless
- **Error Handling**: Comprehensive error responses
- **Logging**: Structured logging for monitoring
- **Rate Limiting**: Ready for rate limiting implementation
- **Monitoring**: Health check endpoint for uptime monitoring

## License

MIT License