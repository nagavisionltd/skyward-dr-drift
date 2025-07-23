import { useState, useCallback } from 'react';

export interface FlightPhysics {
  position: { x: number; y: number; worldX: number };
  velocity: { x: number; y: number };
  rotation: number;
  speed: number;
  lift: number;
  stalled: boolean;
  inUpdraft: boolean;
}

export interface UpdraftZone {
  x: number;
  width: number;
  strength: number;
}

export const useFlightPhysics = (initialState: Partial<FlightPhysics> = {}) => {
  const [physics, setPhysics] = useState<FlightPhysics>({
    position: { x: 100, y: 300, worldX: 100 },
    velocity: { x: 2, y: 0 },
    rotation: 0,
    speed: 2,
    lift: 0,
    stalled: false,
    inUpdraft: false,
    ...initialState
  });

  // Updraft zones scattered throughout the level
  const updraftZones: UpdraftZone[] = [
    { x: 2000, width: 300, strength: 1.5 },
    { x: 4500, width: 400, strength: 2.0 },
    { x: 7200, width: 350, strength: 1.8 },
    { x: 9500, width: 300, strength: 1.6 }
  ];

  const updatePhysics = useCallback((inputs: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    deltaTime: number;
  }) => {
    setPhysics(prev => {
      const { up, down, left, right, deltaTime } = inputs;
      
      // Physics constants
      const gravity = 0.5;
      const drag = 0.98;
      const thrustPower = 0.8;
      const maxSpeed = 12;
      const minFlyingSpeed = 3;
      const liftCoefficient = 0.15;
      const stallAngle = 25;
      const maxBankAngle = 45;
      
      let newVel = { ...prev.velocity };
      let newPos = { ...prev.position };
      let newRotation = prev.rotation;
      
      // Apply thrust when going up/right
      if (up || right) {
        const thrustAngle = newRotation * Math.PI / 180;
        newVel.x += Math.cos(thrustAngle) * thrustPower * deltaTime;
        newVel.y -= Math.sin(thrustAngle) * thrustPower * deltaTime;
      }
      
      // Banking for turns
      if (left && !prev.stalled) {
        newRotation = Math.max(newRotation - 2, -maxBankAngle);
        newVel.x -= 0.3 * deltaTime;
      } else if (right && !prev.stalled) {
        newRotation = Math.min(newRotation + 1.5, maxBankAngle);
        newVel.x += 0.2 * deltaTime;
      } else {
        // Return to level flight
        newRotation *= 0.95;
      }
      
      // Calculate current speed
      const currentSpeed = Math.sqrt(newVel.x * newVel.x + newVel.y * newVel.y);
      
      // Lift calculation based on speed and angle of attack
      let lift = 0;
      if (currentSpeed > 1) {
        const angleOfAttack = Math.abs(newRotation);
        if (angleOfAttack < stallAngle) {
          lift = currentSpeed * liftCoefficient * (1 - angleOfAttack / stallAngle);
        }
      }
      
      // Stall mechanics
      const isStalled = currentSpeed < minFlyingSpeed || Math.abs(newRotation) > stallAngle;
      if (isStalled) {
        // Lose lift and nose down
        lift = 0;
        newRotation += Math.sign(newRotation) * 0.5;
        newVel.y += gravity * 1.5 * deltaTime; // Fall faster when stalled
      }
      
      // Check for updraft zones
      let inUpdraft = false;
      let updraftForce = 0;
      for (const zone of updraftZones) {
        if (newPos.worldX >= zone.x && newPos.worldX <= zone.x + zone.width) {
          inUpdraft = true;
          updraftForce = zone.strength;
          break;
        }
      }
      
      // Apply forces
      newVel.y += gravity * deltaTime; // Gravity
      newVel.y -= lift * deltaTime; // Lift
      
      if (inUpdraft) {
        newVel.y -= updraftForce * deltaTime; // Updraft
      }
      
      // Apply drag for momentum conservation
      newVel.x *= drag;
      newVel.y *= drag;
      
      // Speed limits
      const speed = Math.sqrt(newVel.x * newVel.x + newVel.y * newVel.y);
      if (speed > maxSpeed) {
        const ratio = maxSpeed / speed;
        newVel.x *= ratio;
        newVel.y *= ratio;
      }
      
      // Update position
      newPos.worldX += newVel.x * deltaTime * 60; // Scale for 60fps
      newPos.y += newVel.y * deltaTime * 60;
      
      // Camera following logic
      if (newPos.x > 350) {
        const targetCameraX = newPos.worldX - 350;
        newPos.x = 350;
      } else {
        newPos.x += (newVel.x * deltaTime * 60) * 0.1; // Slow lateral movement on screen
      }
      
      // Boundary checking
      newPos.y = Math.max(0, Math.min(520, newPos.y));
      newPos.x = Math.max(50, Math.min(400, newPos.x));
      
      // Reset velocity if hitting boundaries
      if (newPos.y <= 0 || newPos.y >= 520) {
        newVel.y *= -0.3; // Bounce with energy loss
      }
      
      return {
        position: newPos,
        velocity: newVel,
        rotation: newRotation,
        speed: Math.sqrt(newVel.x * newVel.x + newVel.y * newVel.y),
        lift,
        stalled: isStalled,
        inUpdraft
      };
    });
  }, []);

  const reset = useCallback((newState?: Partial<FlightPhysics>) => {
    setPhysics({
      position: { x: 100, y: 300, worldX: 100 },
      velocity: { x: 2, y: 0 },
      rotation: 0,
      speed: 2,
      lift: 0,
      stalled: false,
      inUpdraft: false,
      ...newState
    });
  }, []);

  return {
    physics,
    updatePhysics,
    reset,
    updraftZones
  };
};