# 🐾 PetNova

PetNova is a modern web application dedicated to managing pet-related information and services. Built with the latest tech stack for high performance, scalability, and an exceptional user experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏛️ Architecture

PetNova follows a **Feature-Centric Clean Architecture**. This ensures that the codebase remains organized as it scales, separating business logic from UI and infrastructure.

For a detailed breakdown of the project structure and design principles, please refer to:
👉 [**ARCHITECTURE.md**](./ARCHITECTURE.md)

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm / yarn / pnpm

### Installation

1. Clone the repository.
2. Navigate to the `web` directory:
   ```bash
   cd web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Setup environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your Supabase and Google API credentials.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

## 🤝 Contributing

We welcome contributions! Please read our [**CONTRIBUTING.md**](./CONTRIBUTING.md) to understand our development workflow and coding standards.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
