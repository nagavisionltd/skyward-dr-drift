import { useEffect, useCallback, useState } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SpaceBackground } from './SpaceBackground';
import { UpdraftZone } from './UpdraftZone';

interface GameState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

export const Game = () => {
  const [gameState, setGameState] = useState<GameState>({
    position: { x: 200, y: 300 },
    velocity: { x: 0, y: 0 },
    keys: { up: false, down: false, left: false, right: false }
  });

  const [cameraX, setCameraX] = useState(0);
  const worldWidth = 10000;

  const updraftZones = [
    { x: 800, width: 200, strength: 1.2 },
    { x: 2000, width: 150, strength: 1.5 },
    { x: 3500, width: 250, strength: 1.3 }
  ];

  // Input handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['arrowup', 'w', ' '].includes(key)) {
      e.preventDefault();
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, up: true } }));
    }
    if (['arrowdown', 's'].includes(key)) {
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, down: true } }));
    }
    if (['arrowleft', 'a'].includes(key)) {
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, left: true } }));
    }
    if (['arrowright', 'd'].includes(key)) {
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, right: true } }));
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['arrowup', 'w', ' '].includes(key)) {
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, up: false } }));
    }
    if (['arrowdown', 's'].includes(key)) {
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, down: false } }));
    }
    if (['arrowleft', 'a'].includes(key)) {
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, left: false } }));
    }
    if (['arrowright', 'd'].includes(key)) {
      setGameState(prev => ({ ...prev, keys: { ...prev.keys, right: false } }));
    }
  }, []);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game loop - focused on clean flight physics
  useEffect(() => {
    const gameLoop = () => {
      setGameState(prev => {
        const gravity = 0.15;
        const friction = 0.92;
        const inputForce = 0.6;
        const maxSpeed = 8;
        
        let newVelX = prev.velocity.x * friction;
        let newVelY = prev.velocity.y * friction + gravity;
        
        // Apply input forces
        if (prev.keys.up) newVelY -= inputForce;
        if (prev.keys.down) newVelY += inputForce * 0.7;
        if (prev.keys.left) newVelX -= inputForce;
        if (prev.keys.right) newVelX += inputForce;
        
        // Check if in updraft zone
        const inUpdraftZone = updraftZones.find(zone => 
          prev.position.x >= zone.x && prev.position.x <= zone.x + zone.width
        );
        if (inUpdraftZone) {
          newVelY -= inUpdraftZone.strength;
        }
        
        // Apply velocity limits
        newVelX = Math.max(-maxSpeed, Math.min(maxSpeed, newVelX));
        newVelY = Math.max(-maxSpeed, Math.min(maxSpeed, newVelY));
        
        let newX = prev.position.x + newVelX;
        let newY = prev.position.y + newVelY;
        
        // Keep character within bounds
        newX = Math.max(25, Math.min(worldWidth - 75, newX));
        newY = Math.max(25, Math.min(window.innerHeight - 75, newY));
        
        // If hit bounds, reduce velocity in that direction
        if (newX <= 25 || newX >= worldWidth - 75) newVelX *= 0.3;
        if (newY <= 25 || newY >= window.innerHeight - 75) newVelY *= 0.3;
        
        return {
          ...prev,
          position: { x: newX, y: newY },
          velocity: { x: newVelX, y: newVelY }
        };
      });
      
      // Update camera position for smooth following
      setCameraX(prev => {
        const targetX = Math.max(0, gameState.position.x - window.innerWidth / 2);
        return prev + (targetX - prev) * 0.08;
      });
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  }, [gameState.position.x, updraftZones, worldWidth]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div 
        className="relative bg-black"
        style={{ 
          width: `${worldWidth}px`, 
          height: '100vh',
          transform: `translateX(-${cameraX}px)`
        }}
      >
        <SpaceBackground width={worldWidth} height={window.innerHeight} />
        
        <UpdraftZone 
          worldX={gameState.position.x}
          cameraX={cameraX}
          zones={updraftZones}
        />
        
        <DoctorCharacter 
          x={gameState.position.x} 
          y={gameState.position.y}
          velocity={Math.sqrt(gameState.velocity.x ** 2 + gameState.velocity.y ** 2)}
          forwardSpeed={2}
          rotation={gameState.velocity.x * 3}
          stalled={false}
          keys={gameState.keys}
        />
      </div>
      
      {/* Simple controls indicator */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
          <div className="text-xs text-gray-300 space-y-1">
            <div>🔺 W/↑/Space: Fly Up</div>
            <div>🔻 S/↓: Dive Down</div>
            <div>◀️ A/←: Move Left</div>
            <div>▶️ D/→: Move Right</div>
          </div>
        </div>
      </div>
    </div>
  );
};