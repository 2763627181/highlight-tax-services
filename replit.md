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
- **Authentication**: Hybrid system - JWT tokens + OAuth via Replit Auth (Google, GitHub, Apple)

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

- **users**: User accounts (admin, preparer, client roles) with extended profile fields (address, SSN, DOB)
- **authIdentities**: OAuth identity mappings (links OAuth providers to user accounts)
- **sessions**: Session storage for OAuth authentication
- **taxCases**: Tax filing cases with status tracking
- **documents**: Uploaded files with categories (W-2, 1099, ID, receipts, bank statements, etc.)
- **appointments**: Scheduled client appointments
- **messages**: Case-related messages
- **contactSubmissions**: Contact form submissions
- **activityLogs**: System activity logging

### Document Categories
- id_document: ID / Identificación
- w2: Formulario W-2
- form_1099: Formulario 1099
- bank_statement: Estado de Cuenta Bancario
- receipt: Recibo / Comprobante
- previous_return: Declaración Anterior
- social_security: Tarjeta de Seguro Social
- proof_of_address: Comprobante de Domicilio
- other: Otro Documento

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new client (password: 8+ chars, uppercase, lowercase, number)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /api/login` - OAuth login via Replit Auth (Google, GitHub, Apple)
- `GET /api/callback` - OAuth callback handler
- `GET /api/@me` - Get OAuth user info

### Client Routes
- `GET /api/cases` - Get client's tax cases
- `GET /api/documents` - Get client's documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id/download` - Download document
- `GET /api/appointments` - Get client's appointments
- `POST /api/appointments` - Schedule appointment

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/clients` - All clients with document/case counts
- `GET /api/admin/clients/:id` - Get client details (client, documents, cases, appointments)
- `GET /api/admin/cases` - All tax cases
- `POST /api/admin/cases` - Create new case
- `PATCH /api/admin/cases/:id` - Update case
- `GET /api/admin/appointments` - All appointments
- `GET /api/admin/documents` - All documents
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
   - Services grid with service-specific WhatsApp auto-messages
   - About section with contact info
   - Contact form
   - Bilingual support (English/Spanish)

2. **Client Portal**
   - Secure registration/login (email/password)
   - Social login options (Google, GitHub, Apple via OAuth)
   - Document upload with categories (W-2, 1099, ID, receipts, etc.)
   - Case status tracking with progress bars
   - Appointment scheduling

3. **Admin Dashboard**
   - Organized client information with document/case counts
   - Case status updates with notes
   - Document management with categories
   - Appointment management
   - Statistics overview
   - Contact submissions management

4. **Security** (See SECURITY.md for details)
   - Password strength validation (8+ chars, uppercase, lowercase, number)
   - JWT authentication with secure cookies (httpOnly, secure, SameSite: strict)
   - Session secret from environment variable
   - Rate limiting per endpoint:
     - Auth endpoints: 5 requests/15 min
     - Upload: 10 requests/15 min
     - Contact form: 3 requests/hour
     - Messages: 30 requests/15 min
   - File upload security:
     - MIME type validation
     - Extension whitelist (pdf, jpg, jpeg, png, gif, doc, docx)
     - Size limit: 10MB
     - Filename sanitization
   - WebSocket security:
     - JWT authentication required
     - Connection limit: 5 per user
     - Message size limit: 1KB
     - Heartbeat: 30 seconds
   - Security headers via Helmet middleware
   - HTTP Parameter Pollution (HPP) protection

5. **Dark Mode**
   - Full dark mode support
   - Theme toggle in header

6. **WhatsApp Integration**
   - Floating button for quick contact
   - Service-specific auto-messages when clicking service cards

## Running the Application

The application runs on port 5000:
- Frontend and Backend are served together
- Database: PostgreSQL (Neon-backed)
