"use client";
import { Facebook, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer 
      className="w-full text-white p-6 mt-10"
      style={{ 
        backgroundColor: '#771e31'
      }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        
        <div className="text-lg font-semibold">
          © {new Date().getFullYear()} Savio Fragrance
        </div>

        <div className="flex space-x-6">
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors duration-200 hover:scale-110 transform"
          >
            <Facebook size={22} />
          </a>

          <a
            href="https://www.instagram.com/wn_store_eg_2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors duration-200 hover:scale-110 transform"
          >
            <Instagram size={22} />
          </a>

          <a
            href="mailto:your@email.com"
            className="hover:text-green-400 transition-colors duration-200 hover:scale-110 transform"
          >
            <Mail size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}