# Development Server Setup

## Important: API Endpoints

The question packs and other API endpoints are **Vercel Serverless Functions** located in the `/api` directory. These will NOT work with the regular Vite dev server (`npm run dev`).

## How to Run with API Support

### Option 1: Use Vercel Dev (Recommended for API testing)

```bash
npm run dev:full
```

This starts:

- Vite dev server (frontend) on port 5000
- Vercel serverless functions (API) on local environment
- Hot reload for both frontend and backend

### Option 2: Use Regular Vite (Frontend only)

```bash
npm run dev
```

This starts:

- Vite dev server on port 5000
- Frontend hot reload works
- ⚠️ API endpoints will NOT work (question packs won't load)

## When to Use Each

### Use `npm run dev:full` when:

- Testing question packs
- Testing authentication (Google OAuth)
- Testing admin dashboard
- Testing any API functionality
- Working on serverless functions

### Use `npm run dev` when:

- Only working on UI/styling
- Working on components without API dependencies
- Faster startup time needed
- API endpoints are not required

## Troubleshooting

### Question Packs Not Loading?

**Problem**: Empty question pack list or "No packs available"

**Solution**: Make sure you're using `npm run dev:full` instead of `npm run dev`

The `/api/question-sets` endpoint is a Vercel function and requires `vercel dev` to run.

### Port Already in Use?

If port 5000 is busy:

```bash
# Windows (PowerShell)
npm run kill

# Or manually
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Environment Variables

Make sure you have `.env.local` with:

```env
POSTGRES_POSTGRES_URL=your_database_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

These are loaded by `vercel dev` automatically.
