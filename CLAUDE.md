# CLAUDE.md — SmartPresence Web (Dashboard Admin)

## Vue d'ensemble

**SmartPresence** est un SaaS multi-tenant de gestion de présence des employés.
Ce projet contient :
- Le **dashboard admin** (Next.js App Router) pour les admins d'entreprise et le superadmin
- L'**API REST** (`/api/v1/`) consommée par l'app mobile

### Contexte produit

| Acteur | App | Responsabilités |
|---|---|---|
| `superadmin` | Ce dashboard | Créer les entreprises, créer les admins, vue globale |
| `admin` | Ce dashboard | Gérer les employés, voir les présences, configurer l'entreprise |
| `employee` | App mobile | Scanner le QR, pointer arrivée/départ |

---

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.4 |
| Langage | TypeScript | ^5 (strict) |
| Base de données | PostgreSQL (Supabase) | — |
| ORM | Drizzle ORM | ^0.45.2 |
| Drizzle Kit | drizzle-kit | ^0.31.10 |
| Auth | Supabase Auth (JWT) | @supabase/ssr ^0.10.2 |
| Validation | Zod | ^4.3.6 |
| Styles | Tailwind CSS | v4 (@tailwindcss/postcss) |
| Icons | Lucide React | ^1.8.0 |
| QR Code | qrcode.react | ^4.2.0 |
| DB Driver | postgres | ^3.4.9 |
| Class utils | clsx + tailwind-merge | ^2.1.1 + ^3.5.0 |
| Runtime | React | 19.2.4 |
| Déploiement | Vercel | — |

---

