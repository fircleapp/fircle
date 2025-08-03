# Fircle - Family Circle App

A modern family management application built with Next.js, tRPC, Prisma, and PostgreSQL.

## 🚀 Features

- **Next.js 15** with App Router and TypeScript
- **tRPC** for type-safe API calls
- **Prisma** for database ORM with PostgreSQL
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- Full CRUD operations for family members

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma
- **Database**: PostgreSQL
- **Dev Tools**: ESLint, TypeScript

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd fircle
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database for the project
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update the `DATABASE_URL` in `.env` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/fircle_db?schema=public"
   ```

### 3. Database Migration

Generate Prisma client and push the schema to your database:

```bash
npm run db:generate
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/trpc/          # tRPC API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── providers/         # Context providers
│   ├── add-family-member-form.tsx
│   └── family-member-list.tsx
├── lib/                   # Utility libraries
│   ├── api.ts            # tRPC React client
│   ├── db.ts             # Prisma client
│   └── trpc.ts           # tRPC configuration
└── server/               # Server-side code
    └── api/              # tRPC routers
        ├── routers/      # Individual route handlers
        ├── root.ts       # Main router
        └── trpc.ts       # tRPC setup
```

## 🎯 API Endpoints

The application provides the following tRPC procedures:

### Family Members
- `familyMember.getAll` - Get all family members
- `familyMember.getById` - Get family member by ID
- `familyMember.create` - Create new family member
- `familyMember.update` - Update family member
- `familyMember.delete` - Delete family member

## 📊 Database Schema

```prisma
model FamilyMember {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("family_members")
}
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## 🌐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fircle_db?schema=public"

# Next.js
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment
1. Build the application: `npm run build`
2. Start the server: `npm run start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- tRPC team for type-safe APIs
- Prisma team for the excellent ORM
- Tailwind CSS for utility-first styling