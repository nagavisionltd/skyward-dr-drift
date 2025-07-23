import { useState, useCallback } from 'react';
import { PhysicsState, FlightPhysics, WindSystem, DEFAULT_PHYSICS, updatePhysics } from '@/lib/physics';
import { ControlInputs, ControlState, FLIGHT_MODES, processKeyboardInputs, processJoystickInputs, combineInputs, detectBarrelRoll } from '@/lib/flightControls';
import { getBiomeFromDistance, calculateBiomeEffects } from '@/lib/biomeEffects';

export interface EnhancedGameState {
  // Position and movement
  position: { x: number; y: number };
  worldPosition: { x: number; y: number };
  cameraPosition: { x: number; y: number };
  
  // Physics
  physics: PhysicsState;
  flightPhysics: FlightPhysics;
  windSystem: WindSystem;
  
  // Controls
  controlState: ControlState;
  
  // Game state
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  distance: number;
  goalX: number;
  
  // Input states
  keys: { up: boolean; down: boolean; left: boolean; right: boolean };
  joystick: { x: number; y: number; boost: boolean };
  
  // Visual effects
  isBarrelRolling: boolean;
  barrelRollProgress: number;
  speedLines: boolean;
  
  // Performance tracking
  efficiency: number;
  smoothness: number;
}

