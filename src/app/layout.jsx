import "./globals.css";
import { MyContextProvider } from "../context/CartContext";
import { Outfit } from "next/font/google";
import Footer from "./Footer";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { Analytics } from "@vercel/analytics/react"

// ✅ Optimized font loading
const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ["400","500","600","700","800","900"],
  display: 'swap', // Improve font loading performance
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
    google: 'your-google-verification-code', // Replace with your actual verification code
  }
};


// ✅ Critical CSS for instant loading
const criticalCSS = `
  :root {
    --color-primary: #85242C;
    --font-outfit: ${outfit.style.fontFamily};
  }
  
  .bg { 
    background-color: var(--color-primary); 
  }
  
  .text { 
    color: var(--color-primary); 
  }
  
  body {
    font-family: var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
  
  /* Loading skeleton styles */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Prevent layout shift */
  .product-image-placeholder {
    background-color: #f8f9fa;
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="ltr" className={`${outfit.variable} h-full`}>
      <head>
        {/* ✅ Critical CSS inline for instant loading */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
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
        {/* ✅ Analytics with optimized loading */}
        <Analytics mode="production" />
        
        <MyContextProvider>
          <ClientLayoutWrapper className="flex-1">
            {children}
          </ClientLayoutWrapper>
          <Footer />
        </MyContextProvider>

        {/* ✅ Service Worker registration */}
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