## Architecture des dossiers

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                     ← Connexion (use client)
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                       ← Sidebar + Topbar adaptés au rôle
│   │   │
│   │   ├── dashboard/                       ← Stats admin (présents, absents, taux)
│   │   │   ├── page.tsx
│   │   │   └── unauthorized/
│   │   │       └── page.tsx                 ← Page 403
│   │   │
│   │   ├── employees/                       ← CRUD employés (admin)
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── EmployeeTable.tsx
│   │   │       └── AddEmployeeModal.tsx
│   │   │
│   │   ├── attendance/                      ← Historique des pointages (admin)
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── AttendanceTable.tsx
│   │   │       └── AttendanceFilters.tsx    ← Filtres date + employé (query params)
│   │   │
│   │   ├── settings/                        ← Config entreprise + QR Code (admin)
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       └── SettingsForm.tsx         ← use client : form + QR + régénération
│   │   │
│   │   ├── companies/                       ← Liste entreprises (superadmin)
│   │   │   ├── layout.tsx                   ← Vérifie role=superadmin
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx                 ← Détail entreprise + admins
│   │   │   │   └── components/
│   │   │   │       └── AddAdminModal.tsx
│   │   │   └── components/
│   │   │       └── AddCompanyModal.tsx
│   │   │
│   │   └── superadmin/                      ← Section superadmin
│   │       ├── layout.tsx                   ← Vérifie role=superadmin
│   │       ├── overview/
│   │       │   └── page.tsx                 ← Stats globales (toutes entreprises)
│   │       ├── companies/
│   │       │   └── page.tsx                 ← Liste toutes entreprises
│   │       └── users/
│   │           └── page.tsx                 ← Liste tous utilisateurs
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── auth/
│   │       │   └── login/route.ts           ← POST /api/v1/auth/login
│   │       ├── user/
│   │       │   └── route.ts                 ← GET /api/v1/user
│   │       ├── employees/
│   │       │   └── route.ts                 ← GET, POST /api/v1/employees
│   │       ├── attendance/
│   │       │   ├── route.ts                 ← GET /api/v1/attendance (historique user)
│   │       │   ├── admin/
│   │       │   │   └── route.ts             ← GET /api/v1/attendance/admin (admin view, filtres)
│   │       │   └── check/
│   │       │       └── route.ts             ← POST /api/v1/attendance/check
│   │       ├── companies/
│   │       │   ├── route.ts                 ← POST /api/v1/companies (superadmin)
│   │       │   ├── [id]/
│   │       │   │   └── admins/
│   │       │   │       └── route.ts         ← POST /api/v1/companies/[id]/admins
│   │       │   └── settings/
│   │       │       ├── route.ts             ← GET, PATCH /api/v1/companies/settings
│   │       │       └── regenerate-token/
│   │       │           └── route.ts         ← POST /api/v1/companies/settings/regenerate-token
│   │       ├── dashboard/
│   │       │   └── stats/
│   │       │       └── route.ts             ← GET /api/v1/dashboard/stats
│   │       └── superadmin/
│   │           └── companies/
│   │               ├── route.ts             ← GET, POST /api/v1/superadmin/companies
│   │               └── [id]/
│   │                   ├── route.ts         ← GET /api/v1/superadmin/companies/[id]
│   │                   └── admins/
│   │                       └── route.ts     ← POST /api/v1/superadmin/companies/[id]/admins
│   │
│   ├── layout.tsx                           ← Root layout (Geist fonts)
│   └── page.tsx
│
├── modules/                                 ← Logique métier isolée par domaine
│   ├── auth/
│   │   ├── auth.service.ts                  ← login(), getAuthenticatedUser()
│   │   └── auth.validator.ts
│   ├── attendance/
│   │   ├── attendance.service.ts            ← CheckAttendanceService
│   │   ├── attendance.repository.ts
│   │   └── attendance.validator.ts
│   ├── employees/
│   │   ├── employees.service.ts
│   │   ├── employees.repository.ts
│   │   └── employees.validator.ts
│   ├── companies/
│   │   ├── companies.service.ts
│   │   ├── companies.repository.ts
│   │   └── companies.validator.ts
│   └── dashboard/
│       ├── dashboard.service.ts             ← DashboardService.getStats()
│       └── dashboard.repository.ts          ← DashboardRepository.getStatsByCompany()
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        ← createSupabaseBrowserClient()
│   │   └── server.ts                        ← createSupabaseServerClient()
│   ├── db/
│   │   ├── schema.ts                        ← Schéma Drizzle (source de vérité DB)
│   │   └── index.ts                         ← Instance Drizzle exportée
│   ├── api/
│   │   ├── response.ts                      ← ApiResponse.success / ApiResponse.error
│   │   ├── guards.ts                        ← requireAuth / requireRole / requireSameCompany
│   │   └── create-admin.ts                  ← createAdminForCompany() via SERVICE_ROLE_KEY
│   └── utils.ts                             ← cn() (clsx + tailwind-merge)
│
├── components/
│   └── dashboard/
│       ├── sidebar.tsx                      ← Sidebar adaptée au rôle (use client)
│       └── topbar.tsx                       ← Topbar + déconnexion (use client)
│
└── middleware.ts                            ← Protection routes (cookies + Bearer)

supabase/
└── rls.sql                                  ← Politiques Row Level Security

drizzle/
└── migrations/                              ← Migrations auto-générées par Drizzle Kit
    ├── 0000_unique_betty_brant.sql
    └── meta/

drizzle.config.ts
.env
package.json
```

---

## Schéma de base de données

```typescript
// src/lib/db/schema.ts — SOURCE DE VÉRITÉ, ne jamais modifier manuellement

import {
  pgTable, uuid, text, timestamp, doublePrecision, integer,
} from "drizzle-orm/pg-core";

// ─── COMPANIES ───────────────────────────────────────────────
export const companies = pgTable("companies", {
  id:            uuid("id").primaryKey().defaultRandom(),
  name:          text("name").notNull(),
  wifi_ssid:     text("wifi_ssid"),                          // null = Wi-Fi désactivé
  latitude:      doublePrecision("latitude").notNull(),
  longitude:     doublePrecision("longitude").notNull(),
  radius:        integer("radius").notNull().default(100),   // en mètres
  company_token: uuid("company_token").notNull().unique().defaultRandom(),
  created_at:    timestamp("created_at").defaultNow(),
});

