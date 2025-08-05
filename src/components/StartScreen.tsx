import { useState, useEffect } from 'react';
import drJackHero from '../assets/dr-jack-hero.png';

interface StartScreenProps {
  onStartGame: () => void;
}

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
  // Force landscape mode
  useEffect(() => {
    const lockOrientation = () => {
      if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {
          // Fallback: just set CSS for landscape
          document.body.style.transform = 'rotate(90deg)';
          document.body.style.transformOrigin = 'center center';
        });
      }
    };
    
    lockOrientation();
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center landscape-mode">
      {/* Blue sky background with pixel clouds */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #87CEEB 100%)'
        }}
      >
        {/* Pixel-style clouds */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/80 rounded-none"
            style={{
              left: `${10 + (i * 15) % 80}%`,
              top: `${20 + (i % 3) * 20}%`,
              width: `${60 + (i % 3) * 20}px`,
              height: `${30 + (i % 2) * 15}px`,
              clipPath: 'polygon(0 50%, 25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%)',
              animation: `float ${3 + (i % 2)}s ease-in-out infinite ${i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      {/* Static Dr Jack Hero Image */}
      <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <img 
          src={drJackHero} 
          alt="Dr Jack"
          className="w-48 h-48 object-contain animate-bounce"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
          }}
        />
      </div>
      
      {/* Main UI overlay */}
      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        {/* Game title */}
        <div className="mb-8">
          <h1 
            className="text-8xl lg:text-9xl xl:text-[12rem] font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-none"
            style={{
              textShadow: '0 0 60px rgba(59, 130, 246, 0.8), 0 0 120px rgba(59, 130, 246, 0.4)',
              animation: 'titleGlow 3s ease-in-out infinite, titleBreathe 4s ease-in-out infinite',
              fontSize: 'clamp(3rem, 15vw, 12rem)',
            }}
          >
            Dr Jack in Space
          </h1>
        </div>
        
        {/* Start button */}
        <div className="space-y-4">
          <button
            onClick={onStartGame}
            className="group relative px-8 py-4 bg-card/20 backdrop-blur-sm border-2 border-primary/50 rounded-lg text-xl font-semibold text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:border-primary"
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
              animation: 'buttonPulse 2s ease-in-out infinite',
            }}
          >
            <span className="relative z-10">Press to Start</span>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </button>
          
          {/* Instruction text */}
          <p className="text-sm text-muted-foreground/80 animate-pulse">
            Collect glowing orbs • Reach the goal • Score points
          </p>
        </div>
        
        {/* Controls hint */}
        <div className="mt-8 text-xs text-muted-foreground/60">
          <p>Use WASD or Arrow Keys to fly</p>
          <p className="mt-1 md:hidden">Touch controls available on mobile</p>
        </div>
      </div>
      
    </div>
  );
};