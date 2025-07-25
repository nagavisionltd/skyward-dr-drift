import { useState, useEffect } from 'react';

interface DoctorCharacterProps {
  x: number;
  y: number;
  velocity: number;
  forwardSpeed: number;
  rotation?: number;
  stalled?: boolean;
  invulnerable?: boolean;
  shieldActive?: boolean;
  boostActive?: boolean;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

export const DoctorCharacter = ({ x, y, velocity, forwardSpeed, rotation = 0, stalled = false, invulnerable = false, shieldActive = false, boostActive = false, keys }: DoctorCharacterProps) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  const [lastMovementState, setLastMovementState] = useState({ up: false, down: false, left: false, right: false });
  const isHighSpeed = animationFrame === 5 && keys.right;
  // Animation cycling - maintain frame 5 when right is held, even with up/down movement
  useEffect(() => {
    const isMoving = keys.up || keys.down || keys.left || keys.right;
    const rightKeyChanged = keys.right !== lastMovementState.right;
    const horizontalMovementChanged = keys.left !== lastMovementState.left || keys.right !== lastMovementState.right;
    
    if (!isMoving) {
      setAnimationFrame(0); // Reset to first frame when not moving
      setLastMovementState({ up: false, down: false, left: false, right: false });
      return;
    }
    
    // Only restart animation if horizontal movement changed or right key was released
    if (horizontalMovementChanged || (!keys.right && rightKeyChanged)) {
      setAnimationFrame(0);
      setLastMovementState({ ...keys });
    } else {
      // Update last movement state for up/down without resetting animation
      setLastMovementState({ ...keys });
    }
    
    // Don't start animation interval if we're at frame 5 and right is held
    if (animationFrame === 5 && keys.right) {
      return;
    }
    
    const interval = setInterval(() => {
      setAnimationFrame(prev => {
        const nextFrame = prev + 1;
        // If we reach the last frame (5), stay there
        return nextFrame >= 6 ? 5 : nextFrame;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [keys.up, keys.down, keys.left, keys.right, animationFrame]);

  // Use physics rotation with additional effects
  const getRotation = () => {
    let finalRotation = rotation;
    
    // Add dynamic rotation based on movement for visual effect
    if (keys.left) finalRotation -= 15;
    if (keys.right) finalRotation += 10;
    
    // Add wind effect at high speed
    if (forwardSpeed >= 4) {
      finalRotation += Math.sin(Date.now() * 0.01) * 2;
    }
    
    // Add stall wobble
    if (stalled) {
      finalRotation += Math.sin(Date.now() * 0.02) * 10;
    }
    
    return finalRotation;
  };

  // Get additional effects for the character
  const getCharacterEffects = () => {
    let effects: React.CSSProperties = {};
    
    // Wind effects at high speed
    if (forwardSpeed >= 4) {
      const windSway = Math.sin(Date.now() * 0.008) * 2;
      const windScale = 1 + Math.sin(Date.now() * 0.012) * 0.03;
      effects.transform = `scaleX(${windScale}) translateX(${windSway}px)`;
    }
    
    // Stall effects
    if (stalled) {
      effects.filter = 'hue-rotate(30deg) brightness(0.8)';
      effects.animation = 'shake 0.5s ease-in-out infinite';
    }
    
    return effects;
  };

  // Character sprites using the uploaded images
  const getCharacterSprite = () => {
    const sprites = [
      '/lovable-uploads/6ccfd2c3-9961-48ae-bdc2-fad6619a6af3.png',
      '/lovable-uploads/77cce5c4-74e2-4f1b-91a5-a82152dc2b3d.png',
      '/lovable-uploads/c3a3637e-efb0-4a03-9498-43a510244199.png',
      '/lovable-uploads/db63a21f-5a7f-4592-962d-f1cd45943f0f.png',
      '/lovable-uploads/dd3a3a22-d446-4fc2-b490-ccc05800b1d8.png',
      '/lovable-uploads/720cec1c-7fa2-4421-96c5-279b81204b32.png',
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
      {/* Energy Aura for High Speed */}
      {isHighSpeed && (
        <>
          {/* Main Energy Aura */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              width: '80px',
              height: '80px',
              left: '-20px',
              top: '-15px',
              background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,140,0,0.2) 50%, transparent 70%)',
              animation: 'pulse 0.5s ease-in-out infinite alternate'
            }}
          />
          
          {/* Secondary Energy Ring */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              width: '100px',
              height: '100px',
              left: '-30px',
              top: '-25px',
              background: 'radial-gradient(circle, transparent 60%, rgba(255,215,0,0.1) 70%, transparent 80%)',
              animation: 'spin 1s linear infinite'
            }}
          />
          
          {/* Energy Sparks */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + Math.cos(Date.now() * 0.01 + i) * 40}px`,
                top: `${25 + Math.sin(Date.now() * 0.01 + i) * 40}px`,
                animation: `pulse 0.3s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </>
      )}
      
      {/* Wind Effect Lines */}
      {keys.right && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-0.5 bg-blue-300 opacity-60"
              style={{
                left: `${-20 - i * 8}px`,
                top: `${20 + i * 4}px`,
                animation: `fadeInOut 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </>
      )}
      {/* Shield Effect */}
      {shieldActive && (
        <div 
          className="absolute inset-0 -m-4 rounded-full border-4 border-blue-400 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(79,195,247,0.2), transparent)',
            boxShadow: '0 0 20px rgba(79,195,247,0.6)',
            zIndex: -1
          }}
        />
      )}

      {/* Boost Effect */}
      {boostActive && (
        <div className="absolute inset-0 -m-2">
          <div className="w-full h-full rounded-full animate-ping bg-orange-400 opacity-30" />
          <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-20 animate-pulse" />
        </div>
      )}

      {/* Invulnerability Effect */}
      {invulnerable && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)',
            animation: 'flash 0.2s ease-in-out infinite alternate'
          }}
        />
      )}

      <img
        src={getCharacterSprite()}
        alt="Flying Doctor"
        className={`w-12 h-16 pixelated drop-shadow-lg ${stalled ? 'animate-bounce' : ''} ${invulnerable ? 'animate-pulse' : ''}`}
        style={{
          imageRendering: 'pixelated',
          filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) ${
            invulnerable ? 'brightness(1.5) hue-rotate(180deg)' : ''
          } ${boostActive ? 'drop-shadow(0 0 10px #FF6B35)' : ''}`,
          transform: keys.left ? 'scaleX(-1)' : 'scaleX(1)',
          ...getCharacterEffects()
        }}
      />
      
      <style>{`
        @keyframes flash {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};