// ─── USERS ───────────────────────────────────────────────────
export const users = pgTable("users", {
  id:         uuid("id").primaryKey(),                       // = auth.users.id Supabase
  name:       text("name").notNull(),
  email:      text("email").notNull().unique(),
  company_id: uuid("company_id").references(() => companies.id), // null pour superadmin
  role:       text("role", {
    enum: ["superadmin", "admin", "employee"],
  }).notNull().default("employee"),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── ATTENDANCES ─────────────────────────────────────────────
export const attendances = pgTable("attendances", {
  id:        uuid("id").primaryKey().defaultRandom(),
  user_id:   uuid("user_id").notNull().references(() => users.id),
  check_in:  timestamp("check_in").notNull(),
  check_out: timestamp("check_out"),                         // null = encore présent
  latitude:  doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  wifi_ssid: text("wifi_ssid"),
  created_at: timestamp("created_at").defaultNow(),
});

// Types inférés
export type Company    = typeof companies.$inferSelect;
export type User       = typeof users.$inferSelect;
export type Attendance = typeof attendances.$inferSelect;
```

---

## Conventions de code — OBLIGATOIRES

### 1. Séparation des responsabilités

Le flux est strict et non négociable :

```
Route handler → Validator → Service → Repository → DB
  (route.ts)    (.validator) (.service) (.repository)
```

**Route handler** (`route.ts`) :
- Reçoit `req: NextRequest`
- Appelle les guards (`requireAuth`, `requireRole`) en passant `req`
- Parse le body et valide via `.safeParse()` (jamais `.parse()` directement)
- Appelle le service
- Retourne `ApiResponse.success()` ou `ApiResponse.error()`
- Gère `GuardError` en renvoyant `err.status`
- ❌ Zéro logique métier
- ❌ Zéro accès direct à la DB

**Service** (`*.service.ts`) :
- Contient toute la logique métier
- Appelle le repository pour la DB
- Lance des erreurs explicites (`throw new Error("message clair")`)
- ❌ Pas d'accès direct à Drizzle/DB
- ❌ Pas d'accès direct à `request` ou `NextResponse`

**Repository** (`*.repository.ts`) :
- Seul endroit qui importe et utilise `db` (Drizzle)
- Méthodes simples et atomiques (findById, create, update, delete)
- ❌ Aucune logique métier

**Validator** (`*.validator.ts`) :
- Schémas Zod uniquement
- Exporte les schémas + types inférés + fonctions `validateCreate()` / `validateUpdate()`
- Dans les routes : utiliser `.safeParse()` et vérifier `result.success`

### 2. Format de réponse API

**Toujours** utiliser les helpers, jamais `NextResponse.json()` directement :

```typescript
import { ApiResponse } from "@/lib/api/response";

// Succès
return ApiResponse.success(data, "Pointage enregistré");         // 200
return ApiResponse.success(data, "Employé créé", 201);           // 201

// Erreur
return ApiResponse.error("Non autorisé", 401);
return ApiResponse.error("Position GPS invalide", 403);
return ApiResponse.error("Employé introuvable", 404);
return ApiResponse.error("Erreur serveur", 500);
```

Format JSON retourné :
```json
{ "success": true,  "message": "Pointage enregistré", "data": { ... } }
{ "success": false, "message": "Position GPS invalide", "data": null }
```

### 3. Guards d'authentification et de rôle

Les guards se trouvent dans `src/lib/api/guards.ts`. Ils prennent tous `req: NextRequest` en paramètre. Ils lèvent `GuardError` (401 ou 403), à attraper dans le `catch` du route handler.

```typescript
import { requireAuth, requireRole, requireSameCompany, GuardError } from "@/lib/api/guards";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    // ...
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
```

**Règles par route :**
| Route | Guard requis |
|---|---|
| `POST /api/v1/auth/login` | Aucun (publique) |
| `GET /api/v1/user` | `requireAuth(req)` |
| `GET/POST /api/v1/employees` | `requireRole(["admin", "superadmin"], req)` |
| `GET /api/v1/attendance` | `requireAuth(req)` |
| `GET /api/v1/attendance/admin` | `requireRole(["admin", "superadmin"], req)` |
| `POST /api/v1/attendance/check` | `requireRole(["admin", "employee", "superadmin"], req)` |
| `GET/PATCH /api/v1/companies/settings` | `requireRole(["admin"], req)` |
| `POST /api/v1/companies/settings/regenerate-token` | `requireRole(["admin"], req)` |
| `POST /api/v1/companies` | vérification manuelle `role === "superadmin"` |
| `POST /api/v1/companies/[id]/admins` | `requireRole(["superadmin"], req)` |
| `GET /api/v1/dashboard/stats` | `requireRole(["admin", "superadmin"], req)` |
| `GET/POST /api/v1/superadmin/companies` | `requireRole(["superadmin"], req)` |
| `GET /api/v1/superadmin/companies/[id]` | `requireRole(["superadmin"], req)` |
| `POST /api/v1/superadmin/companies/[id]/admins` | `requireRole(["superadmin"], req)` |

### 4. Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers | `kebab-case` | `attendance.service.ts` |
| Composants React | `PascalCase` | `AddEmployeeModal.tsx` |
| Fonctions/variables | `camelCase` | `checkAttendance()` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_RADIUS_METERS` |
| Tables DB | `snake_case` | `attendances`, `companies` |

### 5. TypeScript

- **Strict mode activé** dans `tsconfig.json`
- **Jamais de `any`** — utiliser `unknown` puis type guard si nécessaire
- Toujours typer les retours de fonctions async
- Utiliser les types inférés de Drizzle (`typeof companies.$inferSelect`)
- Alias d'import : `@/*` → `src/*`

---

## Routes API — référence complète

| Méthode | Route | Guard | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Aucun | Connexion email/password → tokens |
| `GET` | `/api/v1/user` | `requireAuth` | Profil utilisateur connecté |
| `GET` | `/api/v1/employees` | `requireRole [admin, superadmin]` | Liste employés de l'entreprise |
| `POST` | `/api/v1/employees` | `requireRole [admin, superadmin]` | Créer employé + compte Supabase Auth |
| `GET` | `/api/v1/attendance` | `requireAuth` | Historique pointages de l'utilisateur |
| `GET` | `/api/v1/attendance/admin` | `requireRole [admin, superadmin]` | Pointages filtrés par date et/ou employé |
| `POST` | `/api/v1/attendance/check` | `requireRole [admin, employee, superadmin]` | Check-in ou check-out |
| `POST` | `/api/v1/companies` | manuel superadmin | Créer une entreprise |
| `GET` | `/api/v1/companies/settings` | `requireRole [admin]` | Détails de l'entreprise de l'admin |
| `PATCH` | `/api/v1/companies/settings` | `requireRole [admin]` | Modifier l'entreprise |
| `POST` | `/api/v1/companies/settings/regenerate-token` | `requireRole [admin]` | Nouveau company_token (invalide l'ancien QR) |
| `POST` | `/api/v1/companies/[id]/admins` | `requireRole [superadmin]` | Créer admin pour une entreprise |
| `GET` | `/api/v1/dashboard/stats` | `requireRole [admin, superadmin]` | Stats du jour (présents, absents, taux) |
| `GET` | `/api/v1/superadmin/companies` | `requireRole [superadmin]` | Liste toutes les entreprises |
| `POST` | `/api/v1/superadmin/companies` | `requireRole [superadmin]` | Créer une entreprise (superadmin) |
| `GET` | `/api/v1/superadmin/companies/[id]` | `requireRole [superadmin]` | Détail entreprise + ses admins |
| `POST` | `/api/v1/superadmin/companies/[id]/admins` | `requireRole [superadmin]` | Créer admin pour entreprise |

**Paramètres de `GET /api/v1/attendance/admin` :**
- `?date=YYYY-MM-DD` (défaut : aujourd'hui)
- `?employeeId=uuid` (optionnel, filtre par employé)

---

## Logique métier principale — CheckAttendanceService

### Endpoint : `POST /api/v1/attendance/check`

**Payload reçu :**
```json
{
  "company_token": "uuid-de-la-company",
  "latitude": 0.4162,
  "longitude": 9.4673,
  "wifi_ssid": "Office-WiFi"
}
```

**Étapes du service dans l'ordre :**

1. Guard vérifie l'authentification (`requireRole`)
2. Valide le payload via `checkAttendanceSchema.safeParse()`
3. Récupère l'entreprise via `company_token` → erreur si introuvable
4. Vérifie que `user.company_id === company.id` → erreur si différent
5. Calcule la distance Haversine entre la position envoyée et `company.latitude/longitude`
6. Rejette si `distance > company.radius` → erreur avec distance réelle
7. Si `company.wifi_ssid !== null` ET `wifi_ssid` envoyé : compare → erreur si différent
8. Cherche un enregistrement actif (pas de `check_out`) pour ce `user_id`
   - **Aucun trouvé** → `INSERT` avec `check_in = new Date()`
   - **Trouvé** → `UPDATE` avec `check_out = new Date()`
9. Retourne `{ type: "check_in" | "check_out", attendance: {...} }`

**Formule Haversine (implémentée dans `attendance.service.ts`) :**
```typescript
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

---

## Validation Zod — Règles strictes

> **Note :** Le projet utilise Zod v4. Utiliser `.safeParse()` dans les routes (jamais `.parse()` directement sur des inputs externes).

### attendance.validator.ts
```typescript
const checkAttendanceSchema = z.object({
  company_token: z.string().uuid(),
  latitude:      z.number().min(-90).max(90),
  longitude:     z.number().min(-180).max(180),
  wifi_ssid:     z.string().max(100).optional(),
});
```

### employees.validator.ts
```typescript
const createEmployeeSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  role:     z.enum(["admin", "employee"]),
});
```

### companies.validator.ts
```typescript
const createCompanySchema = z.object({
  name:      z.string().min(2).max(100),
  latitude:  z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius:    z.number().min(50).max(5000).default(100),
  wifi_ssid: z.string().max(100).optional().nullable(),
});
```

**Pattern d'utilisation dans les routes :**
```typescript
const result = schema.safeParse(body);
if (!result.success) {
  return ApiResponse.error(result.error.issues[0].message, 422);
}
// utiliser result.data
```

---

## Middleware

Le middleware `src/middleware.ts` protège l'ensemble des routes :

- **Cookies** (dashboard browser) + **Bearer token** (clients mobiles) sont tous les deux acceptés
- Routes protégées : `/dashboard/*`, `/employees/*`, `/attendance/*`, `/settings/*`, `/superadmin/*`, `/companies/*`, `/api/v1/*` (sauf `/api/v1/auth/*`)
- Redirection vers `/login` pour les routes dashboard non authentifiées
- JSON `{ success: false, ... }` 401 pour les routes API non authentifiées
- Vérification du rôle `superadmin` directement dans le middleware pour `/api/v1/superadmin/*` (via `SUPABASE_SERVICE_ROLE_KEY`)
- Les layouts `/companies/layout.tsx` et `/superadmin/layout.tsx` vérifient le rôle côté serveur pour les pages UI

---

## Création d'un admin — `src/lib/api/create-admin.ts`

Utilitaire partagé utilisé par plusieurs routes pour créer un admin :

```typescript
import { createAdminForCompany, CreateAdminInput } from "@/lib/api/create-admin";

// Crée le compte Supabase Auth + l'entrée dans users avec role="admin"
const admin = await createAdminForCompany(companyId, { name, email, password });
```

Utilise `SUPABASE_SERVICE_ROLE_KEY` pour créer le compte via `supabase.auth.admin.createUser()` avec `email_confirm: true`.

---

## Sécurité — Row Level Security (RLS)

Le fichier `supabase/rls.sql` contient toutes les politiques RLS.
**RLS est activé sur les 3 tables** comme filet de sécurité en plus des guards applicatifs.

| Table | superadmin | admin | employee |
|---|---|---|---|
| `companies` | Lecture + écriture totale | Lecture de son entreprise uniquement | Aucun accès |
| `users` | Lecture + écriture totale | Lecture des users de son entreprise | Lecture de son propre profil |
| `attendances` | Lecture totale | Lecture des pointages de son entreprise | Lecture + création de ses propres pointages |

---

## Dashboard — Comportement par rôle

### Sidebar `admin` — navItems
- **Dashboard** → `/dashboard` (stats de son entreprise)
- **Employés** → `/employees` (CRUD)
- **Présences** → `/attendance` (historique pointages)
- **Paramètres** → `/settings` (config + QR Code)

### Sidebar `superadmin` — navItems
- **Vue globale** → `/superadmin/overview` (stats toutes entreprises)
- **Entreprises** → `/companies` (liste + création + détail)
- **Utilisateurs** → `/superadmin/users` (liste tous users)

### Redirection si mauvais rôle
→ `/dashboard/unauthorized`

---

## Page Paramètres — Fonctionnalités spéciales

### Bouton "Utiliser ma position actuelle"
- Utilise `navigator.geolocation.getCurrentPosition()`
- Remplit automatiquement les champs latitude/longitude

### QR Code
- Affiché avec `qrcode.react` (`QRCodeCanvas`)
- Contenu du QR : `company_token` (UUID)
- Bouton "Télécharger" : export PNG via ref canvas
- Bouton "Régénérer" : appelle `POST /api/v1/companies/settings/regenerate-token`
- ⚠️ Régénérer invalide immédiatement l'ancien QR

### Mini-carte
- Iframe OpenStreetMap avec pin sur les coordonnées

---

## Utilitaires partagés

### `src/lib/utils.ts`
```typescript
import { cn } from "@/lib/utils";
// cn() = clsx + tailwind-merge, pour fusionner des classes Tailwind conditionnelles
```

### `src/lib/api/response.ts`
```typescript
export class ApiResponse {
  static success<T>(data: T, message: string, status = 200): NextResponse
  static error(message: string, status = 400): NextResponse
}
```

---

## Variables d'environnement

Fichier `.env` à la racine :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx        # ⚠️ Jamais exposé côté client

# Database Drizzle
DATABASE_URL=postgresql://postgres.xxxx:[password]@aws-0-xx.pooler.supabase.com:6543/postgres
```

**Règle absolue :** `SUPABASE_SERVICE_ROLE_KEY` ne doit **jamais** apparaître dans du code côté client (`"use client"`, composants, hooks). Uniquement dans les route handlers, middleware et `create-admin.ts`.

---

## Commandes

```bash
# Développement
npm run dev

# Base de données
npm run db:generate    # Génère les fichiers de migration depuis schema.ts
npm run db:migrate     # Applique les migrations sur Supabase
npm run db:studio      # Interface visuelle Drizzle Studio

# Build
npm run build
npm run start

# Lint
npm run lint
```

---

## Multi-tenant — Règles d'isolation (non négociables)

1. Chaque requête API doit vérifier que `user.company_id` correspond à la ressource demandée
2. Un `admin` ne peut **jamais** accéder aux données d'une autre entreprise
3. Un `employee` ne peut **jamais** voir ou modifier les pointages d'un autre employé
4. Seul le `superadmin` peut créer des entreprises et assigner des admins
5. Le `superadmin` n'appartient à **aucune** entreprise (`company_id = null`)
6. La création d'un admin utilise obligatoirement `SUPABASE_SERVICE_ROLE_KEY` via `createAdminForCompany()`

---

## Gestion d'erreurs

**Pattern standard dans les routes :**
```typescript
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["admin"], req);

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return ApiResponse.error(result.error.issues[0].message, 422);
    }

    const data = await service.doSomething(result.data, user);
    return ApiResponse.success(data, "Opération réussie");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
```

**Dans les services :**
```typescript
throw new Error("Company not found");
throw new Error("You do not belong to this company");
throw new Error(`You are too far from the office (${Math.round(distance)}m, max ${company.radius}m)`);
throw new Error("Wi-Fi network does not match the office network");
```

---

## Ce qu'il ne faut JAMAIS faire

- ❌ Importer `db` directement dans un service ou une route
- ❌ Mettre de la logique métier dans un composant React
- ❌ Utiliser `any` en TypeScript
- ❌ Retourner `NextResponse.json()` directement (toujours passer par `ApiResponse`)
- ❌ Accéder à une ressource sans vérifier le `company_id` de l'utilisateur connecté
- ❌ Exposer `SUPABASE_SERVICE_ROLE_KEY` dans du code client
- ❌ Omettre `req: NextRequest` dans les appels aux guards (`requireAuth(req)`, `requireRole(roles, req)`)
- ❌ Utiliser `.parse()` sur des inputs externes — toujours `.safeParse()` dans les routes
- ❌ Exécuter des commandes qui modifient directement la base de données (`drizzle-kit migrate`, `drizzle-kit push`, `npx prisma db push`) — **générer le script SQL** à la place pour exécution manuelle sur Supabase
