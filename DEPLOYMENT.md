# Deployment Guide - Vercel + Supabase

This guide explains how to deploy Highlight Tax Services to Vercel with a Supabase database.

## Prerequisites

1. **GitHub Account** - For repository hosting
2. **Vercel Account** - For deployment (https://vercel.com)
3. **Supabase Account** - For database (https://supabase.com)
4. **Domain** - Your custom domain

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: `highlight-tax-services`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `East US` for NY)
4. Click "Create new project"
5. Wait for the database to be provisioned (~2 minutes)

### 1.2 Get Your Database URL

1. In your Supabase project, go to **Settings** > **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. Replace `[password]` with your actual database password

> **Important**: Use the **Transaction** (port 6543) connection for serverless environments like Vercel.

### 1.3 Run Database Migrations

Before deploying, you need to create the database tables.

**Option A: From your local machine**
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/highlight-tax-services.git
cd highlight-tax-services

# Install dependencies
npm install

# Set the Supabase DATABASE_URL
export DATABASE_URL="your-supabase-connection-string"

# Push the schema to Supabase
npm run db:push
```

**Option B: From Replit**
1. Update the `DATABASE_URL` secret in Replit to your Supabase URL
2. Run `npm run db:push` in the Shell

---

## Step 2: Prepare for Vercel

### 2.1 Project Structure for Vercel

The project uses a monorepo structure. Vercel needs to know how to build it.

Create `vercel.json` in the project root:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": null
}
```

> **Note**: Vercel will detect the Express server and configure routing automatically. The build outputs to `dist/` with the server at `dist/index.cjs` and frontend assets in `dist/public/`.

### 2.2 Verify package.json Scripts

The project already has the necessary scripts:

```json
{
  "scripts": {
    "build": "tsx script/build.ts",
    "start": "NODE_ENV=production node dist/index.cjs",
    "db:push": "drizzle-kit push"
  }
}
```

The build script (`script/build.ts`) handles:
- Building the React frontend with Vite
- Bundling the Express server with esbuild
- Output goes to `dist/` directory

---

## Step 3: Environment Variables

### Required Variables for Vercel

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase connection string | `postgresql://postgres...` |
| `SESSION_SECRET` | Secret for JWT tokens (min 32 chars) | `your-super-secret-key-here-32chars` |
| `NODE_ENV` | Environment mode | `production` |
| `VITE_APP_URL` | Full URL of your deployed application | `https://highlighttax.com` |

### Optional Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `RESEND_API_KEY` | For email notifications | Contact form emails |

### Generate a Session Secret

Run this in your terminal to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub

```bash
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Highlight Tax Services"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/highlight-tax-services.git

# Push
git push -u origin main
```

### 4.2 Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose your `highlight-tax-services` repository
5. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Add Environment Variables

In the Vercel project settings:

1. Go to **Settings** > **Environment Variables**
2. Add each variable:
   - `DATABASE_URL` = Your Supabase connection string
   - `SESSION_SECRET` = Your generated secret
   - `NODE_ENV` = `production`
   - `VITE_APP_URL` = Your domain URL (e.g., `https://highlighttax.com`)

3. Click "Save"

> **Important**: Set `VITE_APP_URL` to your actual domain. This is used for generating links in emails (password reset, etc.) and must match your deployed domain.

### 4.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app is now live!

---

## Step 5: Connect Custom Domain

### 5.1 Add Domain in Vercel

1. Go to your project in Vercel
2. Click **Settings** > **Domains**
3. Enter your domain (e.g., `highlighttaxservices.com`)
4. Click "Add"

### 5.2 Configure DNS

Vercel will show you the DNS records to add. Typically:

**For apex domain (highlighttaxservices.com)**:
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain**:
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### 5.3 SSL Certificate

Vercel automatically provisions an SSL certificate. Wait a few minutes after DNS propagation.

---

## Step 6: Post-Deployment

### 6.1 Create Admin User

After deployment, register a new user and then update their role in Supabase:

1. Go to Supabase Dashboard > SQL Editor
2. Run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

### 6.2 Test the Application

1. Visit your domain
2. Test user registration
3. Test admin login
4. Verify document uploads work
5. Test the contact form

---

## Troubleshooting

### Database Connection Issues

**Error**: `SSL connection required`
- Ensure `DATABASE_URL` uses the correct Supabase connection string
- The app automatically enables SSL for Supabase connections

**Error**: `Connection timeout`
- Use the Transaction (port 6543) connection string, not Session (port 5432)
- Check Supabase project is not paused

### Build Failures

**Error**: `Cannot find module`
- Run `npm install` locally and push `package-lock.json`
- Ensure all dependencies are in `package.json`

### WebSocket Issues

Note: WebSocket features (real-time notifications) require additional configuration for Vercel Serverless Functions. Consider using Supabase Realtime or Pusher for production real-time features.

---

## File Storage Note

Currently, uploaded files are stored on the server filesystem. For Vercel (serverless), you'll need to migrate to:

1. **Supabase Storage** - Recommended, integrates with your existing Supabase project
2. **AWS S3** - Enterprise option
3. **Cloudinary** - Good for image optimization

To implement Supabase Storage, update `server/routes.ts` to use the Supabase Storage API instead of local file system.

---

## Environment Comparison

| Feature | Replit | Vercel + Supabase |
|---------|--------|-------------------|
| Database | Built-in PostgreSQL | Supabase PostgreSQL |
| File Storage | Local filesystem | Supabase Storage (recommended) |
| WebSockets | Supported | Requires Pusher/Ably/Supabase Realtime |
| SSL | Automatic | Automatic |
| Custom Domain | Paid feature | Included |

---

## Support

For issues with:
- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **Application**: Review logs in Vercel Dashboard > Deployments > Functions

---

## Quick Checklist

- [ ] Supabase project created
- [ ] Database URL obtained
- [ ] Schema pushed to Supabase (`npm run db:push`)
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Domain connected
- [ ] Admin user created
- [ ] Application tested
