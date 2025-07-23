import { useEffect, useRef, useState, useCallback } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SkyBackground } from './SkyBackground';
import { GameControls } from './GameControls';
import { toast } from 'sonner';

interface GameState {
  playerY: number;
  playerX: number;
  velocity: number;
  distance: number;
  gameStarted: boolean;
  gameOver: boolean;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

export const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    playerY: 300,
    playerX: 100,
    velocity: 0,
    distance: 0,
    gameStarted: false,
    gameOver: false,
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

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      distance: 0,
      playerY: 300,
      playerX: 100,
      velocity: 0
    }));
    toast("Game started! Use WASD or arrow keys to fly!");
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      gameOver: false,
      distance: 0,
      playerY: 300,
      playerX: 100,
      velocity: 0
    }));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const gameLoop = () => {
      setGameState(prev => {
        let newVelocity = prev.velocity;
        let newY = prev.playerY;
        let newX = prev.playerX;
        
        // Apply physics
        const gravity = 0.5;
        const thrust = -1.2;
        const maxVelocity = 8;
        const horizontalSpeed = 3;
        
        // Vertical movement
        if (prev.keys.up) {
          newVelocity = Math.max(newVelocity + thrust, -maxVelocity);
        } else {
          newVelocity = Math.min(newVelocity + gravity, maxVelocity);
        }
        
        newY += newVelocity;
        
        // Horizontal movement
        if (prev.keys.left && newX > 20) {
          newX -= horizontalSpeed;
        }
        if (prev.keys.right && newX < 200) {
          newX += horizontalSpeed;
        }
        
        // Boundary checking
        if (newY < 0) {
          newY = 0;
          newVelocity = 0;
        }
        if (newY > 520) { // Hover above bottom (560 - 40px buffer)
          newY = 520;
          newVelocity = 0;
        }
        
        // Update distance (continuous progression)
        const newDistance = prev.distance + 2;
        
        return {
          ...prev,
          velocity: newVelocity,
          playerY: newY,
          playerX: newX,
          distance: newDistance
        };
      });
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-sky">
      <SkyBackground distance={gameState.distance} />
      
      {gameState.gameStarted && !gameState.gameOver && (
        <>
          <DoctorCharacter 
            x={gameState.playerX} 
            y={gameState.playerY}
            velocity={gameState.velocity}
            keys={gameState.keys}
          />
          
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-sm font-semibold text-foreground">
                Distance: {Math.floor(gameState.distance / 10)}m
              </p>
            </div>
          </div>
        </>
      )}
      
      <GameControls 
        gameStarted={gameState.gameStarted}
        gameOver={gameState.gameOver}
        distance={gameState.distance}
        onStart={startGame}
        onReset={resetGame}
      />
    </div>
  );
};