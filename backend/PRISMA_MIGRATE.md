# Prisma Migrate - Neon & Render Setup

## Commands Reference

### Local development (with Neon DATABASE_URL in .env)
```bash
cd backend

# Create a new migration after schema changes
npx prisma migrate dev --name your_migration_name

# Apply pending migrations (production-style)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Baselining an existing database (one-time)
If you get "The database schema is not empty" when running `migrate deploy`:
```bash
cd backend
npx prisma migrate resolve --applied 0_init
npx prisma migrate deploy
```

## Render auto-migration

The `render.yaml` in the repo root configures:
- **Build Command:** `npm install && npx prisma generate`
- **Pre-Deploy Command:** `npx prisma migrate deploy`
- **Root Directory:** `backend`

Migrations run automatically on every deploy. Ensure `DATABASE_URL` is set in the Render Dashboard (from Neon).

## Banner model (Cloudinary URLs)

The Banner model stores full Cloudinary URLs in `image_url` (TEXT):

```prisma
model Banner {
  id        String   @id @default(uuid())
  imageUrl  String   @map("image_url")   // Full URL, e.g. https://res.cloudinary.com/...
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  @@map("banners")
}
```

PostgreSQL TEXT supports URLs of any practical length.
