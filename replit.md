# TreeCount Application - replit.md

## Overview

TreeCount is a full-stack web application for mapping and managing tree data in a community-driven network. The application allows users to view trees on an interactive map, add new tree entries, browse tree data, and view statistics. It's built with a modern React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds
- **Maps**: Leaflet for interactive mapping functionality

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ES Modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware
- **Logging**: Custom request/response logging middleware
- **Development**: Hot reload with Vite integration

### Database Architecture
- **Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: @neondatabase/serverless for serverless-optimized connections

## Key Components

### Data Models
- **Users**: Basic user management with username/password
- **Trees**: Comprehensive tree data including species, condition, location (lat/lng), physical attributes (diameter, height), notes, and contributor information

### Frontend Pages
- **Map View** (`/`): Interactive map showing all trees with filtering capabilities
- **Add Tree** (`/add`): Form for adding new tree entries with location detection
- **Tree Data** (`/data`): Tabular view of tree database with search and filtering
- **Statistics** (`/stats`): Dashboard showing tree network analytics
- **Navigation**: Responsive navigation with mobile hamburger menu

### UI Components
- **TreeCard**: Reusable tree display component with condition indicators
- **TreeMap**: Leaflet map wrapper with marker clustering and interaction
- **Navigation**: Responsive header with mobile sheet navigation
- **Form Components**: Comprehensive form system using react-hook-form with Zod validation

### Backend Services
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Route Handlers**: RESTful endpoints for tree CRUD operations and search
- **Validation**: Zod schema validation for all API inputs

## Data Flow

### Tree Management Flow
1. User submits tree data via form with geolocation
2. Frontend validates data using Zod schemas
3. API validates and stores tree data
4. TanStack Query invalidates cache and refetches data
5. UI updates with new tree information

### Map Interaction Flow
1. Map loads with all tree data from API
2. Users can filter by species, condition, or search terms
3. Frontend sends filtered requests to backend
4. Map markers update with filtered results
5. Clicking markers shows tree details

### Search and Filter Flow
1. User inputs search criteria or selects filters
2. Frontend debounces input and triggers API calls
3. Backend performs text search or condition filtering
4. Results update in real-time across map and data views

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **State Management**: TanStack Query for server state
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for runtime type checking
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, Class Variance Authority, clsx
- **Maps**: Leaflet for interactive mapping
- **Database**: Drizzle ORM, Neon Database serverless client
- **Date Handling**: date-fns for date utilities

### Development Tools
- **Build System**: Vite with React plugin
- **TypeScript**: Full type safety across frontend and backend
- **Database Tooling**: Drizzle Kit for schema management
- **Replit Integration**: Cartographer plugin and runtime error overlay

## Deployment Strategy

### Development Environment
- **Database**: Requires DATABASE_URL environment variable for PostgreSQL connection
- **Hot Reload**: Vite dev server with Express API integration
- **Development Command**: `npm run dev` starts both frontend and backend

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Build Command**: `npm run build` creates production artifacts
- **Start Command**: `npm start` runs production server

### Database Management
- **Schema**: Shared schema definitions in `shared/schema.ts`
- **Migrations**: Generated in `./migrations` directory
- **Push Command**: `npm run db:push` applies schema changes

### Configuration
- **TypeScript**: Shared config for client, server, and shared code
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)
- **Environment**: NODE_ENV-based configuration switching
- **Replit**: Special handling for Replit development environment