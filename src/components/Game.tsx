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
  
  const { gameState, collectOrb, checkCollisions, updateDistance, resetGame, nextLevel, resetToLevel1 } = useGameState();
  const [gameStarted, setGameStarted] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
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

  // Mobile controls handlers - fixed for touch flying
  const handleDirectionChange = useCallback((direction: { x: number; y: number }) => {
    setPlayerState(prev => ({
      ...prev,
      keys: {
        up: direction.y > 0.1,
        down: direction.y < -0.1,
        left: direction.x < -0.1,
        right: direction.x > 0.1,
      }
    }));
  }, []);

  const handleBoost = useCallback((boosting: boolean) => {
    setIsBoosting(boosting);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameState.gameOver) return;

    let lastTime = 0;
    let animationId: number;
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      // Limit to ~60fps for consistent performance
      if (deltaTime < 16.67) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      lastTime = currentTime;
      
      setPlayerState(prev => {
        // Physics constants - optimized for smooth gameplay
        const acceleration = 0.8;
        const deceleration = 0.94;
        const maxSpeed = 12;
        const boostMultiplier = isBoosting ? 2.2 : 1;
        
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
        
        // Check for level completion - different goals per level
        const levelGoals = [9500, 12000, 15000]; // Goals for levels 1, 2, 3
        const currentGoal = levelGoals[gameState.currentLevel - 1] || 9500;
        if (newX >= currentGoal && !showLevelComplete) {
          setShowLevelComplete(true);
        }
        
        return {
          ...prev,
          position: { x: newX, y: newY },
          velocity: newVelocity
        };
      });
      
      // Update game state less frequently to reduce overhead
      updateDistance(playerState.position.x);
      
      if (!gameState.gameOver) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };
    
    animationId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStarted, gameState.gameOver, updateDistance, isBoosting]);

  const cameraX = Math.max(0, playerState.position.x - window.innerWidth / 2);

  const handleStartGame = () => {
    setGameStarted(true);
    resetToLevel1();
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setShowLevelComplete(false);
    setPlayerState({
      position: { x: 200, y: 300 },
      velocity: { x: 0, y: 0 },
      keys: { up: false, down: false, left: false, right: false }
    });
    resetToLevel1();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleContinueToNextLevel = () => {
    setShowLevelComplete(false);
    if (gameState.currentLevel < gameState.totalLevels) {
      nextLevel();
      setPlayerState({
        position: { x: 200, y: 300 },
        velocity: { x: 0, y: 0 },
        keys: { up: false, down: false, left: false, right: false }
      });
    } else {
      // Game completed - restart from level 1
      handleResetGame();
    }
  };

  // Show start screen if game hasn't started
  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black landscape-mode">
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-all"
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>

      {/* Controls Button - moved to bottom right */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-4 right-20 z-50 px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm hover:bg-black/70 transition-all"
      >
        Controls
      </button>

      {/* Controls Panel - positioned near button */}
      {showControls && (
        <div 
          className="fixed bottom-20 right-4 z-40 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white text-sm max-w-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <div><strong>Movement:</strong></div>
            <div>• Arrow Keys or WASD</div>
            <div>• Space/Up Arrow: Fly up</div>
            <div>• Mobile: Touch screen to fly</div>
            <div><strong>Boost:</strong> Hold boost button</div>
            <div><strong>Goal:</strong> Reach the finish line!</div>
          </div>
        </div>
      )}

      {/* Click overlay to close controls */}
      {showControls && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowControls(false)}
        />
      )}

      <div 
        className="relative bg-black"
        style={{ 
          width: '10000px', 
          height: '100vh',
          transform: `translateX(-${cameraX}px)`
        }}
      >
        <SpaceBackground width={10000} height={window.innerHeight} />
        
        {/* Level Goal - dynamic based on current level */}
        <LevelGoal
          worldX={playerState.position.x}
          goalX={[9500, 12000, 15000][gameState.currentLevel - 1] || 9500}
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
      
      {/* Game HUD - now shows current level */}
      <div className="fixed top-4 left-4 z-40 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white">
        <div className="text-xl font-bold mb-2">Level {gameState.currentLevel}</div>
        <div className="text-sm space-y-1">
          <div>Score: {gameState.score}</div>
          <div>Lives: {gameState.lives}</div>
          <div>Distance: {Math.floor(gameState.distance)}m</div>
        </div>
      </div>
      
      {/* Mobile Controls */}
      {isMobile && (
        <VirtualJoystick
          onDirectionChange={handleDirectionChange}
          onBoost={handleBoost}
        />
      )}

      {/* Level Complete Modal */}
      {showLevelComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 border border-white/20 rounded-2xl p-8 text-center text-white max-w-md mx-4">
            <h2 className="text-4xl font-bold mb-4 text-yellow-400">🎉 CONGRATULATIONS! 🎉</h2>
            <p className="text-xl mb-6">You completed Level {gameState.currentLevel}!</p>
            {gameState.currentLevel < gameState.totalLevels ? (
              <p className="text-lg mb-8 text-blue-200">Get ready for Level {gameState.currentLevel + 1}!</p>
            ) : (
              <p className="text-lg mb-8 text-green-200">🏆 You completed all levels! 🏆</p>
            )}
            <button
              onClick={handleContinueToNextLevel}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              {gameState.currentLevel < gameState.totalLevels ? 'Next Level' : 'Play Again'}
            </button>
          </div>
        </div>
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