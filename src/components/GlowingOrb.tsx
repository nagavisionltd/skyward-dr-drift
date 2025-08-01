import { useEffect, useState, memo, useCallback } from 'react';

interface GlowingOrbProps {
  x: number;
  y: number;
  color: string;
  points: number;
  collected: boolean;
  onCollect: () => void;
  cameraX: number;
}

export const GlowingOrb = memo(({ x, y, color, points, collected, onCollect, cameraX }: GlowingOrbProps) => {
  // Check for collision with player using a more efficient approach
  useEffect(() => {
    if (collected) return;
    
    let animationId: number;
    
    const checkCollision = () => {
      const player = document.querySelector('[data-player="true"]');
      if (player) {
        const rect = player.getBoundingClientRect();
        const playerX = rect.left + cameraX;
        const playerY = rect.top;
        
        // Check collision
        const distance = Math.sqrt(
          Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2)
        );
        
        if (distance < 40) {
          onCollect();
          return; // Stop checking once collected
        }
      }
      
      animationId = requestAnimationFrame(checkCollision);
    };
    
    animationId = requestAnimationFrame(checkCollision);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [x, y, collected, onCollect, cameraX]);

  if (collected) return null;

  // Only render if visible on screen
  const screenX = x - cameraX;
  if (screenX < -100 || screenX > window.innerWidth + 100) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer glow effect */}
      <div
        className="absolute w-16 h-16 rounded-full opacity-60 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Main orb */}
      <div
        className="relative w-8 h-8 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}ff 0%, ${color}aa 50%, ${color}66 100%)`,
          boxShadow: `0 0 20px ${color}88, 0 0 40px ${color}44`,
          animation: 'pulse 2s ease-in-out infinite, float 3s ease-in-out infinite',
        }}
      >
        {/* Inner sparkle */}
        <div
          className="absolute top-1 left-1 w-2 h-2 rounded-full opacity-80 animate-pulse"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
          }}
        />
      </div>
      
      {/* Point value indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white/80">
        +{points}
      </div>
    </div>
  );
});