import { useEffect, useCallback, useState } from 'react';
import { DoctorCharacter } from './DoctorCharacter';

interface GameState {
  position: { x: number; y: number };
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
    keys: { up: false, down: false, left: false, right: false }
  });

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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const gameLoop = () => {
      setGameState(prev => {
        const speed = 5;
        let newX = prev.position.x;
        let newY = prev.position.y;
        
        if (prev.keys.up) newY -= speed;
        if (prev.keys.down) newY += speed;
        if (prev.keys.left) newX -= speed;
        if (prev.keys.right) newX += speed;
        
        // Keep character within the large canvas area (5000px wide)
        newX = Math.max(25, Math.min(5000 - 75, newX));
        newY = Math.max(25, Math.min(window.innerHeight - 75, newY));
        
        return {
          ...prev,
          position: { x: newX, y: newY }
        };
      });
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div 
        className="relative bg-black"
        style={{ 
          width: '5000px', 
          height: '100vh',
          transform: `translateX(-${Math.max(0, gameState.position.x - window.innerWidth / 2)}px)`
        }}
      >
        <DoctorCharacter 
          x={gameState.position.x} 
          y={gameState.position.y}
          velocity={0}
          forwardSpeed={5}
          rotation={0}
          stalled={false}
          keys={gameState.keys}
        />
      </div>
    </div>
  );
};