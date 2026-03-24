# Makaan

Modern real-estate web app built with Next.js App Router, with an AI-ready data model and personalization features.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and update your database URL:

```bash
cp .env.example .env
```

3. Start your PostgreSQL database, then initialize Prisma:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Run the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Database commands

- `npm run db:generate`: Generate Prisma client.
- `npm run db:migrate`: Create and apply a migration in development.
- `npm run db:push`: Push schema changes without creating migration files.
- `npm run db:seed`: Seed sample listings.
- `npm run db:studio`: Open Prisma Studio.

## API endpoints

- `GET /api/listings`: List/search listings.
- `GET /api/listings?listingType=sale&status=available&limit=12`: Filter listings.
- `GET /api/listings/[slug]`: Fetch one listing by slug.

## AI-ready schema notes

The `Listing` model includes fields for AI features:

- `aiSummary`: generated natural-language summary.
- `embeddingModel`: model metadata for vectors.
- `embeddingVector`: JSON placeholder for embeddings until pgvector is added.

Additional models (`SearchEvent`, `SavedListing`, `Inquiry`) capture behavior and intent signals for future AI ranking and assistant workflows.
