export interface PhysicsState {
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  angular: { velocity: number; acceleration: number };
  airResistance: number;
  lift: number;
  drag: number;
  thrust: number;
  energy: number;
  maxEnergy: number;
}

export interface FlightPhysics {
  gravity: number;
  airDensity: number;
  liftCoefficient: number;
  dragCoefficient: number;
  thrustPower: number;
  maxVelocity: { x: number; y: number };
  stallSpeed: number;
  optimalSpeed: number;
  maxThrust: number;
}

export interface WindSystem {
  direction: { x: number; y: number };
  strength: number;
  turbulence: number;
  gusts: Array<{ x: number; strength: number; width: number }>;
}

export const DEFAULT_PHYSICS: FlightPhysics = {
  gravity: 0.015,
  airDensity: 1.0,
  liftCoefficient: 0.8,
  dragCoefficient: 0.02,
  thrustPower: 1.2,
  maxVelocity: { x: 20, y: 12 },
  stallSpeed: 3,
  optimalSpeed: 8,
  maxThrust: 2.0
};

export const calculateLift = (speed: number, physics: FlightPhysics): number => {
  if (speed < physics.stallSpeed) return 0;
  return physics.liftCoefficient * physics.airDensity * Math.pow(speed, 2) * 0.001;
};

export const calculateDrag = (velocity: { x: number; y: number }, physics: FlightPhysics): { x: number; y: number } => {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  const dragMagnitude = physics.dragCoefficient * physics.airDensity * Math.pow(speed, 2) * 0.001;
  
  if (speed === 0) return { x: 0, y: 0 };
  
  return {
    x: -(velocity.x / speed) * dragMagnitude,
    y: -(velocity.y / speed) * dragMagnitude
  };
};

export const calculateWind = (position: { x: number; y: number }, windSystem: WindSystem): { x: number; y: number } => {
  let windEffect = { 
    x: windSystem.direction.x * windSystem.strength,
    y: windSystem.direction.y * windSystem.strength
  };
  
  // Add turbulence
  const turbulence = (Math.random() - 0.5) * windSystem.turbulence;
  windEffect.x += turbulence;
  windEffect.y += turbulence * 0.5;
  
  // Add gusts
  windSystem.gusts.forEach(gust => {
    const distance = Math.abs(position.x - gust.x);
    if (distance < gust.width) {
      const gustEffect = (1 - distance / gust.width) * gust.strength;
      windEffect.x += gustEffect;
    }
  });
  
  return windEffect;
};

export const updatePhysics = (
  physicsState: PhysicsState,
  inputs: { thrust: number; direction: { x: number; y: number } },
  deltaTime: number,
  physics: FlightPhysics,
  windSystem: WindSystem,
  position: { x: number; y: number }
): PhysicsState => {
  const newState = { ...physicsState };
  
  // Calculate forces
  const speed = Math.sqrt(newState.velocity.x * newState.velocity.x + newState.velocity.y * newState.velocity.y);
  const lift = calculateLift(speed, physics);
  const drag = calculateDrag(newState.velocity, physics);
  const wind = calculateWind(position, windSystem);
  
  // Apply gravity
  newState.acceleration.y = physics.gravity;
  
  // Apply lift (opposite to gravity when moving forward)
  if (speed > physics.stallSpeed) {
    newState.acceleration.y -= lift;
  }
  
  // Apply thrust
  const thrustMagnitude = Math.min(inputs.thrust * physics.thrustPower, physics.maxThrust);
  newState.acceleration.x += inputs.direction.x * thrustMagnitude;
  newState.acceleration.y += inputs.direction.y * thrustMagnitude;
  
  // Apply drag
  newState.acceleration.x += drag.x;
  newState.acceleration.y += drag.y;
  
  // Apply wind
  newState.acceleration.x += wind.x * 0.1;
  newState.acceleration.y += wind.y * 0.1;
  
  // Update velocity
  newState.velocity.x += newState.acceleration.x * deltaTime;
  newState.velocity.y += newState.acceleration.y * deltaTime;
  
  // Clamp velocity
  newState.velocity.x = Math.max(-physics.maxVelocity.x, Math.min(physics.maxVelocity.x, newState.velocity.x));
  newState.velocity.y = Math.max(-physics.maxVelocity.y, Math.min(physics.maxVelocity.y, newState.velocity.y));
  
  // Update energy system
  const energyConsumption = Math.abs(inputs.thrust) * 0.02;
  newState.energy = Math.max(0, Math.min(newState.maxEnergy, newState.energy - energyConsumption + 0.01));
  
  // Store calculated values
  newState.lift = lift;
  newState.drag = Math.sqrt(drag.x * drag.x + drag.y * drag.y);
  newState.thrust = thrustMagnitude;
  newState.airResistance = Math.sqrt(drag.x * drag.x + drag.y * drag.y) + Math.abs(wind.x) + Math.abs(wind.y);
  
  // Reset acceleration for next frame
  newState.acceleration = { x: 0, y: 0 };
  
  return newState;
};