'use client';

// Force dynamic rendering to avoid Firebase initialization during build
export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { 
  Info, 
  Github, 
  Heart, 
  Code, 
  Zap, 
  Users, 
  Star,
  Coffee,
  ExternalLink,
  Linkedin,
  Database,
  Palette,
  Sparkles,
  BarChart,
  Image,
  ArrowLeft
} from 'lucide-react';
import { logUserAction, LOG_ACTIONS } from '@/lib/logging';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const developers = [
  {
    name: 'David Porathur',
    role: 'Lead Developer & Project Creator',
    description: 'Full-stack developer passionate about creating intuitive financial tools',
    github: 'https://github.com/41vi4p',
    linkedin: 'https://www.linkedin.com/in/david-porathur-33780228a',
    contributions: ['Core Architecture', 'UI/UX Design', 'Firebase Integration', 'Authentication']
  },
  {
    name: 'Vanessa Rodrigues',
    role: 'Frontend Developer',
    description: 'Specialized in React and modern web technologies',
    github: 'https://github.com/Vanessa-Rodrigues-156',
    linkedin: 'https://linkedin.com/in/vanessa-rodrigues-156vfr',
    contributions: ['Font Integration', 'UI Enhancements', 'Component Development', 'Responsive Design']
  },
  {
    name: 'Community Contributors',
    role: 'Open Source Contributors',
    description: 'Amazing developers who helped improve the project',
    github: 'https://github.com/41vi4p/Expense-Tracker/contributors',
    linkedin: null,
    contributions: ['Bug Fixes', 'Feature Suggestions', 'Documentation', 'Testing']
  }
];

const techStack = [
  { name: 'Next.js 15', description: 'React framework', icon: Code, color: 'text-gray-300', url: 'https://nextjs.org/docs' },
  { name: 'TypeScript', description: 'Type-safe JavaScript', icon: Code, color: 'text-blue-400', url: 'https://www.typescriptlang.org/docs/' },
  { name: 'Firebase', description: 'Auth & Database', icon: Database, color: 'text-orange-400', url: 'https://firebase.google.com/docs' },
  { name: 'Tailwind CSS', description: 'CSS framework', icon: Palette, color: 'text-cyan-400', url: 'https://tailwindcss.com/docs' },
  { name: 'Framer Motion', description: 'Animation library', icon: Sparkles, color: 'text-purple-400', url: 'https://www.framer.com/motion/' },
  { name: 'Chart.js', description: 'Data visualization', icon: BarChart, color: 'text-green-400', url: 'https://www.chartjs.org/docs/latest/' },
  { name: 'Lucide React', description: 'Icon library', icon: Image, color: 'text-pink-400', url: 'https://lucide.dev/guide/' }
];

export default function AboutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Log page view (works for both authenticated and anonymous users)
    const userId = user?.uid || 'anonymous';
    logUserAction(userId, 'navigation', LOG_ACTIONS.NAVIGATION.PAGE_VIEW, {
      page: 'about',
      timestamp: new Date().toISOString()
    });
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-dark to-background">
      {user && <Header />}
      
      <main className={`container mx-auto px-4 py-6 ${user ? 'pb-24 lg:pb-6' : 'pb-6'}`}>
        {/* Back Button for Anonymous Users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center space-x-2 text-foreground/60 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center glow mr-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gradient">
                  ExpenseTracker
                </h1>
                <p className="text-foreground/70 font-body">
                  A futuristic expense tracking application
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-foreground/60">
              <span>Version 2.0.0</span>
              <span>•</span>
              <span>Built with</span>
              <Heart className="w-4 h-4 text-error" />
              <span>by amazing developers</span>
            </div>
          </div>
        </motion.div>

        {/* Project Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-primary" />
              About the Project
            </h2>
            <p className="text-foreground/80 mb-4">
              ExpenseTracker is a modern, intuitive expense tracking application designed to help users 
              manage their finances with ease. Built with cutting-edge technologies, it offers real-time 
              analytics, secure data storage, and a beautiful user interface.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">Personal Finance</span>
              <span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm">Real-time Analytics</span>
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">Mobile Responsive</span>
              <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm">Open Source</span>
            </div>
          </div>
        </motion.div>

        {/* Development Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Development Team
            </h2>
            
            <div className="space-y-6">
              {developers.map((dev, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-surface/30 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{dev.name}</h3>
                      <p className="text-primary text-sm font-medium">{dev.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={dev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/60 hover:text-primary transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      {dev.linkedin && (
                        <a
                          href={dev.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/60 hover:text-blue-400 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-foreground/70 text-sm mb-3">{dev.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {dev.contributions.map((contribution, i) => (
                      <span
                        key={i}
                        className="bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                      >
                        {contribution}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center">
              <Code className="w-5 h-5 mr-2 text-primary" />
              Technology Stack
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {techStack.map((tech, index) => (
                <motion.a
                  key={index}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-surface/30 rounded-lg p-3 text-center hover:bg-surface/50 transition-colors cursor-pointer group"
                >
                  <div className="flex flex-col items-center">
                    <tech.icon className={`w-8 h-8 mb-2 ${tech.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-display font-medium text-sm mb-1 group-hover:text-primary transition-colors">{tech.name}</h3>
                    <p className="text-foreground/60 text-xs group-hover:text-foreground/80 transition-colors">{tech.description}</p>
                    <ExternalLink className="w-3 h-3 mt-1 text-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Links & Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2 text-primary" />
              Links & Resources
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://github.com/41vi4p/Expense-Tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface/30 rounded-lg p-4 hover:bg-surface/50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Github className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
                  <div>
                    <h3 className="font-display font-medium">GitHub Repository</h3>
                    <p className="text-foreground/70 text-sm">View source code and contribute</p>
                  </div>
                </div>
              </a>
              
              <div className="bg-surface/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h3 className="font-display font-medium">Support the Project</h3>
                      <p className="text-foreground/70 text-sm">Star us on GitHub if you like it!</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <a 
                      className="github-button" 
                      href="https://github.com/41vi4p/Expense-Tracker" 
                      data-color-scheme="no-preference: dark; light: dark; dark: dark;" 
                      data-icon="octicon-star" 
                      data-size="large" 
                      aria-label="Star 41vi4p/Expense-Tracker on GitHub"
                    >
                      Star
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Coffee className="w-5 h-5 text-secondary" />
              <p className="text-foreground/70">Made with passion and lots of coffee</p>
            </div>
            <p className="text-foreground/60 text-sm">
              © {new Date().getFullYear()} ExpenseTracker. Built with modern web technologies.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Bottom Navigation for Mobile */}
      {user && <BottomNavigation />}
      
      {/* GitHub Buttons Script */}
      <Script
        src="https://buttons.github.io/buttons.js"
        strategy="afterInteractive"
      />
    </div>
  );
}