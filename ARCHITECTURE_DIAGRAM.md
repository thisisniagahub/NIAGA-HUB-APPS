# NIAGAHUB Platform Architecture

> **Platform-First Architecture:** Single codebase, multi-tenant, tool-based modularity.

## Platform Overview

```mermaid
flowchart TB
    subgraph NIAGA["🏢 NIAGAHUB Platform"]
        direction TB
        
        subgraph SingleApp["📱 niagahub-app<br/>(Single Codebase)"]
            direction LR
            CustomerMode["👤 Customer<br/>/m/:slug/c/*"]
            KioskMode["🎮 Kiosk<br/>/m/:slug/k/*"]
            StaffMode["👷 Staff<br/>/m/:slug/s/*"]
            AdminMode["⚙️ Admin<br/>/m/:slug/a/*"]
        end
        
        subgraph Tenants["🏪 Active Tenants"]
            AC["🌽 Tenant #1<br/>abang-colek"]
            Demo["🎭 Tenant #2<br/>demo"]
        end
        
        subgraph Tools["🧰 Tool Registry"]
            AI["ai-assistant<br/>Pro"]
            WOCS["whatsapp-ordering<br/>Pro"]
            Tutorial["onboarding-tutorial<br/>Free"]
            i18n["i18n-engine<br/>Free"]
        end
        
        subgraph Backend["⚙️ Backend Services"]
            WocsServer["🌐 wocs-server<br/>Node.js + Express"]
        end
    end
    
    SingleApp --> Tenants
    Tenants --> Tools
    WOCS --> WocsServer
```

---

## Tenant Resolution Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Router
    participant MP as MerchantProvider
    participant MS as MerchantStore
    participant T as Tools
    
    U->>R: GET /m/abang-colek/c/splash
    R->>MP: Extract slug "abang-colek"
    MP->>MS: getMerchantBySlug(slug)
    MS-->>MP: Merchant Data + Theme
    MP->>T: Load enabled tools for tenant
    T-->>MP: Tool configs
    MP-->>U: Render Customer Splash (themed)
```

---

## Single-App Mode Structure

```mermaid
flowchart TB
    subgraph App["📱 niagahub-app (abang-colek-brand-os)"]
        direction TB
        
        subgraph Core["🔧 Core (Platform Kernel)"]
            Router["app/router.tsx"]
            MerchantProv["providers/MerchantProvider"]
            LangProv["providers/LanguageProvider"]
            Store["store/"]
        end
        
        subgraph Modes["🎭 Operational Modes"]
            CMode["modes/customer/*"]
            KMode["modes/kiosk/*"]
            SMode["modes/staff/*"]
            AMode["modes/admin/*"]
        end
        
        subgraph Features["✨ Features → Tools"]
            Agent["features/agent/*<br/>→ tool.ai-assistant"]
            Tutorial["features/tutorial/*<br/>→ tool.onboarding-tutorial"]
        end
        
        subgraph Legacy["📦 Legacy"]
            V1["legacy/v1-brandos"]
        end
    end
    
    Router --> Core
    Core --> Modes
    Core --> Features
```

---

## Supporting Projects

| Project | Type | Purpose | Status |
|---------|------|---------|--------|
| **abang-colek-brand-os** | Primary App | NIAGAHUB platform frontend | ✅ Active |
| **wocs-server** | Backend | WhatsApp Order Connector | ✅ Active |
| **abang-colek-wocs-extension** | Extension | Chrome WhatsApp integration | ✅ Active |
| **abang-colek-kiosk** | Legacy | Standalone kiosk (deprecated) | ⚠️ Migrate to mode |
| **abang-colek-mobile** | Legacy | Expo mobile app (deprecated) | ⚠️ Web-first strategy |

---

## Tool-Based Modularity

```mermaid
flowchart LR
    subgraph Kernel["Platform Kernel (Immutable)"]
        Routing["routing"]
        TenantRes["tenant-resolution"]
        ThemeEng["theme-engine"]
    end
    
    subgraph FreeTools["Free Tier Tools"]
        Tutorial2["onboarding-tutorial"]
        i18n2["i18n-engine"]
    end
    
    subgraph ProTools["Pro Tier Tools"]
        AI2["ai-assistant"]
        WOCS2["whatsapp-ordering"]
    end
    
    subgraph EntTools["Enterprise Tools"]
        Social["social-connect"]
        Analytics["advanced-analytics"]
    end
    
    Kernel --> FreeTools
    FreeTools --> ProTools
    ProTools --> EntTools
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | React + Vite + TypeScript | Single-App Architecture |
| **Styling** | Tailwind CSS | Tenant-themed via CSS variables |
| **State** | Zustand | Namespaced per tenant |
| **Routing** | React Router v6 | `/m/:slug/:mode/*` pattern |
| **Backend** | Node.js + Express | WOCS server only |
| **Database** | Supabase | Multi-tenant with RLS (planned) |
| **AI** | Google Gemini API | Pro tier tool |

---

## File Structure (abang-colek-brand-os)

```
src/
├── app/          # Router, layouts
├── domain/       # Core data types
├── features/     # Tool implementations
├── modes/        # Customer, Kiosk, Staff, Admin
├── pages/        # Route components
├── providers/    # Context providers
├── store/        # Zustand stores
├── ui/           # Shared components
├── lib/          # Utilities
└── data/         # Seed data, configs

docs/
├── ROUTES.md         # Route map
├── TENANCY.md        # Multi-tenant guide
├── PLATFORM_CONSTITUTION.md  # Platform principles
└── TOOL_REGISTRY.md  # Tool catalog
```
