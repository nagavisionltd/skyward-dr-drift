import { useEffect, useCallback, useState } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SpaceBackground } from './SpaceBackground';
import { GlowingOrb } from './GlowingOrb';
import { GameHUD } from './GameHUD';
import { GameControls } from './GameControls';
import { LevelGoal } from './LevelGoal';
import { StartScreen } from './StartScreen';
import { VirtualJoystick } from './VirtualJoystick';
import { useGameState } from '../hooks/useGameState';
import { useIsMobile } from '../hooks/use-mobile';

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
  const [playerState, setPlayerState] = useState<GameState>({
    position: { x: 200, y: 300 },
    velocity: { x: 0, y: 0 },
    keys: { up: false, down: false, left: false, right: false }
  });
  
  const { gameState, collectOrb, checkCollisions, updateDistance, resetGame } = useGameState();
  const [gameStarted, setGameStarted] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const isMobile = useIsMobile();

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

  // Mobile controls handlers
  const handleDirectionChange = useCallback((direction: { x: number; y: number }) => {
    setPlayerState(prev => ({
      ...prev,
      keys: {
        up: direction.y > 0.3,
        down: direction.y < -0.3,
        left: direction.x < -0.3,
        right: direction.x > 0.3,
      }
    }));
  }, []);

  const handleBoost = useCallback((boosting: boolean) => {
    setIsBoosting(boosting);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameState.gameOver) return;

    const gameLoop = () => {
      setPlayerState(prev => {
        // Physics constants
        const acceleration = 0.3;
        const deceleration = 0.85;
        const maxSpeed = 6;
        const boostMultiplier = isBoosting ? 1.8 : 1;
        
        let newVelocity = { ...prev.velocity };
        
        // Apply acceleration based on input
        if (prev.keys.up) newVelocity.y -= acceleration;
        if (prev.keys.down) newVelocity.y += acceleration;
        if (prev.keys.left) newVelocity.x -= acceleration;
        if (prev.keys.right) newVelocity.x += acceleration * boostMultiplier;
        
        // Apply deceleration
        newVelocity.x *= deceleration;
        newVelocity.y *= deceleration;
        
        // Limit speed
        const speed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
        if (speed > maxSpeed * boostMultiplier) {
          const ratio = (maxSpeed * boostMultiplier) / speed;
          newVelocity.x *= ratio;
          newVelocity.y *= ratio;
        }
        
        // Update position
        let newX = prev.position.x + newVelocity.x;
        let newY = prev.position.y + newVelocity.y;
        
        // Boundaries
        newX = Math.max(25, Math.min(10000 - 75, newX));
        newY = Math.max(25, Math.min(window.innerHeight - 75, newY));
        
        // Update game state
        updateDistance(newX);
        checkCollisions(newX, newY);
        
        return {
          ...prev,
          position: { x: newX, y: newY },
          velocity: newVelocity
        };
      });
      
      if (!gameState.gameOver) {
        requestAnimationFrame(gameLoop);
      }
    };
    
    gameLoop();
  }, [gameStarted, gameState.gameOver, updateDistance, checkCollisions, isBoosting]);

  const cameraX = Math.max(0, playerState.position.x - window.innerWidth / 2);

  const handleStartGame = () => {
    setGameStarted(true);
    resetGame();
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setPlayerState({
      position: { x: 200, y: 300 },
      velocity: { x: 0, y: 0 },
      keys: { up: false, down: false, left: false, right: false }
    });
    resetGame();
  };

  // Show start screen if game hasn't started
  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

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
        
        {/* Glowing Orbs */}
        {gameState.orbs.map(orb => (
          <GlowingOrb
            key={orb.id}
            x={orb.x}
            y={orb.y}
            color={orb.color}
            points={orb.points}
            collected={orb.collected}
            onCollect={() => collectOrb(orb.id)}
            cameraX={cameraX}
          />
        ))}
        
        {/* Level Goal */}
        <LevelGoal
          worldX={playerState.position.x}
          goalX={9500}
          cameraX={cameraX}
        />
        
        <DoctorCharacter 
          data-player="true"
          x={playerState.position.x} 
          y={playerState.position.y}
          velocity={Math.sqrt(playerState.velocity.x ** 2 + playerState.velocity.y ** 2)}
          forwardSpeed={Math.sqrt(playerState.velocity.x ** 2 + playerState.velocity.y ** 2)}
          rotation={playerState.velocity.x > 0 ? 5 : playerState.velocity.x < 0 ? -5 : 0}
          stalled={false}
          keys={playerState.keys}
        />
      </div>
      
      {/* Game HUD */}
      <GameHUD 
        score={gameState.score}
        lives={gameState.lives}
        distance={gameState.distance}
      />
      
      {/* Mobile Controls */}
      {isMobile && (
        <VirtualJoystick
          onDirectionChange={handleDirectionChange}
          onBoost={handleBoost}
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