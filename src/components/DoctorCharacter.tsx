import { useState, useEffect } from 'react';

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
}

export const DoctorCharacter = ({ x, y, velocity, forwardSpeed, keys }: DoctorCharacterProps) => {
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

  // Determine rotation based on velocity, movement, and wind effect
  const getRotation = () => {
    let rotation = 0;
    if (velocity < -2) rotation = -15; // Flying up
    else if (velocity > 2) rotation = 15; // Flying down
    
    if (keys.left) rotation -= 5;
    if (keys.right) rotation += 5;
    
    // Add wind effect at max speed
    if (forwardSpeed >= 5.5) {
      rotation += Math.sin(Date.now() * 0.01) * 3; // Gentle sway in the wind
    }
    
    return rotation;
  };

  // Get additional wind effects for the character
  const getWindEffects = () => {
    if (forwardSpeed >= 5.5) {
      const windSway = Math.sin(Date.now() * 0.008) * 2;
      const windScale = 1 + Math.sin(Date.now() * 0.012) * 0.05;
      return {
        transform: `scaleX(${windScale}) translateX(${windSway}px)`,
        transition: 'none'
      };
    }
    return {};
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
      className="absolute z-10 transition-transform duration-75"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `rotate(${getRotation()}deg)`,
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
    </div>
  );
};