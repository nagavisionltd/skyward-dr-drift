export interface ControlInputs {
  thrust: number;
  direction: { x: number; y: number };
  boost: boolean;
  brake: boolean;
  roll: number;
  precision: boolean;
}

export interface FlightMode {
  name: string;
  thrustMultiplier: number;
  responseMultiplier: number;
  stabilityMultiplier: number;
}

export const FLIGHT_MODES: Record<string, FlightMode> = {
  normal: {
    name: 'Normal',
    thrustMultiplier: 1.0,
    responseMultiplier: 1.0,
    stabilityMultiplier: 1.0
  },
  precision: {
    name: 'Precision',
    thrustMultiplier: 0.6,
    responseMultiplier: 0.7,
    stabilityMultiplier: 1.5
  },
  speed: {
    name: 'Speed',
    thrustMultiplier: 1.5,
    responseMultiplier: 1.3,
    stabilityMultiplier: 0.8
  }
};

export interface ControlState {
  mode: string;
  sensitivity: number;
  deadzone: number;
  lastInputTime: number;
  rollState: number;
  barrelRollCooldown: number;
}

export const processKeyboardInputs = (
  keys: { up: boolean; down: boolean; left: boolean; right: boolean },
  controlState: ControlState,
  flightMode: FlightMode
): ControlInputs => {
  let thrust = 0;
  let direction = { x: 0, y: 0 };
  let boost = false;
  let brake = false;
  let roll = 0;
  
  // Calculate thrust
  if (keys.up) thrust += 1.0;
  if (keys.down) brake = true;
  
  // Calculate direction
  if (keys.left) {
    direction.x -= 1.0;
    roll -= 1.0;
  }
  if (keys.right) {
    direction.x += 1.0;
    roll += 1.0;
    boost = true; // Right also boosts
  }
  
  // Apply flight mode modifiers
  thrust *= flightMode.thrustMultiplier;
  direction.x *= flightMode.responseMultiplier;
  direction.y *= flightMode.responseMultiplier;
  
  return {
    thrust,
    direction,
    boost,
    brake,
    roll,
    precision: controlState.mode === 'precision'
  };
};

export const processJoystickInputs = (
  joystick: { x: number; y: number; boost: boolean },
  controlState: ControlState,
  flightMode: FlightMode
): ControlInputs => {
  // Apply deadzone
  const x = Math.abs(joystick.x) > controlState.deadzone ? joystick.x : 0;
  const y = Math.abs(joystick.y) > controlState.deadzone ? joystick.y : 0;
  
  // Calculate analog inputs
  const thrust = Math.max(0, y) * controlState.sensitivity;
  const direction = {
    x: x * controlState.sensitivity,
    y: -Math.min(0, y) * controlState.sensitivity // Negative y for down
  };
  
  // Apply flight mode modifiers
  const modifiedThrust = thrust * flightMode.thrustMultiplier;
  const modifiedDirection = {
    x: direction.x * flightMode.responseMultiplier,
    y: direction.y * flightMode.responseMultiplier
  };
  
  return {
    thrust: modifiedThrust,
    direction: modifiedDirection,
    boost: joystick.boost,
    brake: y < -0.8, // Strong down input acts as brake
    roll: x,
    precision: controlState.mode === 'precision'
  };
};

export const combineInputs = (keyboardInputs: ControlInputs, joystickInputs: ControlInputs): ControlInputs => {
  return {
    thrust: Math.max(keyboardInputs.thrust, joystickInputs.thrust),
    direction: {
      x: keyboardInputs.direction.x + joystickInputs.direction.x,
      y: keyboardInputs.direction.y + joystickInputs.direction.y
    },
    boost: keyboardInputs.boost || joystickInputs.boost,
    brake: keyboardInputs.brake || joystickInputs.brake,
    roll: keyboardInputs.roll + joystickInputs.roll,
    precision: keyboardInputs.precision || joystickInputs.precision
  };
};

export const detectBarrelRoll = (
  roll: number,
  controlState: ControlState,
  currentTime: number
): { isBarrelRoll: boolean; newControlState: ControlState } => {
  const newState = { ...controlState };
  
  if (currentTime - controlState.barrelRollCooldown < 1000) {
    return { isBarrelRoll: false, newControlState: newState };
  }
  
  // Detect rapid roll input change
  const rollChange = Math.abs(roll - controlState.rollState);
  if (rollChange > 1.5 && Math.abs(roll) > 0.8) {
    newState.barrelRollCooldown = currentTime;
    newState.rollState = roll;
    return { isBarrelRoll: true, newControlState: newState };
  }
  
  newState.rollState = roll;
  return { isBarrelRoll: false, newControlState: newState };
};