# ExpenseTracker

A futuristic expense tracking application built with Next.js, Firebase, and modern UI components. Features a beautiful sci-fi themed interface with dark/light mode support and Google authentication.

## 🚀 Features

- **🔐 Google OAuth Authentication** - Secure login with Firebase Auth
- **💰 Income & Expense Tracking** - Add, edit, and categorize transactions
- **📊 Real-time Analytics** - Visual insights with Chart.js and Recharts
- **📝 Financial Notes** - Keep track of goals, plans, and reminders
- **🎯 Activity Tracking** - Monitor your financial activities
- **🌙 Dark/Light Theme** - Modern sci-fi themed UI with theme switching
- **📱 Mobile-First Design** - Optimized for mobile devices
- **🔥 Firebase Integration** - Real-time database with Firestore
- **⚡ Fast Performance** - Built with Next.js 15 and TypeScript

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication)
- **Authentication**: Firebase Auth with Google Provider
- **Charts**: Chart.js, React Chart.js 2, Recharts
- **UI Components**: Framer Motion, React Hot Toast
- **Icons**: Lucide React
- **Fonts**: Orbitron, Rajdhani (Google Fonts)

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

---

