# Portfolio

A modern, interactive portfolio website showcasing product engineering work with real-world applications.

![Portfolio](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Vite](https://img.shields.io/badge/Vite-6.0-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

## ✨ Features

- **🎨 Modern Design**: Clean, minimal aesthetic with smooth animations and transitions
- **🌙 Dark/Light Theme**: Seamless theme switching with persistent preferences
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **⚡ Lightning Fast**: Built with Vite for instant hot module replacement and optimized builds
- **🎯 Interactive Components**: 
  - Hero section with animated device previews
  - Interactive Builder Lab with system composition
  - Auto-scrolling tech skills marquee
  - GitHub contribution graph integration
- **📝 Case Studies**: Detailed project breakdowns with architecture layers and key decisions
- **🔍 Accessible**: WCAG compliant with proper ARIA labels and keyboard navigation
- **🎭 Motion Design**: Smooth, purposeful animations using Framer Motion

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library with latest features
- **TypeScript 5.8** - Type-safe development
- **Vite 6** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Animation library

### State & Data
- **React Context** - Theme and global state management
- **React Hooks** - Modern state management patterns

### Build Tools
- **ESBuild** - Fast bundling via Vite
- **TypeScript Compiler** - Type checking and compilation

### Deployment
- **Vite Build** - Optimized production builds
- **Static Hosting Ready** - Can be deployed to any static host

## 📸 Project Overview

This portfolio showcases two real products in active development:

### StayEase
- Native stay-booking app built with Expo/React Native
- Features real-time PostGIS map integration
- Offline-first architecture with MMKV + SQLite
- Stripe checkout integration
- Owner/admin portals for inventory management

### SplitFin
- Personal finance and group expense settlement app
- Offline-first ledger with real-time group presence
- Supabase WebSockets for live synchronization
- Maestro-verified E2E test flows
- Type-safe settlement logic

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally

# Quality
npm run lint         # Run TypeScript type checking
npm run clean        # Clean build artifacts

# Server (if backend is included)
npm run server       # Start backend server
```

## 🏗️ Project Structure

```
portfolio1/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── common/        # Shared components (Header, Footer, Modals)
│   │   ├── sections/      # Page sections (Hero, Projects, Contact)
│   │   ├── ui/            # UI components (Button, Input, etc.)
│   │   └── build-engine/  # Interactive Builder Lab
│   ├── context/           # React Context providers
│   ├── data/              # Static data and content
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🎨 Key Components

### Interactive Sections
- **Hero Section**: Animated device previews showcasing the two main products
- **Projects Section**: Editorial layout with detailed project cards
- **Builder Lab**: Interactive system composition experience
- **Tech Skills**: Auto-scrolling marquee of technology stack
- **GitHub Section**: Contribution graph integration
- **Contact Section**: Functional contact form and information

### Shared Components
- **Header**: Sticky navigation with theme toggle
- **Footer**: Clean footer with social links
- **CaseStudyModal**: Detailed project case studies with architecture breakdown
- **DeviceFrame**: Mobile device preview component

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add any environment variables here
# VITE_API_KEY=your_api_key
```

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy loading of heavy components
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Optimized images and fonts
- **Minimal Bundle Size**: Optimized dependencies
- **Fast HMR**: Instant hot module replacement during development

## 🔧 Customization

### Personal Information
Edit `src/data/portfolio-data.ts` to update:
- Personal details (name, email, location)
- Project information
- Social media links
- Experience details

### Styling
- Global styles: `src/index.css`
- Tailwind configuration: `tailwind.config.js`
- Component-specific styles inline or via Tailwind classes

### Content
- Project showcases: `src/data/portfolio-data.ts`
- Experience timeline: `src/components/sections/ExperienceSection.tsx`
- Tech stack: `src/components/sections/TechSkillsSection.tsx`

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the dist/ folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Deploy the dist/ folder to GitHub Pages
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Bhanuprasad L**
- Portfolio: [Link to live site]
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: [your-email@example.com]

## 🙏 Acknowledgments

- Built with modern React patterns and best practices
- Inspired by clean, minimal design principles
- Icons by [Lucide React](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

---

Made with ❤️ using React, TypeScript, and Vite