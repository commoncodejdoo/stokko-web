# Stokko Web

Desktop back-office klijent za **Stokko** multi-tenant inventory SaaS. Pruža istu funkcionalnost kao mobilna aplikacija (`../stokko-mobile`), ali optimiziran za desktop ergonomiju — sidebar nav, dense tablice, multi-column layouti, dark/light mode kao prvi razred.

Dijeli backend (`../stokko-backend`) i podatke s mobilnom aplikacijom i adminom (`../stokko-admin`).

## Tech stack

- **React 18** + **Vite 5** + **TypeScript 5** (strict)
- **React Router v7** (SPA, code-split per route)
- **Zustand 5** (persist middleware → localStorage)
- **TanStack Query 5** (server state + cache invalidation)
- **Axios 1.7** (request/response interceptors, refresh-on-401)
- **Tailwind 3** (`darkMode: 'class'` + CSS vars)
- **Radix UI** (Dialog, Toast, DropdownMenu, Switch, Tabs)
- **lucide-react** (ikone)
- **cmdk** (⌘K command palette)
- **react-hook-form** + **zod** (forme)
- **posthog-js** (analytics, registriran s `app: 'stokko-web'` super-property)

## Folder struktura (Clean Architecture, package-by-feature)

```
src/
  data/                  # infra (HTTP + DTO + mapper + repository impl)
  domain/                # rich models, services, repository interfaces, errors
  view/                  # presentation (komponente, hookovi, ekrani)
    common/
      store/             # Zustand: auth, theme
      theme/             # ThemeProvider, useTheme
      components/        # primitivi: Button, Card, Pill, Table, Stat, ...
      utils/             # cn, format, sparkline stub
    auth/                # Login, ForcedPasswordChange, hooks
    dashboard/
    warehouses/
    articles/
    suppliers/
    categories/
    procurements/        # list, detail, 3-step wizard
    corrections/
    users/
    profile/             # Postavke (Profil / Radni prostor / Kategorije / Izgled)
```

Dependency direction: **`view → domain ← data`**. Vidi root `../CLAUDE.md` za detalje pravila.

## Razvoj lokalno

### Preduvjeti
- Node 18+ (preporuka **20.9** — prefix `export PATH="$HOME/.nvm/versions/node/v20.9.0/bin:$PATH"` ako shell pada na v16)
- `pnpm`
- Pokrenut backend na `localhost:3000` ili dostupan na `VITE_API_URL`

### Setup
```bash
cd stokko-web
pnpm install
cp .env.example .env   # uredi VITE_API_URL po potrebi
pnpm dev               # otvara http://localhost:5173
```

`.env` primjeri:
```bash
# Local backend
VITE_API_URL=http://localhost:3000/api/v1

# Produkcijski backend (testiranje protiv Render-a)
VITE_API_URL=https://stokko-backend.onrender.com/api/v1
```

### Skripte
```bash
pnpm dev       # Vite dev server (HMR)
pnpm build     # tsc -b && vite build → dist/
pnpm preview   # serviraj produkcijski build lokalno
```

### Test korisnici (Test Phase2 org)
- `p2@test.hr` / `PhaseTwo123` (OWNER) — preferiran za smoke test
- `ana@test.hr` / `NewAnaPass2026!` (ADMIN)

## Build & deploy

### Render.com Static Site
`render.yaml` u root-u definira deployment:

```yaml
services:
  - type: web
    name: stokko-web
    env: static
    buildCommand: pnpm install && pnpm build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
      - key: VITE_POSTHOG_KEY
      - key: VITE_POSTHOG_HOST
      - key: VITE_SENTRY_DSN
```

**Bitno:** `routes` rewrite je obvezan — bez njega Render vraća 404 za `/skladista/:id` na hard refresh.

### Env vars na Render-u (Dashboard → Environment)
| Key | Vrijednost |
|---|---|
| `VITE_API_URL` | `https://stokko-backend.onrender.com/api/v1` |
| `VITE_POSTHOG_KEY` | PostHog projektni key (zajednički s mobile-om) |
| `VITE_POSTHOG_HOST` | `https://eu.i.posthog.com` |
| `VITE_SENTRY_DSN` | (opcionalno, kad uključite Sentry) |

### Backend CORS
Nakon prvog deploya stokko-web aplikacije, dodaj njen URL u `CORS_ORIGIN` env var u **stokko-backend** Render service-u (comma-separated lista). Bez ovoga prod login neće raditi zbog CORS-a.

```
CORS_ORIGIN=https://stokko-web.onrender.com,https://stokko-admin.onrender.com
```

## Ključne arhitekturne odluke

