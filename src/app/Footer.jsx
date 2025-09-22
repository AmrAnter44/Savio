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
            href="https://www.instagram.com/savio_fragrances?igsh=cW1ncWY5Mnp4MHNu"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors duration-200 hover:scale-110 transform"
          >
            <Instagram size={22} />
          </a>

          <Mail
            href="mailto:eslammoatasem99@gmail.com"
            size={22}
            className="hover:text-green-400 transition-colors duration-200 hover:scale-110 transform"
          />
        </div>
      </div>
            <p className="text-center text-black">
        Direct by{" "}
        <a href="https://tamyaz.online/" className="text-white">
          Tamyaz
        </a>
      </p>
    </footer>
  );
}