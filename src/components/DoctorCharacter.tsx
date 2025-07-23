import { useState, useEffect } from 'react';
import { PhysicsState } from '@/lib/physics';

interface DoctorCharacterProps {
  x: number;
  y: number;
  velocity: number;
  forwardSpeed: number;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  isBarrelRolling?: boolean;
  barrelRollProgress?: number;
  physics?: PhysicsState;
}

export const DoctorCharacter = ({ 
  x, 
  y, 
  velocity, 
  forwardSpeed, 
  keys, 
  isBarrelRolling = false, 
  barrelRollProgress = 0,
  physics 
}: DoctorCharacterProps) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  const [lastMovementState, setLastMovementState] = useState({ up: false, down: false, left: false, right: false });
  
  // Animation cycling - maintain last frame until direction changes
  useEffect(() => {
    const isMoving = keys.up || keys.down || keys.left || keys.right;
    const movementChanged = 
      keys.up !== lastMovementState.up ||
      keys.down !== lastMovementState.down ||
      keys.left !== lastMovementState.left ||
      keys.right !== lastMovementState.right;
    
    if (!isMoving) {
      setAnimationFrame(0); // Reset to first frame when not moving
      setLastMovementState({ up: false, down: false, left: false, right: false });
      return;
    }
    
    // If movement direction changed, restart animation
    if (movementChanged) {
      setAnimationFrame(0);
      setLastMovementState({ ...keys });
    }
    
    const interval = setInterval(() => {
      setAnimationFrame(prev => {
        const nextFrame = prev + 1;
        // If we reach the last frame (4), stay there
        return nextFrame >= 5 ? 4 : nextFrame;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [keys.up, keys.down, keys.left, keys.right]); // Removed lastMovementState from deps

  // Enhanced rotation with barrel roll support
  const getRotation = () => {
    let rotation = 0;
    
    // Barrel roll takes priority
    if (isBarrelRolling) {
      return (barrelRollProgress * 360) % 360;
    }
    
    // Normal flight dynamics
    if (velocity < -2) rotation = -15; // Flying up
    else if (velocity > 2) rotation = 15; // Flying down
    
    if (keys.left) rotation -= 8; // Increased banking
    if (keys.right) rotation += 8;
    
    // Enhanced wind effect based on physics
    if (physics && physics.airResistance > 0.5) {
      rotation += Math.sin(Date.now() * 0.015) * Math.min(physics.airResistance * 2, 5);
    }
    
    // Add stall effect if moving too slow
    if (forwardSpeed < 3) {
      rotation += Math.sin(Date.now() * 0.02) * 2; // Unstable at low speed
    }
    
    return rotation;
  };

  // Enhanced wind and physics effects
  const getWindEffects = () => {
    const effects: any = {};
    
    // High speed effects
    if (forwardSpeed >= 8) {
      const windSway = Math.sin(Date.now() * 0.008) * 3;
      const windScale = 1 + Math.sin(Date.now() * 0.012) * 0.08;
      effects.transform = `scaleX(${windScale}) translateX(${windSway}px)`;
      effects.transition = 'none';
    }
    
    // Physics-based effects
    if (physics) {
      // Energy trail effect
      if (physics.energy < 30) {
        effects.filter = (effects.filter || '') + ' brightness(0.8)';
      }
      
      // Thrust glow effect
      if (physics.thrust > 1.5) {
        effects.filter = (effects.filter || '') + ' drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';
      }
      
      // Drag visual feedback
      if (physics.drag > 0.3) {
        const vibration = Math.sin(Date.now() * 0.05) * 1;
        effects.transform = (effects.transform || '') + ` translateY(${vibration}px)`;
      }
    }
    
    return effects;
  };

  // Character sprites using the uploaded images (excluding cloud image)
  const getCharacterSprite = () => {
    const sprites = [
      '/lovable-uploads/6ccfd2c3-9961-48ae-bdc2-fad6619a6af3.png',
      '/lovable-uploads/77cce5c4-74e2-4f1b-91a5-a82152dc2b3d.png',
      '/lovable-uploads/c3a3637e-efb0-4a03-9498-43a510244199.png',
      '/lovable-uploads/db63a21f-5a7f-4592-962d-f1cd45943f0f.png',
      '/lovable-uploads/dd3a3a22-d446-4fc2-b490-ccc05800b1d8.png',
    ];
    return sprites[animationFrame];
  };

  return (
    <div 
      className={`absolute z-10 transition-transform duration-75 ${isBarrelRolling ? 'animate-spin' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `rotate(${getRotation()}deg) ${isBarrelRolling ? `rotateZ(${barrelRollProgress * 57.2958}deg)` : ''}`,
      }}
    >
      <img
        src={getCharacterSprite()}
        alt="Flying Doctor"
        className="w-12 h-16 pixelated drop-shadow-lg"
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
          ...getWindEffects()
        }}
      />
      
      {/* Physics effect particles */}
      {physics && physics.thrust > 1.0 && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-6 bg-gradient-to-t from-blue-400 to-transparent opacity-60 animate-pulse" />
        </div>
      )}
      
      {/* Energy trail */}
      {physics && physics.energy < 50 && (
        <div className="absolute top-1/2 -left-8 transform -translate-y-1/2">
          <div className="w-6 h-1 bg-gradient-to-r from-yellow-400 to-transparent opacity-40" />
        </div>
      )}
    </div>
  );
};