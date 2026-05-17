import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { GoogleOAuthProvider } from '@react-oauth/google';
import NotificationPoller from '@/components/NotificationPoller';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Digital Marketplace",
  description: "Buy and sell digital assets easily.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder-client-id.apps.googleusercontent.com"}>
          <NotificationPoller />
          <SmoothScroll>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-dropdown)',
                  color: 'var(--fg-primary)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  letterSpacing: '-0.01em',
                  boxShadow: 'var(--shadow-elevated)',
                },
              }}
            />
            <Navbar />
            <main className="flex-grow pt-0 relative">
              {children}
            </main>
            <Footer />
          </SmoothScroll>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
