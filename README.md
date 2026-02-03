# Move on Calendar

A production-ready full-stack web app to track no-contact days after a breakup. Track days, add notes and emotions, visualize progress on a calendar, and monitor streaks.

## Features

- **Calendar visualization**: Mark each day as NO_CONTACT, CONTACT, or RESET
- **Notes & emotions**: Add text notes and emoji for each day
- **Day Counter Widget**: Current streak, longest streak, total no-contact days
- **Stats dashboard**: Monthly breakdown, streak history
- **User management**: Login/Register, Admin can manage users
- **Targets**: Track multiple people (e.g., ex-partners) separately

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, React Router, Axios, react-calendar
- **Backend**: Node.js + Express, JWT auth, bcrypt
- **Database**: PostgreSQL + Prisma ORM

## Folder Structure

```
project-root/
├── frontend/          # React app
├── backend/           # Express API
├── database/
│   └── prisma/       # Schema & seed
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE move_on_calendar;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, FRONTEND_URL

npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. Environment Variables

**Backend (.env)**

| Variable      | Description                          |
|---------------|--------------------------------------|
| PORT          | Server port (default: 5000)          |
| DATABASE_URL  | PostgreSQL connection string         |
| JWT_SECRET    | Secret for JWT (min 32 chars)        |
| JWT_EXPIRES_IN| Token expiry (e.g. 7d)               |
| FRONTEND_URL  | Frontend URL for CORS (e.g. http://localhost:5173) |

**Frontend**

Create `frontend/.env` if needed:

```
VITE_API_URL=/api
```

The Vite dev server proxies `/api` to the backend by default.

### 5. Seed Admin User

After `npm run db:seed`:

- **Email**: kookie@moveon.com
- **Password**: jk110604

## API Endpoints

### Auth
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Current user

### Targets
- `POST /targets` - Create target
- `GET /targets` - List targets
- `DELETE /targets/:id` - Delete target

### Calendar Entries
- `GET /entries?from=&to=&targetId=` - List entries
- `POST /entries` - Create/update entry
- `DELETE /entries/:id` - Delete entry

### Stats
- `GET /stats?targetId=` - Day counter stats

### Banner
- `GET /banner/active` - Get active banner (public)

### Notices (auth required)
- `GET /notices` - List notices for current user (supports `page`, `limit`)
- `GET /notices/unread-count` - Get unread count
- `POST /notices/:id/read` - Mark one notice as read
- `POST /notices/read-all` - Mark all as read

### Admin (admin only)
- `POST /admin/users` - Create user
- `GET /admin/users` - List users
- `PATCH /admin/users/:id/active` - Toggle user active
- `POST /admin/banner` - Upload banner image (multipart/form-data, field: `image`)
- `DELETE /admin/banner/:id` - Remove banner
- `POST /admin/notices` - Create notice (broadcasts to all active users)
- `GET /admin/notices` - List all notices
- `DELETE /admin/notices/:id` - Delete notice

## Usage

1. Register or login
2. Add a target (person you're tracking no-contact with)
3. Select the target and click days on the calendar to mark them
4. Use the Day Counter Widget to see your streak
5. Admin users can manage other users at `/admin/users`, upload dashboard banners at `/admin/banner`, and send notices at `/admin/notices`
6. All users see a notification bell in the navbar; notices appear in a dropdown and can be marked as read

### Banner Setup (Admin)
- Admins can upload a banner at `/admin/banner`
- Supported formats: PNG, JPG, WebP (max 2MB)
- The active banner appears on every user's dashboard (right panel)
- Uploads are stored in `backend/uploads/` (created automatically)

## Production Build

```bash
# Backend
cd backend && npm run db:migrate:prod && npm start

# Frontend
cd frontend && npm run build
# Serve the dist/ folder with nginx, Vercel, etc.
```

## Troubleshooting

### "Cannot read properties of undefined (reading 'updateMany')" on Banner upload

This happens when the Prisma client was generated before the Banner model was added. Regenerate the client and push the schema:

1. **Stop the backend server** (Ctrl+C in the terminal running `npm run dev`)
2. From the project root:
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   npm run dev
   ```
3. Restart the frontend if needed.

The backend must be stopped before `db:generate` because it locks the Prisma client files.

### Notices feature (new tables)

After adding the Notice/UserNotice models, stop the backend and run:

```bash
cd backend
npm run db:generate
npm run db:push
npm run dev
```