### Auth flow
1. Login na `/login` → `useLogin` mutation.
2. Ako server vrati `requirePasswordChange: true`, app navigira na `/forced-password-change`.
3. Inače: `useFinalizeLoginSession` zove `updateTokens(...)` **PRIJE** `authService.me()`, pa nakon toga `setSession(...)`. Reverse order = 401 jer request interceptor čita token iz Zustand store-a sinkronizirano. Vidi [`src/view/auth/auth.hook.ts`](src/view/auth/auth.hook.ts).
4. Sesija persistira u `localStorage` pod ključem `stokko-web-auth`.
5. 401 mid-session → automatski refresh-on-401 preko response interceptora u [`src/data/common/http-client.ts`](src/data/common/http-client.ts). Ako refresh padne, `clearSession()` + redirect na `/login`.

### Theme
ThemeProvider toggla `dark` / `light` klasu na `<html>`, persistira u `localStorage` (`stokko-web-theme`). Tokeni su CSS vars u [`src/index.css`](src/index.css), Tailwind ih konzumira kao `bg-bg`, `bg-card`, `text-muted` itd.

### Code splitting
Sve top-of-stack ekrane u router-u koriste `React.lazy()` + `Suspense` — initial bundle ~474 KB (gzip 151 KB), ostatak (35 chunkova) lazy učitavaju se po ruti.

### Sparklines
Trenutno se na Dashboard-u i Warehouse karticama prikazuje deterministički random walk preko [`src/view/common/utils/sparkline-stub.ts`](src/view/common/utils/sparkline-stub.ts). TODO: zamijeniti pravim time-series podacima kad backend dobije `WarehouseDailySnapshot` tablu + cron snapshot job (Phase W9 polish).

### PostHog
Inicijalizacija u [`src/view/common/analytics.ts`](src/view/common/analytics.ts). Lazy-load posthog-js samo ako je `VITE_POSTHOG_KEY` definiran. Registrira super-property `app: 'stokko-web'` kako bi se događaji jasno razlikovali od `app: 'stokko-mobile'` u istom projektu. Filtri u dashboardu: `app = stokko-web` ili built-in `$lib = posthog-js`.

### Sentry (placeholder)
[`src/view/common/observability.ts`](src/view/common/observability.ts) je trenutno no-op. Aktivacija: dodaj `@sentry/react` u dependencies, ukloni placeholder, koristi DSN iz `VITE_SENTRY_DSN`.

## Krmo (gotchas)

1. **Forced password flow ordering** — vidi auth flow gore. `updateTokens` PRIJE `me()`.
2. **SPA rewrite na Render-u** — bez `routes` u `render.yaml`, hard refresh na bilo koju rutu osim `/` daje 404.
3. **Decimal serialization** — backend već vraća stringove (`TransformDecimalInterceptor`). Frontend tretira decimale kao stringove, pretvara u broj samo za prikaz (`fmtMoney`, `fmtNumber`) ili usporedbu.
4. **PickerDialog `+ Dodaj novi`** — gated na `canEditCatalog(role)` (OWNER ili ADMIN). EMPLOYEE vidi listu ali ne CTA.

## ⌘K Command Palette

Otvara se s **⌘K** (macOS) ili **Ctrl+K** (Win/Linux), ili klikom na search trigger u sidebaru. Pretražuje:
- Brze akcije (Nova nabava, Korekcija)
- Sve glavne rute
- Artikle (top 8 po popularnosti)
- Skladišta (sva)
- Dobavljače (top 8)
- Nedavne nabave (zadnjih 5)

## Phases done

| Phase | Sadržaj |
|---|---|
| **W1** | Foundation + auth (login, forced password change, splash, http-client, auth-store, theme) |
| **W2** | Core CRUD: dashboard, warehouses, articles, suppliers, settings |
| **W3** | Operations: procurements (list + detail + 3-step wizard), corrections, users (invite + reset password + deactivate) |
| **W4** | Observability: PostHog (`app: 'stokko-web'`), Sentry placeholder, render.yaml |
| **Polish** | Toast sustav, ArticleDetail history tabela, route-level code-splitting, ⌘K palette, sparkline stub, PickerDialog pattern + mini-forme |

## Phases pending (čekaju mobile/backend)

| Phase | Sadržaj |
|---|---|
| **W5a** | Backend Procurement.supplierId nullable migracija (Phase 7c mobile parallel) |
| **W5b** | Premještaj robe (Phase 7d backend StockTransfer endpoint) |
| **W5c** | Obračun smjene (Phase 8a backend Shift/Sale/SaleItem) |
| **W5d** | Analitika prodaje (Phase 8b backend `/sales/report`) |
