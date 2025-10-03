// app/layout.jsx
import "./globals.css";
import "./critical.css"; // 👈 استورد الـ CSS هنا
import { MyContextProvider } from "../context/CartContext";
import { Outfit } from "next/font/google";
import Footer from "./Footer";
import Nav from "./Nav";
import { Analytics } from "@vercel/analytics/react"
import SplashScreen from "./SplashScreen";

const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ["400","500","600","700","800","900"],
  display: 'swap',
  preload: true,
  variable: '--font-outfit',
});

export const metadata = {
  title: "Savio Fragrances - Luxury & Unique Perfumes",
  description: "Discover our exclusive collection of luxury perfumes for men and women. Authentic fragrances, competitive prices, and fast delivery in Egypt.",
  keywords: "perfumes, fragrances, women perfumes, men perfumes, master box, luxury perfumes, Egypt, Savio Fragrances",
  icons: { 
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title: "Savio Fragrances - Luxury & Unique Perfumes",
    description: "Luxury perfumes at competitive prices with authenticity guarantee.",
    type: "website",
    locale: "en_EG",
    siteName: "Savio Fragrances"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="ltr" className={`${outfit.variable} h-full`}>
      <head>
        {/* ✅ Preconnect to external domains */}
        <link rel="preconnect" href="https://lblljhoouydfvekihqka.supabase.co" />
        <link rel="dns-prefetch" href="https://lblljhoouydfvekihqka.supabase.co" />
        
        {/* ✅ Preload critical resources */}
        <link 
          rel="preload" 
          href="/women.webp" 
          as="image" 
          type="image/webp"
          fetchPriority="high"
        />
        
        {/* ✅ Viewport meta for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* ✅ Theme color for mobile browsers */}
        <meta name="theme-color" content="#85242C" />
        
        {/* ✅ Manifest for PWA capabilities */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      
      <body className={`${outfit.className} antialiased flex flex-col min-h-screen`}>
        <Analytics mode="production" />
        
        <MyContextProvider>
          <Nav/>
          <SplashScreen />
          {children}
          <Footer />
        </MyContextProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}