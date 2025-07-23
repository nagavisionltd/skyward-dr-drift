import { useEffect, useRef, useState, useCallback } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SkyBackground } from './SkyBackground';
import { GameControls } from './GameControls';
import { VirtualJoystick } from './VirtualJoystick';
import { LevelGoal } from './LevelGoal';
import { UpdraftZone } from './UpdraftZone';
import { useFlightPhysics } from '../hooks/useFlightPhysics';
import { toast } from 'sonner';

interface GameState {
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  goalX: number;
  cameraX: number;
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
  const lastTimeRef = useRef<number>(0);
  
  const { physics, updatePhysics, reset: resetPhysics, updraftZones } = useFlightPhysics();
  
  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    gameOver: false,
    levelComplete: false,
    goalX: 10000,
    cameraX: 0,
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
      cameraX: 0
    }));
    resetPhysics();
    lastTimeRef.current = performance.now();
    toast("Game started! Use physics to reach the goal!");
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      gameOver: false,
      levelComplete: false,
      cameraX: 0
    }));
    resetPhysics();
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

    const gameLoop = (timestamp: number) => {
      const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = timestamp;
      
      if (deltaTime > 0.05) return; // Skip large gaps (page was hidden)
      
      // Combine keyboard and joystick inputs
      const upInput = gameState.keys.up || gameState.joystick.y > 0.3;
      const downInput = gameState.keys.down || gameState.joystick.y < -0.3;
      const leftInput = gameState.keys.left || gameState.joystick.x < -0.3;
      const rightInput = gameState.keys.right || gameState.joystick.x > 0.3 || gameState.joystick.boost;
      
      updatePhysics({
        up: upInput,
        down: downInput,
        left: leftInput,
        right: rightInput,
        deltaTime
      });
      
      setGameState(prev => {
        // Camera follows player when they get close to right edge
        let newCameraX = prev.cameraX;
        if (physics.position.x > 350) {
          const targetCameraX = physics.position.worldX - 350;
          newCameraX = prev.cameraX + (targetCameraX - prev.cameraX) * 0.15;
        }
        
        // Check level completion
        let levelComplete = false;
        if (physics.position.worldX >= prev.goalX) {
          levelComplete = true;
          toast.success("🎉 Level Complete! Master of aerodynamics!");
        }
        
        return {
          ...prev,
          cameraX: newCameraX,
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
  }, [gameState.gameStarted, gameState.gameOver, gameState.levelComplete, gameState.keys, gameState.joystick, updatePhysics, physics.position]);

  // Motion blur effect based on speed
  const getMotionBlurStyle = () => {
    const speedFactor = Math.min(physics.speed / 12, 1);
    const blurAmount = speedFactor * 3;
    return {
      filter: `blur(${blurAmount}px)`,
      transition: 'filter 0.3s ease'
    };
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-sky">
      <div style={physics.speed > 8 ? getMotionBlurStyle() : {}}>
        <SkyBackground distance={physics.position.worldX} forwardSpeed={physics.speed} />
      </div>
      
      {gameState.gameStarted && !gameState.gameOver && !gameState.levelComplete && (
        <>
          <UpdraftZone 
            worldX={physics.position.worldX}
            cameraX={gameState.cameraX}
            zones={updraftZones}
          />
          
          <DoctorCharacter 
            x={physics.position.x} 
            y={physics.position.y}
            velocity={physics.velocity.y}
            forwardSpeed={physics.speed}
            keys={gameState.keys}
            rotation={physics.rotation}
            stalled={physics.stalled}
          />
          
          <LevelGoal 
            worldX={physics.position.worldX}
            goalX={gameState.goalX}
            cameraX={gameState.cameraX}
          />
          
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-sm font-semibold text-foreground">
                Distance: {Math.floor(physics.position.worldX / 10)}m
              </p>
              <p className="text-xs text-muted-foreground">
                Speed: {physics.speed.toFixed(1)} | Lift: {physics.lift.toFixed(2)}
              </p>
              {physics.stalled && (
                <p className="text-xs text-red-400 font-bold">STALLED!</p>
              )}
              {physics.inUpdraft && (
                <p className="text-xs text-blue-400 font-bold">↑ UPDRAFT</p>
              )}
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
        distance={physics.position.worldX}
        onStart={startGame}
        onReset={resetGame}
      />
    </div>
  );
};