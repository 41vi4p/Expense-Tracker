'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CreditCard, BarChart3, FileText, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Transactions', icon: CreditCard, href: '/transactions' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Notes', icon: FileText, href: '/notes' },
  { label: 'About', icon: Info, href: '/about' },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      <div className="bg-black/20 backdrop-blur-glass border-t border-white/10 rounded-t-3xl shadow-2xl shadow-black/50">
        <div className="flex justify-center items-center py-3 px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl gap-2 sm:gap-4 md:gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isDashboard = item.href === '/dashboard';
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2 relative group flex-1 ${
                    isDashboard ? 'px-2 sm:px-3 md:px-4' : 'px-1 sm:px-2 md:px-3'
                  }`}
                >
                  <div className="relative">
                    {isDashboard ? (
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-primary glow'
                          : 'bg-surface/50 group-hover:bg-surface/70'
                      }`}>
                        <Icon
                          className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 transition-all duration-200 ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-gray-200'
                          }`}
                        />
                      </div>
                    ) : (
                      <Icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 transition-all duration-200 ${
                          isActive
                            ? 'text-primary glow'
                            : 'text-gray-400 group-hover:text-gray-200'
                        }`}
                      />
                    )}
                    {isActive && !isDashboard && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full glow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm mt-1 transition-all duration-200 ${
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-gray-500 group-hover:text-gray-300'
                    } ${isDashboard ? 'font-semibold' : ''}`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}