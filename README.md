# VidSphere Dashboard 🎥

**VidSphere** is a modern, high-performance platform designed to help YouTube creators manage, analyze, and upload their video content seamlessly. It also acts as the backend and dashboard for the `vidsphere-sdk`, allowing developers to generate API keys to programmatically interact with their YouTube channels.

## ✨ Features

- **YouTube Integration**: Connect your YouTube channel via OAuth2.
- **Advanced Dashboard**: Track total views, subscriber growth, and engagement using interactive charts.
- **Video Management**: View recent uploads, draft status, and storage usage.
- **Upload API & SDK Support**: Generate and manage API keys to use with the `vidsphere-sdk` for programmatic video uploads.
- **Highly Optimized**: Built with Next.js 16 (React Compiler enabled) and Edge caching for lightning-fast load times.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: TypeScript 5.7
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & [lucide-react](https://lucide.dev/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database Driver**: PostgreSQL (`pg`)
- **APIs**: YouTube Data API v3 (`googleapis`)
- **Data Visualization**: Recharts

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed.

### 1. Clone & Install
```bash
git clone https://github.com/your-username/vidsphere.git
cd you-tube-creator-dashboard
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials.
You will need:
- PostgreSQL database URL
- Better Auth secret
- Google OAuth credentials (Client ID, Secret, Redirect URI)
- YouTube API credentials

### 3. Database Migration
Run Drizzle to push the schema to your Postgres database:
```bash
pnpm drizzle-kit push
```

### 4. Run Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 📦 Related Packages

VidSphere is accompanied by two developer SDKs for seamless integration into other applications:
- **`vidsphere-react`**: React components (like custom YouTube players).
- **`vidsphere-sdk`**: Node.js SDK for programmatic video uploads.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
