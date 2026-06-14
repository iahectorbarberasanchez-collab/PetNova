# Contributing to PetNova

Thank you for considering contributing to PetNova! To maintain code quality and project consistency, please follow these guidelines.

## Development Workflow

1. **Branching Strategy**: 
   - Use descriptive branch names: `feature/name`, `fix/name`, `refactor/name`.
   - Never commit directly to `main`.
2. **Pull Requests**:
   - Create a PR for every change.
   - Ensure the code builds and linting passes before submitting.
   - Provide a clear summary of what the PR changes.

## Coding Standards

- **TypeScript**: Always use TypeScript. Avoid `any` unless strictly necessary.
- **Components**: Follow the Atomic Design or Feature-Based structure. Small, focused components are preferred.
- **Naming Conventions**:
  - Components: PascalCase (`PetCard.tsx`)
  - Hooks: camelCase starting with "use" (`usePetState.ts`)
  - Utilities/Services: camelCase (`formatDate.ts`)
- **Architecture**: Respect the boundaries defined in `ARCHITECTURE.md`. Do not bypass the Core layer for business logic.

## Commits

- We use conventional commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting/styling
  - `refactor:` for code restructuring

## Environment Setup

- Copy `.env.example` to `.env.local` and fill in the required keys.
- Run `npm install` and `npm run dev` to start the local development server.
