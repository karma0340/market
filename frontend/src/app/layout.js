import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Digital Marketplace",
  description: "Buy and sell digital assets easily.",
};

import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} font-sans`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50" suppressHydrationWarning>
        <SmoothScroll>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '16px 24px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#6366f1',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
