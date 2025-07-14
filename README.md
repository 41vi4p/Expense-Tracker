# ExpenseTracker Pro - Sci-Fi Finance Manager

A futuristic expense tracking application built with Next.js, Firebase, and modern UI components. Features a beautiful sci-fi themed interface with dark/light mode support and Google authentication.

## 🚀 Features

- **🔐 Google OAuth Authentication** - Secure login with Google accounts
- **💰 Income & Expense Tracking** - Add, edit, and categorize transactions
- **📊 Real-time Analytics** - Visual insights into spending patterns
- **🌙 Dark/Light Theme** - Modern sci-fi themed UI with theme switching
- **📱 Mobile-First Design** - Optimized for mobile devices
- **🔥 Firebase Integration** - Real-time database with Firestore
- **⚡ Fast Performance** - Built with Next.js 15 and TypeScript

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Authentication**: NextAuth.js with Google Provider
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
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore Database
   - Add Google as an authentication provider
   - Copy your Firebase config to the environment variables

5. Set up Google OAuth:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
   - Copy client ID and secret to environment variables

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 UI Features

- **Sci-Fi Theme**: Futuristic design with glowing effects and gradients
- **Mobile-First**: Responsive design optimized for smartphones
- **Smooth Animations**: Framer Motion powered transitions
- **Custom Fonts**: Orbitron for headings, Rajdhani for body text
- **Color Scheme**: Cyberpunk-inspired color palette with cyan accents

## 📱 Pages

- **Dashboard**: Overview of financial stats and recent transactions
- **Transactions**: Complete list with search and filtering
- **Analytics**: Visual breakdown of spending by category
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

## 📝 License

This project is created by David Porathur.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by David Porathur
