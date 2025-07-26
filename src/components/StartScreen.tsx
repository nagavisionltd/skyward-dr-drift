import { PsychedelicBackground } from './PsychedelicBackground';
import { DoctorCharacter } from './DoctorCharacter';
import { useState, useEffect } from 'react';

interface StartScreenProps {
  onStartGame: () => void;
}

export const StartScreen = ({ onStartGame }: StartScreenProps) => {
  const [demoPosition, setDemoPosition] = useState({ x: -100, y: 300 });
  
  // Demo animation - Dr. Jack flying across screen
  useEffect(() => {
    const animateDemo = () => {
      setDemoPosition(prev => {
        const newX = prev.x + 8;
        // Reset when character goes off screen
        if (newX > window.innerWidth + 100) {
          return { x: -100, y: 200 + Math.random() * 200 };
        }
        return { x: newX, y: prev.y };
      });
    };
    
    const interval = setInterval(animateDemo, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Psychedelic background */}
      <PsychedelicBackground />
      
      {/* Demo character flying across */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <DoctorCharacter 
          x={demoPosition.x} 
          y={demoPosition.y}
          velocity={8}
          forwardSpeed={8}
          rotation={5}
          stalled={false}
          keys={{ up: false, down: false, left: false, right: true }}
        />
        
        {/* Speed blur trail effect */}
        <div 
          className="absolute w-32 h-2 opacity-60 animate-pulse"
          style={{
            left: `${demoPosition.x - 50}px`,
            top: `${demoPosition.y + 25}px`,
            background: 'linear-gradient(90deg, transparent 0%, #00E676 50%, transparent 100%)',
            filter: 'blur(2px)',
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
            SKYWARD
          </h1>
          <h2 
            className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-primary/80 animate-pulse"
          >
            Dr. Drift
          </h2>
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