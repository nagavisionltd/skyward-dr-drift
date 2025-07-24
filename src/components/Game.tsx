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
        const speed = 3;
        let newX = prev.position.x;
        let newY = prev.position.y;
        
        if (prev.keys.up) newY -= speed;
        if (prev.keys.down) newY += speed;
        if (prev.keys.left) newX -= speed;
        if (prev.keys.right) newX += speed;
        
        // Keep character on screen
        newX = Math.max(0, Math.min(window.innerWidth - 50, newX));
        newY = Math.max(0, Math.min(window.innerHeight - 50, newY));
        
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
      <DoctorCharacter 
        x={gameState.position.x} 
        y={gameState.position.y}
        velocity={0}
        forwardSpeed={0}
        keys={gameState.keys}
      />
    </div>
  );
};