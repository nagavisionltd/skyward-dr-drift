import { useEffect, useRef, useCallback } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SkyBackground } from './SkyBackground';
import { GameControls } from './GameControls';
import { VirtualJoystick } from './VirtualJoystick';
import { LevelGoal } from './LevelGoal';
import { FlightInstruments } from './FlightInstruments';
import { useEnhancedGamePhysics } from '@/hooks/useEnhancedGamePhysics';
import { getBiomeFromDistance } from '@/lib/biomeEffects';
import { toast } from 'sonner';

export const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const {
    gameState,
    updateGamePhysics,
    startGame,
    resetGame,
    setFlightMode,
    updateKeys,
    updateJoystick
  } = useEnhancedGamePhysics();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    let newKeys = { ...gameState.keys };
    
    if (['arrowup', 'w', ' '].includes(key)) {
      e.preventDefault();
      newKeys.up = true;
    }
    if (['arrowdown', 's'].includes(key)) {
      newKeys.down = true;
    }
    if (['arrowleft', 'a'].includes(key)) {
      newKeys.left = true;
    }
    if (['arrowright', 'd'].includes(key)) {
      newKeys.right = true;
    }
    
    // Flight mode switching
    if (key === '1') setFlightMode('normal');
    if (key === '2') setFlightMode('precision');
    if (key === '3') setFlightMode('speed');
    
    updateKeys(newKeys);
  }, [gameState.keys, setFlightMode, updateKeys]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    let newKeys = { ...gameState.keys };
    
    if (['arrowup', 'w', ' '].includes(key)) {
      newKeys.up = false;
    }
    if (['arrowdown', 's'].includes(key)) {
      newKeys.down = false;
    }
    if (['arrowleft', 'a'].includes(key)) {
      newKeys.left = false;
    }
    if (['arrowright', 'd'].includes(key)) {
      newKeys.right = false;
    }
    
    updateKeys(newKeys);
  }, [gameState.keys, updateKeys]);

  // Mobile joystick handlers
  const handleJoystickDirection = useCallback((direction: { x: number; y: number }) => {
    updateJoystick({
      ...gameState.joystick,
      x: direction.x,
      y: direction.y
    });
  }, [gameState.joystick, updateJoystick]);

  const handleJoystickBoost = useCallback((boosting: boolean) => {
    updateJoystick({
      ...gameState.joystick,
      boost: boosting
    });
  }, [gameState.joystick, updateJoystick]);

  const handleStartGame = () => {
    startGame();
    toast("Game started! Enhanced physics enabled!");
  };

  const handleResetGame = () => {
    resetGame();
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
      updateGamePhysics();
      
      // Check level completion
      if (gameState.distance >= gameState.goalX && !gameState.levelComplete) {
        toast.success("🎉 Level Complete! Masterful flying!");
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.levelComplete, updateGamePhysics, gameState.distance, gameState.goalX]);

  // Enhanced motion blur and visual effects
  const getMotionBlurStyle = () => {
    const speed = Math.sqrt(gameState.physics.velocity.x ** 2 + gameState.physics.velocity.y ** 2);
    const speedFactor = Math.min(speed / 15, 1);
    const blurAmount = speedFactor * 3;
    return {
      filter: `blur(${blurAmount}px) ${gameState.speedLines ? 'brightness(1.1)' : ''}`,
      transition: 'filter 0.3s ease'
    };
  };

  // Get current biome for UI display
  const currentBiome = getBiomeFromDistance(gameState.distance);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-sky">
      {/* Enhanced motion blur effect */}
      <div style={gameState.physics.velocity.x > 8 ? getMotionBlurStyle() : {}}>
        <SkyBackground 
          distance={gameState.distance} 
          forwardSpeed={Math.sqrt(gameState.physics.velocity.x ** 2 + gameState.physics.velocity.y ** 2)} 
        />
      </div>
      
      {/* Speed lines effect */}
      {gameState.speedLines && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
      )}
      
      {gameState.gameStarted && !gameState.gameOver && !gameState.levelComplete && (
        <>
          <DoctorCharacter 
            x={gameState.position.x} 
            y={gameState.position.y}
            velocity={gameState.physics.velocity.y}
            forwardSpeed={Math.sqrt(gameState.physics.velocity.x ** 2 + gameState.physics.velocity.y ** 2)}
            keys={gameState.keys}
            isBarrelRolling={gameState.isBarrelRolling}
            barrelRollProgress={gameState.barrelRollProgress}
            physics={gameState.physics}
          />
          
          <LevelGoal 
            worldX={gameState.worldPosition.x}
            goalX={gameState.goalX}
            cameraX={gameState.cameraPosition.x}
          />
          
          {/* Enhanced Flight Instruments */}
          <FlightInstruments 
            distance={gameState.distance}
            speed={Math.sqrt(gameState.physics.velocity.x ** 2 + gameState.physics.velocity.y ** 2)}
            altitude={520 - gameState.position.y}
            energy={gameState.physics.energy}
            lift={gameState.physics.lift}
            drag={gameState.physics.drag}
            biome={currentBiome.name}
            flightMode={gameState.controlState.mode}
            efficiency={gameState.efficiency}
            smoothness={gameState.smoothness}
            onFlightModeChange={setFlightMode}
          />
        </>
      )}
      
      {/* Enhanced Mobile Controls */}
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
        onStart={handleStartGame}
        onReset={handleResetGame}
      />
    </div>
  );
};