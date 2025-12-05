# Highlight Tax Services

A full-stack professional tax services web system for a US-based tax preparation business.

## Overview

This application provides:
- **Public Landing Page**: Modern, responsive website with Hero section, services showcase, about section, and contact form
- **Client Portal**: Registration, login, document upload, case status tracking, and appointment scheduling
- **Admin Dashboard**: Client management, document viewer, case management, statistics, and appointment management
- **WhatsApp Integration**: Floating button for direct customer contact

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing), TanStack Query
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── header.tsx       # Navigation header
│   │   ├── hero-section.tsx # Landing page hero
│   │   ├── services-section.tsx
│   │   ├── about-section.tsx
│   │   ├── contact-section.tsx
│   │   ├── footer.tsx
│   │   ├── whatsapp-button.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/               # Page components
│   │   ├── home.tsx         # Landing page
│   │   ├── portal.tsx       # Login/Register
│   │   ├── dashboard.tsx    # Client dashboard
│   │   ├── admin.tsx        # Admin dashboard
│   │   ├── privacy-policy.tsx
│   │   ├── terms.tsx
│   │   └── policies.tsx
│   ├── lib/
│   │   ├── auth-context.tsx # Authentication context
│   │   ├── theme-provider.tsx # Dark mode provider
│   │   └── queryClient.ts   # TanStack Query setup
│   └── App.tsx              # Main app with routing
server/
├── db.ts                    # Database connection
├── storage.ts               # Data access layer
├── routes.ts                # API endpoints
└── index.ts                 # Express server
shared/
└── schema.ts                # Database schema & types
```

## Database Schema

- **users**: User accounts (admin, preparer, client roles)
- **taxCases**: Tax filing cases with status tracking
- **documents**: Uploaded files (W-2, 1099, etc.)
- **appointments**: Scheduled client appointments
- **messages**: Case-related messages
- **contactSubmissions**: Contact form submissions
- **activityLogs**: System activity logging

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Client Routes
- `GET /api/cases` - Get client's tax cases
- `GET /api/documents` - Get client's documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id/download` - Download document
- `GET /api/appointments` - Get client's appointments
- `POST /api/appointments` - Schedule appointment

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/clients` - All clients
- `GET /api/admin/cases` - All tax cases
- `POST /api/admin/cases` - Create new case
- `PATCH /api/admin/cases/:id` - Update case
- `GET /api/admin/appointments` - All appointments
- `GET /api/admin/contacts` - Contact submissions

### Public Routes
- `POST /api/contact` - Submit contact form

## Color Scheme

- **Primary**: Dark Blue (#0A3D62) - Trust and professionalism
- **Accent**: Green (#2ECC71) - Financial success
- **Neutral**: White backgrounds for clarity

## Business Information

- **Name**: Highlight Tax Services
- **Address**: 84 West 188th Street, Apt 3C, Bronx, NY 10468
- **Phone**: +1 917-257-4554
- **Email**: servicestaxx@gmail.com
- **WhatsApp**: https://wa.me/19172574554

## Features

1. **Landing Page**
   - Professional hero section with CTAs
   - Services grid with WhatsApp links
   - About section with contact info
   - Contact form

2. **Client Portal**
   - Secure registration/login
   - Document upload (W-2, 1099, receipts)
   - Case status tracking with progress bars
   - Appointment scheduling

3. **Admin Dashboard**
   - Client management
   - Case status updates
   - Document viewer
   - Appointment management
   - Statistics overview

4. **Dark Mode**
   - Full dark mode support
   - Theme toggle in header

## Running the Application

The application runs on port 5000:
- Frontend and Backend are served together
- Database: PostgreSQL (Neon-backed)
