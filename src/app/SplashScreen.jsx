// app/SplashScreen.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [logoFinished, setLogoFinished] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogoAnimationEnd = () => {
    // delay صغير قبل ما النصين يتحركوا
    setTimeout(() => {
      setLogoFinished(true);
    }, 100);
  };

  const handleDoorAnimationEnd = () => {
    // delay صغير قبل ما نخفي الـ component
    setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      overflow: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden'
    }}>
      {/* النص الشمال */}
      <div
        onTransitionEnd={handleDoorAnimationEnd}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          backgroundColor: 'white',
          transform: logoFinished ? 'translate3d(-100%, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: logoFinished ? 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
          willChange: logoFinished ? 'transform' : 'auto',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
      />

      {/* النص اليمين */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          backgroundColor: 'white',
          transform: logoFinished ? 'translate3d(100%, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: logoFinished ? 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
          willChange: logoFinished ? 'transform' : 'auto',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
      />

      {/* اللوجو */}
      {!logoFinished && (
        <div
          onAnimationEnd={handleLogoAnimationEnd}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spin 1s ease-in-out forwards',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        >
          <Image 
            src="/darklogo.webp" 
            alt="Savio Logo" 
            width={120} 
            height={120}
            priority
            style={{
              objectFit: 'contain'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg) scale(0.5) translate3d(0, 0, 0);
            opacity: 0;
          }
          to {
            transform: rotate(360deg) scale(1) translate3d(0, 0, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}