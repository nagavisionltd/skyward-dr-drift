import { useEffect, useRef, useState, useCallback } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SkyBackground } from './SkyBackground';
import { GameControls } from './GameControls';
import { VirtualJoystick } from './VirtualJoystick';
import { LevelGoal } from './LevelGoal';
import { toast } from 'sonner';

interface GameState {
  playerY: number;
  playerX: number;
  worldX: number; // Player's position in the world
  cameraX: number; // Camera offset
  velocity: number;
  forwardSpeed: number;
  distance: number;
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  goalX: number; // Level goal position
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  joystick: {
    x: number;
    y: number;
    boost: boolean;
  };
}

export const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    playerY: 300,
    playerX: 100,
    worldX: 100,
    cameraX: 0,
    velocity: 0,
    forwardSpeed: 2,
    distance: 0,
    gameStarted: false,
    gameOver: false,
    levelComplete: false,
    goalX: 10000, // Goal at 10000 units - longer level
    keys: { up: false, down: false, left: false, right: false },
    joystick: { x: 0, y: 0, boost: false }
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

  // Mobile joystick handlers
  const handleJoystickDirection = useCallback((direction: { x: number; y: number }) => {
    setGameState(prev => ({
      ...prev,
      joystick: { ...prev.joystick, x: direction.x, y: direction.y }
    }));
  }, []);

  const handleJoystickBoost = useCallback((boosting: boolean) => {
    setGameState(prev => ({
      ...prev,
      joystick: { ...prev.joystick, boost: boosting }
    }));
  }, []);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      levelComplete: false,
      distance: 0,
      playerY: 300,
      playerX: 100,
      worldX: 100,
      cameraX: 0,
      velocity: 0,
      forwardSpeed: 2
    }));
    toast("Game started! Fly to the goal!");
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      gameOver: false,
      levelComplete: false,
      distance: 0,
      playerY: 300,
      playerX: 100,
      worldX: 100,
      cameraX: 0,
      velocity: 0,
      forwardSpeed: 2
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
    if (!gameState.gameStarted || gameState.gameOver || gameState.levelComplete) return;

    const gameLoop = () => {
      setGameState(prev => {
        let newVelocity = prev.velocity;
        let newY = prev.playerY;
        let newX = prev.playerX;
        let newWorldX = prev.worldX;
        let newForwardSpeed = prev.forwardSpeed;
        
        // Apply physics
        const gravity = 0.01;
        const thrust = -0.6; // Reduced from -1.2 for slower rising
        const maxVelocity = 8;
        const horizontalSpeed = 6; // Increased from 5
        const maxForwardSpeed = 15; // Increased from 10
        const forwardAcceleration = 0.2; // Enhanced acceleration
        
        // Combine keyboard and joystick inputs
        const upInput = prev.keys.up || prev.joystick.y > 0.3;
        const downInput = prev.keys.down || prev.joystick.y < -0.3;
        const leftInput = prev.keys.left || prev.joystick.x < -0.3;
        const rightInput = prev.keys.right || prev.joystick.x > 0.3 || prev.joystick.boost;
        
        // Forward movement - always moving forward, can accelerate
        if (rightInput) {
          newForwardSpeed = Math.min(newForwardSpeed + forwardAcceleration, maxForwardSpeed);
        } else {
          newForwardSpeed = Math.max(newForwardSpeed - forwardAcceleration * 0.3, 2);
        }
        
        // Update world position
        newWorldX += newForwardSpeed;
        
        // Vertical movement
        if (upInput) {
          newVelocity = Math.max(newVelocity + thrust, -maxVelocity);
        } else {
          newVelocity = Math.min(newVelocity + gravity, maxVelocity);
        }
        
        newY += newVelocity;
        
        // Left/right movement relative to screen with joystick precision
        if (leftInput && newX > 50) {
          const speed = prev.joystick.x ? Math.abs(prev.joystick.x) * horizontalSpeed : horizontalSpeed;
          newX -= speed;
        }
        if (rightInput && newX < 400) { // Allow player to move further right
          const speed = prev.joystick.x ? Math.abs(prev.joystick.x) * horizontalSpeed * 0.7 : horizontalSpeed * 0.7;
          newX += speed;
        }
        
        // Camera follows player when they get close to right edge (350+ pixels from left)
        let newCameraX = prev.cameraX;
        if (newX > 350) {
          const targetCameraX = newWorldX - 350; // Keep player at 350px from left edge
          newCameraX = prev.cameraX + (targetCameraX - prev.cameraX) * 0.15;
          newX = 350; // Clamp player position to trigger point
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
        
        // Update distance based on world position
        const newDistance = newWorldX;
        
        // Check level completion
        let levelComplete = false;
        if (newWorldX >= prev.goalX) {
          levelComplete = true;
          toast.success("🎉 Level Complete! Amazing flying!");
        }
        
        return {
          ...prev,
          velocity: newVelocity,
          playerY: newY,
          playerX: newX,
          worldX: newWorldX,
          cameraX: newCameraX,
          forwardSpeed: newForwardSpeed,
          distance: newDistance,
          levelComplete
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
  }, [gameState.gameStarted, gameState.gameOver, gameState.levelComplete]);

  // Motion blur effect based on speed
  const getMotionBlurStyle = () => {
    const speedFactor = Math.min(gameState.forwardSpeed / 15, 1);
    const blurAmount = speedFactor * 3;
    return {
      filter: `blur(${blurAmount}px)`,
      transition: 'filter 0.3s ease'
    };
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-sky">
      <div style={gameState.forwardSpeed > 8 ? getMotionBlurStyle() : {}}>
        <SkyBackground distance={gameState.distance} forwardSpeed={gameState.forwardSpeed} />
      </div>
      
      {gameState.gameStarted && !gameState.gameOver && !gameState.levelComplete && (
        <>
          <DoctorCharacter 
            x={gameState.playerX} 
            y={gameState.playerY}
            velocity={gameState.velocity}
            forwardSpeed={gameState.forwardSpeed}
            keys={gameState.keys}
          />
          
          <LevelGoal 
            worldX={gameState.worldX}
            goalX={gameState.goalX}
            cameraX={gameState.cameraX}
          />
          
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-sm font-semibold text-foreground">
                Distance: {Math.floor(gameState.distance / 10)}m
              </p>
              <p className="text-xs text-muted-foreground">
                Speed: {gameState.forwardSpeed.toFixed(1)}x
              </p>
            </div>
          </div>
        </>
      )}
      
      {/* Mobile Controls - only show on touch devices */}
      {gameState.gameStarted && !gameState.gameOver && !gameState.levelComplete && (
        <VirtualJoystick 
          onDirectionChange={handleJoystickDirection}
          onBoost={handleJoystickBoost}
        />
      )}
      
      <GameControls 
        gameStarted={gameState.gameStarted}
        gameOver={gameState.gameOver}
        levelComplete={gameState.levelComplete}
        distance={gameState.distance}
        onStart={startGame}
        onReset={resetGame}
      />
    </div>
  );
};