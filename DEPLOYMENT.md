# Render Deployment Guide

## Prerequisites
- Render account (sign up at https://render.com)
- GitHub repository with your code
- PostgreSQL database with pgvector extension

## Step 1: Create PostgreSQL Database on Render

1. Go to Render Dashboard → New → PostgreSQL
2. Create a new PostgreSQL database
3. **Important**: After creation, go to the database's "Shell" tab and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy the **Internal Database URL** (you'll need this)

## Step 2: Deploy Web Service

### Option A: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Go to Render Dashboard → New → Blueprint
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and deploy

### Option B: Manual Setup
1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `rag-backend`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Root Directory**: (leave empty or set to root)

## Step 3: Environment Variables

Add these environment variables in Render Dashboard → Your Service → Environment:

### Required Variables:
```
PORT=10000
DATABASE_URL=<your-postgres-internal-connection-string>
JWT_SECRET=<generate-a-random-secret-key>
HF_API_KEY=<your-huggingface-api-key>
GEMINI_API_KEY=<your-google-gemini-api-key>
CLOUDINARY_CLOUD=<your-cloudinary-cloud-name>
CLOUDINARY_KEY=<your-cloudinary-api-key>
CLOUDINARY_SECRET=<your-cloudinary-api-secret>
NODE_ENV=production
```

### How to get API Keys:
- **HF_API_KEY**: https://huggingface.co/settings/tokens
- **GEMINI_API_KEY**: https://makersuite.google.com/app/apikey
- **CLOUDINARY**: https://cloudinary.com/console

## Step 4: Run Database Migrations

After deployment, run migrations using Render Shell:

1. Go to your Web Service → Shell
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

Or use Render's PostgreSQL Shell:
```bash
psql $DATABASE_URL -f prisma/migrations/20251115160415_init/migration.sql
```

## Step 5: Verify Deployment

1. Check health endpoint: `https://your-service.onrender.com/health`
2. Should return: `{"status":"healthy","database":"connected",...}`

## Important Notes

- **Port**: Render automatically sets `PORT` environment variable, but ensure your code uses `process.env.PORT`
- **Database**: Use the **Internal Database URL** for `DATABASE_URL` (not the external one)
- **pgvector**: Make sure the vector extension is enabled in your PostgreSQL database
- **Build Time**: First build may take 5-10 minutes
- **Cold Starts**: Free tier services spin down after inactivity (15 min), first request may be slow

## Troubleshooting

### Build Fails
- Check build logs in Render Dashboard
- Ensure TypeScript compiles successfully (`npm run build`)
- Verify Prisma generates client (`prisma generate`)

### Database Connection Issues
- Verify `DATABASE_URL` uses internal connection string
- Check if pgvector extension is installed
- Verify database is in same region as web service

### Port Issues
- Render sets PORT automatically, don't hardcode it
- Your code should use `process.env.PORT`

## File Structure
```
rag_backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Express app
│   └── ...
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
├── tsconfig.json
├── render.yaml           # Render config (optional)
└── .renderignore         # Files to ignore
```

