# Behaviour Journal App

A simple web application to record children's behavioural incidents for emotional support and EHCP evidence.

## Features

- **Role-based Authentication**: Admin and standard user roles
- **Children Management**: Pre-configured for Kat and Kie
- **Behaviour Entry Tracking**: Record incidents with detailed information
- **Export Reports**: Generate CSV and PDF reports
- **Database Backup**: Admin-only SQL backup functionality
- **Mobile-Friendly**: Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **Authentication**: JWT with bcrypt
- **Styling**: Tailwind CSS v4
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

### Installation

1. Clone the repository:
```bash
cd behavior_journal
```

2. Install dependencies:
```bash
npm install
```

3. Start the PostgreSQL database:
```bash
docker-compose up -d postgres
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Credentials

- **Admin User**:
  - Username: `kevin`
  - Password: `password123`
  - Role: Admin (can edit/delete entries, access backup)

- **Standard User**:
  - Username: `wife`
  - Password: `password123`
  - Role: User (can add entries, view/export)

## Project Structure

```
behavior_journal/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── login/           # Authentication
│   │   ├── kids/            # Kids endpoints
│   │   ├── entries/         # Behaviour entries CRUD
│   │   └── backup/          # Database backup
│   ├── kids/                # Kids selection & entries pages
│   ├── report/              # Export functionality
│   ├── admin/               # Admin-only pages
│   └── login/               # Login page
├── components/              # Reusable React components
├── lib/                     # Utility functions
│   ├── db.ts               # Database connection
│   ├── auth.ts             # Authentication utilities
│   └── types.ts            # TypeScript types
├── schema.sql              # Database schema
├── init-db.sql             # Initial data
├── docker-compose.yml      # Docker services configuration
├── Dockerfile              # Production build
└── .env.local              # Environment variables
```

## Database Schema

### Users Table
- `id`: Serial primary key
- `username`: Unique username
- `password`: Bcrypt hashed password
- `role`: 'admin' or 'user'

### Kids Table
- `id`: Serial primary key
- `name`: Child's name (Kat, Kie)

### Behaviour Entries Table
- `id`: Serial primary key
- `kid_id`: Foreign key to kids
- `user_id`: Foreign key to users
- `event_date`: Timestamp of incident
- `trigger`: Dropdown options (Transition, Denied Request, etc.)
- `behaviour`: Dropdown options (Crying, Shouting, etc.)
- `intensity`: Low/Medium/High
- `duration_minutes`: Integer
- `resolution`: Text description
- `outcome`: Resolved/Partially/Not Resolved
- `notes`: Additional notes
- `created_at`: Record creation timestamp

## API Endpoints

### Authentication
- `POST /api/login` - Login with username/password
- `DELETE /api/login` - Logout

### Kids
- `GET /api/kids` - Get all kids

### Entries
- `POST /api/entries` - Create new entry (all users)
- `GET /api/entries?kid_id=1&from=2025-01-01&to=2025-01-31` - List entries with filters
- `PUT /api/entries/:id` - Update entry (admin only)
- `DELETE /api/entries/:id` - Delete entry (admin only)

### Reports
- `GET /api/entries/export?format=csv&kid_id=1` - Export as CSV
- `GET /api/entries/export?format=pdf&kid_id=1` - Export as PDF

### Backup
- `GET /api/backup` - Download SQL backup (admin only)

## Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://behavior_user:behavior_pass@localhost:15432/behavior_journal
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Deployment

### Using Docker Compose (Recommended)

1. Build and start all services:
```bash
docker-compose up -d
```

2. Access the application at [http://localhost:3000](http://localhost:3000)

3. PostgreSQL runs on port 15432 (host) -> 5432 (container)

### Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Management

Connect to PostgreSQL:
```bash
docker exec -it behavior_journal_db psql -U behavior_user -d behavior_journal
```

View logs:
```bash
docker logs behavior_journal_db
```

## User Workflows

### Admin Workflow
1. Login with admin credentials
2. Select child (Kat or Kie)
3. View/add/edit/delete entries
4. Export reports (CSV/PDF)
5. Download database backups

### Standard User Workflow
1. Login with user credentials
2. Select child (Kat or Kie)
3. Add new entries
4. View entries (read-only)
5. Export reports (CSV/PDF)

## Security Considerations

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Passwords are hashed with bcrypt (10 rounds)
- Session cookies are httpOnly
- Role-based access control enforced

## Troubleshooting

### Port Already in Use
If port 5432 is occupied, the app uses port 15432 for PostgreSQL.

### Database Connection Issues
Ensure PostgreSQL container is running:
```bash
docker ps | grep behavior_journal_db
```

### Tailwind CSS Issues
The app uses Tailwind CSS v4 with `@tailwindcss/postcss`. Ensure PostCSS config is correct.

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
