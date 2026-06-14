# PetNova Architectural Guidelines

This project follows a **Feature-Centric Clean Architecture**. This approach combines the scalability of Clean Architecture with the modularity of Feature-based grouping, making it ideal for Next.js applications.

## High-Level Layers

### 1. Core Layer (`src/core`)
- **Responsibility**: Pure business logic and domain definitions.
- **Constraints**: No dependencies on external frameworks (React, Supabase, etc.).
- **Contents**: Entities (interfaces), constants, and pure utility functions.

### 2. Feature Layer (`src/features`)
- **Responsibility**: Encapsulate logic related to specific business capabilities.
- **Contents**: Modals, complex components, feature-specific hooks, and services.
- **Rules**: Features should be as independent as possible. Shared logic should be moved to the Application or Core layer.

### 3. Application Layer (`src/services`, `src/hooks`)
- **Responsibility**: Orchestrate logic that spans multiple features or provides global functionality.
- **Contents**: Global state management, global API services, and common React hooks.

### 4. Infrastructure Layer (`src/lib`)
- **Responsibility**: Abstract external tools and services.
- **Contents**: Supabase client initialization, third-party library adapters, and low-level utilities.

### 5. Presentation Layer (`src/app`, `src/components`)
- **Responsibility**: Routing and Visual Identity.
- **Contents**: 
  - `src/app`: Page components and routing logic (Next.js App Router).
  - `src/components/ui`: Generic, reusable UI components (Atomic design).

## Data Flow

1. User interacts with a **Component** (`src/features` or `src/app`).
2. Component calls a **Hook** or **Service** (`src/features` or `src/services`).
3. Service interacts with the **Infrastructure** (`src/lib`) and returns **Entities** (`src/core`).
4. UI updates based on the typed domain data.

## Why this structure?
- **Ease of testing**: Core logic is pure and easily testable.
- **Scalability**: New features can be added in their own directories without cluttering global folders.
- **Maintenance**: Clear separation between "What the app does" (Core) and "How it presents it" (UI).
