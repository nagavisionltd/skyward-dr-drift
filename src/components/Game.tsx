import { useEffect, useCallback, useState } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SpaceBackground } from './SpaceBackground';
import { Collectible } from './Collectible';
import { Obstacle } from './Obstacle';
import { GameHUD } from './GameHUD';
import { GameControls } from './GameControls';
import { LevelGoal } from './LevelGoal';
import { useGameState } from '../hooks/useGameState';

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
  const [playerState, setPlayerState] = useState<GameState>({
    position: { x: 200, y: 300 },
    keys: { up: false, down: false, left: false, right: false }
  });
  
  const { gameState, collectItem, checkCollisions, updateDistance, resetGame } = useGameState();
  const [gameStarted, setGameStarted] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['arrowup', 'w', ' '].includes(key)) {
      e.preventDefault();
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, up: true } }));
    }
    if (['arrowdown', 's'].includes(key)) {
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, down: true } }));
    }
    if (['arrowleft', 'a'].includes(key)) {
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, left: true } }));
    }
    if (['arrowright', 'd'].includes(key)) {
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, right: true } }));
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['arrowup', 'w', ' '].includes(key)) {
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, up: false } }));
    }
    if (['arrowdown', 's'].includes(key)) {
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, down: false } }));
    }
    if (['arrowleft', 'a'].includes(key)) {
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, left: false } }));
    }
    if (['arrowright', 'd'].includes(key)) {
      setPlayerState(prev => ({ ...prev, keys: { ...prev.keys, right: false } }));
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
    if (!gameStarted || gameState.gameOver) return;

    const gameLoop = () => {
      setPlayerState(prev => {
        const speed = 5;
        let newX = prev.position.x;
        let newY = prev.position.y;
        
        if (prev.keys.up) newY -= speed;
        if (prev.keys.down) newY += speed;
        if (prev.keys.left) newX -= speed;
        if (prev.keys.right) newX += speed;
        
        // Keep character within the large canvas area (10000px wide)
        newX = Math.max(25, Math.min(10000 - 75, newX));
        newY = Math.max(25, Math.min(window.innerHeight - 75, newY));
        
        // Update game state
        updateDistance(newX);
        checkCollisions(newX, newY);
        
        return {
          ...prev,
          position: { x: newX, y: newY }
        };
      });
      
      if (!gameState.gameOver) {
        requestAnimationFrame(gameLoop);
      }
    };
    
    gameLoop();
  }, [gameStarted, gameState.gameOver, updateDistance, checkCollisions]);

  const cameraX = Math.max(0, playerState.position.x - window.innerWidth / 2);

  const handleStartGame = () => {
    setGameStarted(true);
    resetGame();
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setPlayerState({
      position: { x: 200, y: 300 },
      keys: { up: false, down: false, left: false, right: false }
    });
    resetGame();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div 
        className="relative bg-black"
        style={{ 
          width: '10000px', 
          height: '100vh',
          transform: `translateX(-${cameraX}px)`
        }}
      >
        <SpaceBackground width={10000} height={window.innerHeight} />
        
        {/* Collectibles */}
        {gameState.collectibles.map(collectible => (
          <Collectible
            key={collectible.id}
            x={collectible.x}
            y={collectible.y}
            type={collectible.type}
            collected={collectible.collected}
            onCollect={() => collectItem(collectible.id)}
            cameraX={cameraX}
          />
        ))}
        
        {/* Obstacles */}
        {gameState.obstacles.map(obstacle => (
          <Obstacle
            key={obstacle.id}
            x={obstacle.x}
            y={obstacle.y}
            width={obstacle.width}
            height={obstacle.height}
            type={obstacle.type}
            cameraX={cameraX}
          />
        ))}
        
        {/* Level Goal */}
        {gameStarted && (
          <LevelGoal
            worldX={playerState.position.x}
            goalX={9500}
            cameraX={cameraX}
          />
        )}
        
        {gameStarted && (
          <DoctorCharacter 
            x={playerState.position.x} 
            y={playerState.position.y}
            velocity={0}
            forwardSpeed={5}
            rotation={0}
            stalled={false}
            keys={playerState.keys}
          />
        )}
      </div>
      
      {/* Game HUD */}
      {gameStarted && (
        <GameHUD 
          score={gameState.score}
          lives={gameState.lives}
          distance={gameState.distance}
        />
      )}
      
      {/* Game Controls */}
      <GameControls
        gameStarted={gameStarted}
        gameOver={gameState.gameOver}
        levelComplete={gameState.levelComplete}
        onStartGame={handleStartGame}
        onResetGame={handleResetGame}
      />
    </div>
  );
};