export const useEnhancedGamePhysics = () => {
  const [gameState, setGameState] = useState<EnhancedGameState>({
    position: { x: 100, y: 300 },
    worldPosition: { x: 100, y: 300 },
    cameraPosition: { x: 0, y: 0 },
    physics: {
      velocity: { x: 2, y: 0 },
      acceleration: { x: 0, y: 0 },
      angular: { velocity: 0, acceleration: 0 },
      airResistance: 0,
      lift: 0,
      drag: 0,
      thrust: 0,
      energy: 100,
      maxEnergy: 100
    },
    flightPhysics: DEFAULT_PHYSICS,
    windSystem: {
      direction: { x: 1, y: 0 },
      strength: 0.1,
      turbulence: 0.05,
      gusts: []
    },
    controlState: {
      mode: 'normal',
      sensitivity: 1.0,
      deadzone: 0.1,
      lastInputTime: 0,
      rollState: 0,
      barrelRollCooldown: 0
    },
    gameStarted: false,
    gameOver: false,
    levelComplete: false,
    distance: 0,
    goalX: 10000,
    keys: { up: false, down: false, left: false, right: false },
    joystick: { x: 0, y: 0, boost: false },
    isBarrelRolling: false,
    barrelRollProgress: 0,
    speedLines: false,
    efficiency: 100,
    smoothness: 100
  });

  const updateGamePhysics = useCallback((deltaTime: number = 1/60) => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.gameOver || prev.levelComplete) return prev;
      
      const currentTime = Date.now();
      const currentBiome = getBiomeFromDistance(prev.distance);
      
      // Process inputs
      const keyboardInputs = processKeyboardInputs(prev.keys, prev.controlState, FLIGHT_MODES[prev.controlState.mode]);
      const joystickInputs = processJoystickInputs(prev.joystick, prev.controlState, FLIGHT_MODES[prev.controlState.mode]);
      const combinedInputs = combineInputs(keyboardInputs, joystickInputs);
      
      // Check for barrel roll
      const { isBarrelRoll, newControlState } = detectBarrelRoll(combinedInputs.roll, prev.controlState, currentTime);
      
      // Update wind system with biome effects
      const biomeEffects = calculateBiomeEffects(prev.worldPosition, currentBiome);
      const updatedWindSystem = {
        ...prev.windSystem,
        direction: { 
          x: prev.windSystem.direction.x + biomeEffects.wind.x, 
          y: prev.windSystem.direction.y + biomeEffects.wind.y 
        },
        strength: prev.windSystem.strength * currentBiome.windModifier,
        turbulence: prev.windSystem.turbulence * currentBiome.turbulenceModifier
      };
      
      // Update physics with biome gravity modifier
      const updatedFlightPhysics = {
        ...prev.flightPhysics,
        gravity: DEFAULT_PHYSICS.gravity * biomeEffects.gravity
      };
      
      // Apply brake effect
      let thrustInput = combinedInputs.thrust;
      if (combinedInputs.brake) {
        thrustInput = -0.5; // Air brake
      }
      
      // Apply boost effect
      if (combinedInputs.boost && prev.physics.energy > 10) {
        thrustInput *= 1.5;
      }
      
      // Update physics
      const newPhysics = updatePhysics(
        prev.physics,
        { thrust: thrustInput, direction: combinedInputs.direction },
        deltaTime,
        updatedFlightPhysics,
        updatedWindSystem,
        prev.worldPosition
      );
      
      // Update positions - remove Y constraint for free flight
      const newWorldPosition = {
        x: prev.worldPosition.x + newPhysics.velocity.x * deltaTime * 60,
        y: prev.worldPosition.y + newPhysics.velocity.y * deltaTime * 60
      };
      
      // Screen position with minimal constraints
      let newScreenX = prev.position.x + combinedInputs.direction.x * 6;
      newScreenX = Math.max(20, Math.min(window.innerWidth - 80, newScreenX));
      
      const newPosition = {
        x: newScreenX,
        y: newWorldPosition.y
      };
      
      // Camera following logic
      let newCameraX = prev.cameraPosition.x;
      if (newPosition.x > 350) {
        const targetCameraX = newWorldPosition.x - 350;
        newCameraX = prev.cameraPosition.x + (targetCameraX - prev.cameraPosition.x) * 0.15;
        newPosition.x = 350;
      }
      
      const newCameraPosition = { x: newCameraX, y: prev.cameraPosition.y };
      
      // Update distance
      const newDistance = newWorldPosition.x;
      
      // Check level completion
      let levelComplete = false;
      if (newDistance >= prev.goalX) {
        levelComplete = true;
      }
      
      // Update visual effects
      const speed = Math.sqrt(newPhysics.velocity.x * newPhysics.velocity.x + newPhysics.velocity.y * newPhysics.velocity.y);
      const speedLines = speed > 12;
      
      // Update barrel roll progress - fix infinite loop
      let barrelRollProgress = prev.barrelRollProgress;
      let isCurrentlyBarrelRolling = prev.isBarrelRolling;
      
      if (isBarrelRoll && !prev.isBarrelRolling) {
        barrelRollProgress = 0;
        isCurrentlyBarrelRolling = true;
      } else if (isCurrentlyBarrelRolling) {
        barrelRollProgress += deltaTime * 6;
        if (barrelRollProgress >= 2 * Math.PI) {
          barrelRollProgress = 0;
          isCurrentlyBarrelRolling = false;
        }
      }
      
      // Calculate performance metrics
      const efficiency = Math.max(0, 100 - (newPhysics.drag + newPhysics.airResistance) * 10);
      const smoothness = Math.max(0, 100 - Math.abs(newPhysics.acceleration.x + newPhysics.acceleration.y) * 50);
      
      return {
        ...prev,
        position: newPosition,
        worldPosition: newWorldPosition,
        cameraPosition: newCameraPosition,
        physics: newPhysics,
        flightPhysics: updatedFlightPhysics,
        windSystem: updatedWindSystem,
        controlState: newControlState,
        distance: newDistance,
        levelComplete,
        isBarrelRolling: isCurrentlyBarrelRolling,
        barrelRollProgress,
        speedLines,
        efficiency,
        smoothness
      };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      levelComplete: false,
      distance: 0,
      position: { x: 100, y: 300 },
      worldPosition: { x: 100, y: 300 },
      cameraPosition: { x: 0, y: 0 },
      physics: {
        velocity: { x: 2, y: 0 },
        acceleration: { x: 0, y: 0 },
        angular: { velocity: 0, acceleration: 0 },
        airResistance: 0,
        lift: 0,
        drag: 0,
        thrust: 0,
        energy: 100,
        maxEnergy: 100
      }
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      gameOver: false,
      levelComplete: false,
      distance: 0,
      position: { x: 100, y: 300 },
      worldPosition: { x: 100, y: 300 },
      cameraPosition: { x: 0, y: 0 },
      physics: {
        velocity: { x: 2, y: 0 },
        acceleration: { x: 0, y: 0 },
        angular: { velocity: 0, acceleration: 0 },
        airResistance: 0,
        lift: 0,
        drag: 0,
        thrust: 0,
        energy: 100,
        maxEnergy: 100
      }
    }));
  }, []);

  const setFlightMode = useCallback((mode: string) => {
    setGameState(prev => ({
      ...prev,
      controlState: { ...prev.controlState, mode }
    }));
  }, []);

  const updateKeys = useCallback((keys: { up: boolean; down: boolean; left: boolean; right: boolean }) => {
    setGameState(prev => ({ ...prev, keys }));
  }, []);

  const updateJoystick = useCallback((joystick: { x: number; y: number; boost: boolean }) => {
    setGameState(prev => ({ ...prev, joystick }));
  }, []);

  return {
    gameState,
    updateGamePhysics,
    startGame,
    resetGame,
    setFlightMode,
    updateKeys,
    updateJoystick
  };
};