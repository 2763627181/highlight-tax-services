# Design Guidelines for Highlight Tax Services

## Design Approach
**Reference-Based**: Tax/Financial services professional aesthetic (think TurboTax, H&R Block) - clean, trustworthy, and accessible design that conveys expertise and reliability.

## Color Palette
- **Primary**: Dark Blue (#0A3D62) - conveys trust and professionalism
- **Accent**: Green (#2ECC71) - represents financial success and growth
- **Neutral**: White backgrounds for clarity and cleanliness

## Typography System
- **Headings**: Bold, clear sans-serif (2xl to 4xl for hero, xl to 2xl for sections)
- **Body**: Readable sans-serif, 16px base
- **CTAs**: Medium weight, slightly larger (text-lg)
- Bilingual support: Clean rendering for English and Spanish text

## Layout System
**Spacing**: Use Tailwind units of 4, 6, 8, 12, 16, and 20 for consistent rhythm
- Section padding: `py-16` to `py-20`
- Component spacing: `space-y-8` or `space-y-12`
- Container: `max-w-7xl mx-auto px-4`

## Component Library

### Header
- Logo placeholder + "Highlight Tax Services" text
- Navigation: Inicio | Servicios | Nosotros | Contacto | Portal Cliente | Policies
- Sticky navigation with subtle shadow on scroll

### Hero Section
- **Image**: Professional tax season background (desk with tax forms, calculator, professional setting)
- **Headline**: "Maximiza tu reembolso con expertos en impuestos."
- **Primary CTA**: "Agendar Cita" (green background, white text)
- **Secondary CTA**: "Portal de Clientes" (outlined, blue border)
- Buttons with backdrop-blur when on image background
- Height: 80vh for impact

### WhatsApp Floating Button
- Fixed bottom-right position (bottom-6 right-6)
- Green circular button with WhatsApp icon
- Always visible, z-index high
- Links to: https://wa.me/19172574554?text=Hola%20quiero%20información%20sobre%20sus%20servicios%20de%20taxes

### Benefits Section (Quick Trust Builders)
- 4-column grid (responsive: 1 col mobile, 2 tablet, 4 desktop)
- Icon + short text for each:
  - Preparadores certificados
  - Reembolsos rápidos  
  - Servicio en inglés y español
  - Total confidencialidad

### Services Section
- 6 service cards in responsive grid (1-2-3 columns)
- Each card: Icon, Title, Description, WhatsApp CTA button
- Cards with subtle hover elevation
- Services: Personal Taxes, Self-Employed, Business, ITIN, Bookkeeping, Amendments

### About Section
- 2-column layout (text + info box)
- Company description with bullet points
- Contact information prominently displayed:
  - Address: 84 West 188th Street, Apt 3C — Bronx, NY 10468
  - Phone: +1 917-257-4554
  - Email: servicestaxx@gmail.com

### Contact Form
- Clean form with fields: Nombre, Email, Teléfono, Mensaje
- Submits to: servicestaxx@gmail.com
- Success message: "Gracias por contactarnos. Responderemos pronto."
- Form validation with inline error messages

### Footer
- Multi-column layout: Company info, Quick links, Contact
- Links: Privacy Policy, Terms, Portal de Clientes
- Copyright: "© 2025 Highlight Tax Services. All Rights Reserved."

## Visual Style
- **Clean and minimal**: Ample whitespace, uncluttered layouts
- **Professional**: Corporate aesthetic appropriate for financial services
- **Trustworthy**: Use of structured grids, clear hierarchy
- **Animations**: Smooth, subtle (fade-ins, gentle hover states) - no distracting motion

## Images
**Hero Section**: Large background image showing professional tax preparation setting (desk, documents, calculator, professional workspace) - should convey expertise and organization

## Accessibility
- High contrast text (WCAG AA minimum)
- Clear focus states for keyboard navigation
- Form labels and error messages in clear language
- Bilingual support throughout interface

## Responsive Breakpoints
- Mobile: Stack all multi-column layouts
- Tablet (md): 2-column grids
- Desktop (lg+): Full multi-column layouts (3-4 columns where specified)