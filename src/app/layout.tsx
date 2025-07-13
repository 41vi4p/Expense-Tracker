import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ExpenseTracker Pro - Sci-Fi Finance Manager",
  description: "A futuristic expense tracking app with real-time analytics and intelligent insights",
  keywords: ["expense tracker", "finance", "budget", "money management"],
  authors: [{ name: "David Porathur" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#00d4ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-background via-surface-dark to-background">
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--success)',
                      secondary: 'var(--background)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'var(--error)',
                      secondary: 'var(--background)',
                    },
                  },
                }}
              />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
