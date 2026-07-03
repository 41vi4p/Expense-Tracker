# ExpenseTracker

<p>
  <img alt="Version" src="https://img.shields.io/badge/version-2.7.9-06b6d4?style=for-the-badge&labelColor=0a0a0a" />
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-06b6d4?style=for-the-badge&labelColor=0a0a0a" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white&labelColor=0a0a0a" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0a0a0a" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase&logoColor=black&labelColor=0a0a0a" />
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0a0a0a" />
</p>

A futuristic expense tracking application built with Next.js, Firebase, and modern UI components. Features a beautiful sci-fi themed interface with dark/light mode support and Google authentication.

### 🔗 [**Live Demo → expense-tracker-41vi4p.vercel.app**](https://expense-tracker-41vi4p.vercel.app/)

## 🆕 Version 2.7.8 - Latest Update!

**What's New:**
- **✏️ Edit Transaction Feature** - Full implementation of transaction editing with modal interface
- **📱 Enhanced Mobile Experience** - Always-visible action buttons and improved touch interaction
- **🎨 UI/UX Improvements** - Fixed balance display, better transaction card alignment
- **🔄 Navigation Restructuring** - Activity moved to profile, About promoted to main navbar
- **💰 Currency Consistency** - Fixed rupee symbols in activity logs
- **🔧 Mobile Optimization** - Better responsiveness and touch-friendly design

[📖 **View Complete Version 2.7.8 Changelog**](./version_log.md) | [⭐ **Star us on GitHub**](https://github.com/41vi4p/Expense-Tracker) | [🌐 **Try the Live Demo**](https://expense-tracker-41vi4p.vercel.app/)

## 🚀 Features

- **🔐 Google OAuth Authentication** - Secure login with Firebase Auth
- **💰 Income & Expense Tracking** - Add, edit, and categorize transactions
- **📊 Real-time Analytics** - Visual insights with Chart.js and Recharts
- **📝 Financial Notes** - Keep track of goals, plans, and reminders
- **🎯 Activity Tracking** - Monitor your financial activities
- **🌙 Dark/Light Theme** - Modern sci-fi themed UI with theme switching
- **📱 Mobile-First Design** - Optimized for mobile devices
- **🔥 Firebase Integration** - Real-time database with Firestore
- **⚡ Fast Performance** - Built with Next.js 16 and TypeScript

## 🛠️ Tech Stack

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" />
  <img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel&logoColor=white" />
</p>

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication)
- **Authentication**: Firebase Auth with Google Provider
- **Charts**: Chart.js, React Chart.js 2, Recharts
- **UI Components**: Framer Motion, React Hot Toast
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file and add your Firebase and Google OAuth credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Set up Firebase:
   - Create a new Firebase project in the Firebase Console
   - Enable Authentication and Firestore Database
   - Add Google as an authentication provider in Firebase Auth
   - Add your domain (localhost:3000) to authorized domains
   - Copy your Firebase config to the environment variables

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 UI Features

- **Sci-Fi Theme**: Futuristic design with glowing effects and gradients
- **Mobile-First**: Responsive design optimized for smartphones
- **Smooth Animations**: Framer Motion powered transitions
- **Custom Fonts**: Orbitron for headings, Rajdhani for body text
- **Color Scheme**: Cyberpunk-inspired color palette with cyan accents

## 📱 Pages

- **Dashboard**: Overview of financial stats and recent transactions
- **Transactions**: Complete list with search and filtering
- **Analytics**: Visual breakdown of spending by category and trends
- **Notes**: Financial notes with categories and tags
- **Activity**: Track user actions and account activities
- **Profile**: User settings and account management

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Licensed under the [MIT License](./LICENSE).

---

<p align="center">
  <a href="https://expense-tracker-41vi4p.vercel.app/"><strong>🌐 Live Demo</strong></a> ·
  <a href="https://github.com/41vi4p/Expense-Tracker/issues"><strong>🐛 Report Bug</strong></a> ·
  <a href="https://github.com/41vi4p/Expense-Tracker/issues"><strong>✨ Request Feature</strong></a>
</p>

