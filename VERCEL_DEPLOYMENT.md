# Vercel Branch Deployment Guide

This guide explains how to deploy your branch to a development environment on Vercel.

## Method 1: Automatic Branch Deployments (Recommended)

Vercel automatically creates preview deployments for every branch push. Here's how to set it up:

### Step 1: Connect Your Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel will automatically detect Next.js

### Step 2: Configure Branch Deployments

1. In your Vercel project dashboard, go to **Settings** → **Git**
2. Under **Production Branch**, set your main branch (usually `main` or `master`)
3. **Preview Deployments** are enabled by default - every branch push creates a preview URL

### Step 3: Set Up Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add your environment variables for different environments:
   - **Production**: Variables for production branch
   - **Preview**: Variables for all other branches (development/staging)
   - **Development**: Variables for `vercel dev` command

**Required Environment Variables:**
- `DATABASE_URL` - Your MySQL database connection string
- `NEXTAUTH_URL` - Your app URL (use preview URL for development)
- `NEXT_PUBLIC_APP_URL` - Public app URL
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Email configuration

**Tip**: For preview deployments, you can use Vercel's automatic URL:
- `NEXTAUTH_URL`: Use `https://your-branch-name-your-team.vercel.app`
- Or use a wildcard: `https://*-your-team.vercel.app`

### Step 4: Deploy Your Branch

1. Push your branch to GitHub/GitLab/Bitbucket:
   ```bash
   git push origin your-branch-name
   ```

2. Vercel will automatically:
   - Detect the push
   - Create a preview deployment
   - Generate a unique URL like: `https://your-branch-name-your-team.vercel.app`

3. Check the **Deployments** tab in Vercel dashboard to see your deployment

## Method 2: Manual Deployment via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
# or
yarn global add vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Your Project

```bash
vercel link
```

This will:
- Ask you to select/create a project
- Create a `.vercel` folder with project configuration

### Step 4: Deploy to Preview (Development)

```bash
vercel
```

This creates a preview deployment (development environment).

### Step 5: Deploy to Production

```bash
vercel --prod
```

## Method 3: Create a Development Branch Environment

To have a dedicated development environment:

1. Create a branch called `development` or `dev`
2. In Vercel dashboard: **Settings** → **Git** → **Branch Protection**
3. Add your development branch
4. Configure environment variables specifically for this branch

## Environment-Specific Configuration

### For Development/Preview Deployments:

Set these in Vercel dashboard under **Environment Variables** → **Preview**:

```
NODE_ENV=development
DATABASE_URL=your-dev-database-url
NEXTAUTH_URL=https://your-preview-url.vercel.app
NEXT_PUBLIC_APP_URL=https://your-preview-url.vercel.app
```

### For Production:

Set these under **Environment Variables** → **Production**:

```
NODE_ENV=production
DATABASE_URL=your-prod-database-url
NEXTAUTH_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## Database Migrations

For preview deployments, you may want to run migrations. Add a build script or use Vercel's build command:

The `vercel.json` is configured to run Prisma generate during build. For migrations, you can:

1. Add a build script in `package.json`:
   ```json
   "build:dev": "npx prisma generate && npx prisma migrate deploy && next build"
   ```

2. Or configure in Vercel dashboard: **Settings** → **General** → **Build & Development Settings**

## Troubleshooting

### Build Fails with Prisma Errors

- Ensure `DATABASE_URL` is set correctly
- Check that Prisma can connect to your database
- Verify network access (if using external database)

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Preview/Production)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Preview URL Not Accessible

- Check deployment logs in Vercel dashboard
- Verify build completed successfully
- Check if domain restrictions are set

## Useful Vercel CLI Commands

```bash
# Deploy current branch as preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Open deployment in browser
vercel open
```

## Next Steps

1. Push your branch to trigger automatic deployment
2. Check the Vercel dashboard for deployment status
3. Access your preview URL from the Deployments tab
4. Share the preview URL with your team for testing

