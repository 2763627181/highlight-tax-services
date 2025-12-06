# Arquitectura del Código - Highlight Tax Services

Documentación técnica de la arquitectura del sistema, flujo de datos, y patrones de diseño implementados.

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Base de Datos](#base-de-datos)
7. [Autenticación](#autenticación)
8. [WebSocket](#websocket)
9. [Internacionalización](#internacionalización)
10. [Flujos de Datos](#flujos-de-datos)
11. [Patrones de Diseño](#patrones-de-diseño)

---

## Visión General

Highlight Tax Services es una aplicación full-stack de servicios tributarios construida con:

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilos** | Tailwind CSS + Shadcn UI |
| **Routing** | Wouter |
| **Estado** | TanStack Query |
| **Backend** | Express.js + Node.js |
| **ORM** | Drizzle ORM |
| **Base de Datos** | PostgreSQL (Neon) |
| **Tiempo Real** | WebSocket (ws) |
| **Autenticación** | JWT + OAuth 2.0 (Replit Auth) |
| **Email** | Resend API |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐   │
│  │   Browser     │  │  React SPA    │  │  TanStack Query Cache     │   │
│  │               │──│               │──│                           │   │
│  │  - Pages      │  │  - Components │  │  - Queries                │   │
│  │  - Routing    │  │  - Hooks      │  │  - Mutations              │   │
│  └───────────────┘  └───────────────┘  └───────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP / WebSocket
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              SERVIDOR                                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐   │
│  │   Express     │  │   Middleware  │  │   WebSocket Server        │   │
│  │               │──│               │──│                           │   │
│  │  - Routes     │  │  - Auth JWT   │  │  - Conexiones             │   │
│  │  - API REST   │  │  - Rate Limit │  │  - Notificaciones         │   │
│  └───────────────┘  └───────────────┘  └───────────────────────────┘   │
│         │                   │                      │                    │
│         └───────────────────┼──────────────────────┘                    │
│                             ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Storage Layer                                  │  │
│  │   (server/storage.ts - Interfaz unificada de acceso a datos)      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BASE DE DATOS                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │   PostgreSQL (Neon) + Drizzle ORM                                 │  │
│  │                                                                    │  │
│  │   Tablas: users, auth_identities, sessions, tax_cases,           │  │
│  │           documents, appointments, messages,                      │  │
│  │           contact_submissions, activity_logs                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
proyecto/
├── client/                      # Frontend React
│   └── src/
│       ├── components/          # Componentes reutilizables
│       │   ├── ui/              # Componentes Shadcn UI
│       │   ├── header.tsx       # Navegación principal
│       │   ├── hero-section.tsx # Sección hero landing
│       │   ├── services-section.tsx
│       │   ├── about-section.tsx
│       │   ├── contact-section.tsx
│       │   ├── footer.tsx
│       │   ├── whatsapp-button.tsx
│       │   ├── theme-toggle.tsx
│       │   └── language-selector.tsx
│       ├── pages/               # Páginas/rutas
│       │   ├── home.tsx         # Landing page
│       │   ├── portal.tsx       # Login/Registro
│       │   ├── dashboard.tsx    # Dashboard cliente
│       │   ├── admin.tsx        # Panel administración
│       │   ├── privacy-policy.tsx
│       │   ├── terms.tsx
│       │   └── policies.tsx
│       ├── hooks/               # Custom hooks
│       │   ├── use-toast.ts
│       │   └── use-websocket.ts
│       ├── lib/                 # Utilidades y contextos
│       │   ├── auth-context.tsx # Contexto de autenticación
│       │   ├── theme-provider.tsx # Proveedor de tema
│       │   ├── i18n.tsx         # Sistema de internacionalización
│       │   ├── queryClient.ts   # Configuración TanStack Query
│       │   └── utils.ts         # Utilidades generales
│       ├── App.tsx              # Componente raíz y routing
│       └── main.tsx             # Punto de entrada
│
├── server/                      # Backend Express
│   ├── index.ts                 # Configuración del servidor
│   ├── routes.ts                # Definición de rutas API
│   ├── storage.ts               # Capa de acceso a datos
│   ├── db.ts                    # Conexión a base de datos
│   ├── vite.ts                  # Integración Vite dev server
│   ├── replitAuth.ts            # Configuración OAuth
│   ├── websocket.ts             # Servidor WebSocket
│   └── email.ts                 # Servicio de email (Resend)
│
├── shared/                      # Código compartido
│   └── schema.ts                # Esquema DB y tipos TypeScript
│
├── uploads/                     # Almacenamiento de archivos
│
├── API_DOCUMENTATION.md         # Documentación de API
├── CODE_ARCHITECTURE.md         # Este documento
├── SECURITY.md                  # Guía de seguridad
├── design_guidelines.md         # Guías de diseño UI
└── replit.md                    # Documentación general
```

---

## Frontend

### Routing (Wouter)

Rutas definidas en `client/src/App.tsx`:

```typescript
<Switch>
  <Route path="/" component={Home} />
  <Route path="/portal" component={Portal} />
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/admin" component={Admin} />
  <Route path="/privacy-policy" component={PrivacyPolicy} />
  <Route path="/terms" component={Terms} />
  <Route path="/policies" component={Policies} />
  <Route component={NotFound} />
</Switch>
```

### Estado Global

#### Autenticación (auth-context.tsx)

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}
```

**Uso:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

#### Tema (theme-provider.tsx)

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

**Persistencia:** localStorage (`highlight-tax-theme`)

#### Internacionalización (i18n.tsx)

```typescript
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
```

**Idiomas soportados:** en, es, fr, pt, zh, ht
**Persistencia:** localStorage (`highlight-tax-language`)

### Data Fetching (TanStack Query)

**Configuración en `queryClient.ts`:**
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

// Fetcher por defecto
queryClient.setQueryDefaults({
  queryFn: async ({ queryKey }) => {
    const response = await fetch(queryKey[0] as string, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Network response error');
    return response.json();
  },
});
```

**Ejemplo de uso:**
```typescript
// Query
const { data: cases, isLoading } = useQuery({
  queryKey: ['/api/cases'],
});

// Mutation
const uploadMutation = useMutation({
  mutationFn: (formData: FormData) => 
    apiRequest('/api/documents/upload', { 
      method: 'POST', 
      body: formData 
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
  },
});
```

### Componentes UI (Shadcn)

Componentes base en `client/src/components/ui/`:

| Componente | Uso |
|------------|-----|
| Button | Botones con variantes |
| Card | Contenedores de contenido |
| Dialog | Modales y diálogos |
| Form | Formularios con validación |
| Input | Campos de entrada |
| Select | Selectores dropdown |
| Table | Tablas de datos |
| Tabs | Navegación por pestañas |
| Toast | Notificaciones |

---

## Backend

### Arquitectura de Capas

```
Routes (routes.ts)
       │
       ▼
Middleware (Auth, Rate Limit, Validation)
       │
       ▼
Storage (storage.ts)
       │
       ▼
Database (Drizzle ORM)
```

### Middleware Stack

1. **Helmet**: Headers de seguridad
2. **CORS**: Control de origen cruzado
3. **HPP**: Prevención de contaminación de parámetros
4. **Cookie Parser**: Parsing de cookies
5. **JSON Parser**: Parsing de body JSON
6. **Rate Limiters**: Por endpoint

### Storage Layer (storage.ts)

Interfaz unificada para operaciones CRUD:

```typescript
interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Tax Cases
  getCases(clientId: number): Promise<TaxCase[]>;
  getAllCases(): Promise<TaxCase[]>;
  getCase(id: number): Promise<TaxCase | undefined>;
  createCase(data: InsertTaxCase): Promise<TaxCase>;
  updateCase(id: number, data: Partial<TaxCase>): Promise<TaxCase>;
  
  // Documents
  getDocuments(clientId: number): Promise<Document[]>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(data: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  
  // Appointments
  getAppointments(clientId: number): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  checkAppointmentConflict(date: Date): Promise<boolean>;
  
  // Messages
  getMessages(userId: number): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  markMessageRead(id: number): Promise<void>;
  
  // Contact & Activity
  createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createActivityLog(data: InsertActivityLog): Promise<void>;
}
```

### Rate Limiting

| Endpoint | Límite | Ventana | Propósito |
|----------|--------|---------|-----------|
| /api/auth/* | 5 | 15 min | Prevenir fuerza bruta |
| /api/documents/upload | 10 | 15 min | Prevenir abuso storage |
| /api/contact | 3 | 1 hora | Prevenir spam |
| /api/messages | 30 | 15 min | Prevenir spam |

---

## Base de Datos

### Diagrama ER

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   users     │     │   auth_identities│     │   sessions  │
├─────────────┤     ├─────────────────┤     ├─────────────┤
│ id (PK)     │◄────│ user_id (FK)    │     │ sid (PK)    │
│ email       │     │ provider        │     │ sess        │
│ password    │     │ provider_user_id│     │ expire      │
│ role        │     │ email           │     └─────────────┘
│ name        │     │ first_name      │
│ phone       │     │ last_name       │
│ address     │     │ avatar_url      │
│ ...         │     └─────────────────┘
└─────────────┘
       │
       ├────────────────┬────────────────┬────────────────┐
       │                │                │                │
       ▼                ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  tax_cases  │  │  documents  │  │appointments │  │  messages   │
├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤
│ id (PK)     │  │ id (PK)     │  │ id (PK)     │  │ id (PK)     │
│ client_id   │◄─│ case_id     │  │ client_id   │  │ case_id     │
│ filing_year │  │ client_id   │  │ date        │  │ sender_id   │
│ status      │  │ file_name   │  │ status      │  │ recipient_id│
│ ...         │  │ category    │  │ notes       │  │ message     │
└─────────────┘  │ ...         │  └─────────────┘  │ is_read     │
                 └─────────────┘                   └─────────────┘

┌───────────────────┐  ┌─────────────────┐
│contact_submissions│  │  activity_logs  │
├───────────────────┤  ├─────────────────┤
│ id (PK)           │  │ id (PK)         │
│ name              │  │ user_id (FK)    │
│ email             │  │ action          │
│ phone             │  │ details         │
│ message           │  │ created_at      │
│ service           │  └─────────────────┘
└───────────────────┘
```

### Migraciones

El proyecto usa `drizzle-kit` para migraciones:

```bash
# Generar migración
npm run db:generate

# Aplicar migraciones
npm run db:push

# Forzar sincronización (desarrollo)
npm run db:push --force
```

---

## Autenticación

### Flujo JWT (Email/Password)

```
┌──────────┐     POST /api/auth/login      ┌──────────┐
│  Cliente │ ───────────────────────────── │ Servidor │
│          │  {email, password}            │          │
│          │                               │          │
│          │     Set-Cookie: token=JWT     │          │
│          │ ◄─────────────────────────── │          │
│          │                               │          │
│          │     GET /api/protected        │          │
│          │ ───────────────────────────── │          │
│          │  Cookie: token=JWT            │          │
│          │                               │          │
│          │     Verificar JWT             │          │
│          │ ◄─────────────────────────── │          │
└──────────┘                               └──────────┘
```

### Flujo OAuth (Replit Auth)

```
┌──────────┐     GET /api/login           ┌──────────────┐
│  Cliente │ ──────────────────────────── │   Servidor   │
│          │                              │              │
│          │     Redirect to Provider     │              │
│          │ ◄─────────────────────────── │              │
│          │                              │              │
│          │     ┌─────────────────┐      │              │
│          │ ──► │ OAuth Provider  │      │              │
│          │     │ (Google/GitHub) │      │              │
│          │ ◄── └─────────────────┘      │              │
│          │                              │              │
│          │     GET /api/callback        │              │
│          │ ──────────────────────────── │              │
│          │  code=...                    │              │
│          │                              │              │
│          │     Exchange code for token  │              │
│          │     Link to local user       │              │
│          │     Set session              │              │
│          │                              │              │
│          │     Redirect to /dashboard   │              │
│          │ ◄─────────────────────────── │              │
└──────────┘                              └──────────────┘
```

---

## WebSocket

### Arquitectura

```typescript
// server/websocket.ts
class WebSocketService {
  private wss: WebSocketServer;
  private connections: Map<number, WebSocket[]>;
  
  initialize(server: HttpServer): void;
  broadcast(userId: number, message: WsMessage): void;
  notifyNewMessage(recipientId: number, message: Message): void;
  notifyCaseUpdate(clientId: number, caseData: TaxCase): void;
}
```

### Protocolo de Mensajes

**Cliente → Servidor:**
```json
{
  "type": "ping"
}
```

**Servidor → Cliente:**
```json
{
  "type": "new_message",
  "data": {
    "id": 1,
    "senderId": 5,
    "message": "Nuevo mensaje",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

```json
{
  "type": "case_update",
  "data": {
    "caseId": 1,
    "status": "approved",
    "notes": "Caso aprobado por IRS"
  }
}
```

### Hook del Cliente

```typescript
// client/src/hooks/use-websocket.ts
function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  
  useEffect(() => {
    // Obtener token WebSocket
    // Conectar a ws://host/ws?token=...
    // Manejar reconexión automática
    // Heartbeat cada 30s
  }, []);
  
  return { isConnected, lastMessage };
}
```

---

## Internacionalización

### Estructura de Traducciones

```typescript
// client/src/lib/i18n.tsx
const translations = {
  en: {
    nav: {
      home: "Home",
      services: "Services",
      about: "About Us",
      contact: "Contact",
      portal: "Client Portal",
    },
    hero: {
      title: "Maximize your refund with tax experts",
      subtitle: "Professional tax services...",
    },
    // ... más secciones
  },
  es: {
    nav: {
      home: "Inicio",
      services: "Servicios",
      about: "Nosotros",
      contact: "Contacto",
      portal: "Portal de Clientes",
    },
    // ... traducciones
  },
  // fr, pt, zh, ht...
};
```

### Uso en Componentes

```typescript
function MyComponent() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <LanguageSelector />
    </div>
  );
}
```

---

## Flujos de Datos

### Registro de Usuario

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  Formulario│  │   API      │  │  Storage   │  │  Database  │
│  Register  │  │  /register │  │  Layer     │  │            │
└─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │               │               │               │
      │ Submit form   │               │               │
      │──────────────►│               │               │
      │               │ Validate      │               │
      │               │ Hash password │               │
      │               │──────────────►│               │
      │               │               │ INSERT user   │
      │               │               │──────────────►│
      │               │               │               │
      │               │               │◄──────────────│
      │               │ Create JWT    │               │
      │               │ Send welcome  │               │
      │               │ email         │               │
      │◄──────────────│               │               │
      │ Set cookie    │               │               │
      │ Redirect      │               │               │
```

### Subida de Documento

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  Upload    │  │   Multer   │  │   Route    │  │  Storage   │
│  Component │  │  Middleware│  │  Handler   │  │            │
└─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │               │               │               │
      │ FormData      │               │               │
      │──────────────►│               │               │
      │               │ Validate MIME │               │
      │               │ Validate size │               │
      │               │ Sanitize name │               │
      │               │ Save to disk  │               │
      │               │──────────────►│               │
      │               │               │ Validate auth │
      │               │               │ Create record │
      │               │               │──────────────►│
      │               │               │               │
      │               │◄──────────────│◄──────────────│
      │◄──────────────│               │               │
      │ Success       │               │               │
      │ Invalidate    │               │               │
      │ cache         │               │               │
```

---

## Patrones de Diseño

### Repository Pattern (Storage Layer)

La capa de almacenamiento abstrae las operaciones de base de datos, permitiendo:
- Cambiar de ORM sin modificar la lógica de negocio
- Facilitar testing con mocks
- Centralizar validaciones

### Context Pattern (React)

Contextos utilizados:
- `AuthContext`: Estado de autenticación global
- `ThemeContext`: Tema claro/oscuro
- `I18nContext`: Idioma y traducciones

### Observer Pattern (WebSocket)

El servicio WebSocket implementa un patrón observer:
- Los clientes se suscriben a notificaciones
- El servidor notifica cambios (nuevos mensajes, actualizaciones de casos)

### Middleware Pattern (Express)

Cadena de middleware para:
- Autenticación
- Autorización
- Rate limiting
- Validación
- Manejo de errores

---

## Seguridad

Ver [SECURITY.md](./SECURITY.md) para documentación detallada de seguridad.

### Resumen

- **Autenticación**: JWT + OAuth 2.0
- **Contraseñas**: bcrypt (12 rondas)
- **Sesiones**: Cookies httpOnly, secure, sameSite=strict
- **Rate Limiting**: Por endpoint
- **Validación**: Zod schemas
- **Archivos**: Validación MIME, extensión, tamaño
- **Headers**: Helmet (CSP, HSTS, etc.)

---

## Testing

### Estructura de Tests

```
tests/
├── unit/              # Tests unitarios
│   ├── storage.test.ts
│   └── validation.test.ts
├── integration/       # Tests de integración
│   ├── auth.test.ts
│   └── api.test.ts
└── e2e/               # Tests end-to-end
    └── flows.test.ts
```

### Ejecutar Tests

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

---

## Deployment

### Variables de Entorno Requeridas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| DATABASE_URL | URL de PostgreSQL | Sí |
| SESSION_SECRET | Secreto para JWT (mín 32 chars) | Sí |
| RESEND_API_KEY | API key de Resend | No (emails deshabilitados) |
| REPLIT_DOMAINS | Dominios permitidos para OAuth | Auto (Replit) |

### Build

```bash
# Build de producción
npm run build

# Iniciar en producción
npm start
```

---

*Documentación de arquitectura v1.0.0*
*Última actualización: Diciembre 2024*
