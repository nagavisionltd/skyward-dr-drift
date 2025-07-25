import { useEffect, useCallback, useState } from 'react';
import { DoctorCharacter } from './DoctorCharacter';
import { SpaceBackground } from './SpaceBackground';
import { GameControls } from './GameControls';
import { LevelGoal } from './LevelGoal';
import { UpdraftZone } from './UpdraftZone';
import { VirtualJoystick } from './VirtualJoystick';
import { Obstacles } from './Obstacles';
import { Collectibles } from './Collectibles';
import { PowerUps } from './PowerUps';
import { ParticleSystem } from './ParticleSystem';
import { SoundManager } from './SoundManager';
import { toast } from 'sonner';

interface GameState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  score: number;
  lives: number;
  distance: number;
  level: number;
  speed: number;
  invulnerable: boolean;
  boostActive: boolean;
  boostCooldown: number;
  shieldActive: boolean;
  magnetActive: boolean;
  doubleScoreActive: boolean;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'asteroid' | 'meteor' | 'debris' | 'satellite';
  speed: number;
  rotation: number;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'gem' | 'star' | 'health';
  value: number;
  collected: boolean;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'boost' | 'shield' | 'magnet' | 'double_score' | 'extra_life';
  duration: number;
  collected: boolean;
}

export const Game = () => {
  const [gameState, setGameState] = useState<GameState>({
    position: { x: 200, y: 300 },
    velocity: { x: 0, y: 0 },
    keys: { up: false, down: false, left: false, right: false },
    gameStarted: false,
    gameOver: false,
    levelComplete: false,
    score: 0,
    lives: 3,
    distance: 0,
    level: 1,
    speed: 1.5,
    invulnerable: false,
    boostActive: false,
    boostCooldown: 0,
    shieldActive: false,
    magnetActive: false,
    doubleScoreActive: false
  });

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [cameraX, setCameraX] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const goalX = 5000 + (gameState.level - 1) * 2000; // Goals get further each level
  const worldWidth = 10000 + (gameState.level - 1) * 3000;

  const updraftZones = [
    { x: 800, width: 200, strength: 1.5 },
    { x: 2000, width: 150, strength: 2.0 },
    { x: 3500, width: 250, strength: 1.8 },
    { x: goalX - 500, width: 300, strength: 2.5 }
  ];

  // Game initialization
  const initializeGame = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    const newCollectibles: Collectible[] = [];
    const newPowerUps: PowerUp[] = [];

    // Generate obstacles based on level difficulty
    const obstacleCount = 15 + gameState.level * 5;
    for (let i = 0; i < obstacleCount; i++) {
      const types: Obstacle['type'][] = ['asteroid', 'meteor', 'debris', 'satellite'];
      newObstacles.push({
        id: i,
        x: 500 + Math.random() * (worldWidth - 1000),
        y: 50 + Math.random() * (window.innerHeight - 150),
        width: 40 + Math.random() * 60,
        height: 40 + Math.random() * 60,
        type: types[Math.floor(Math.random() * types.length)],
        speed: 1 + Math.random() * 2,
        rotation: Math.random() * 360
      });
    }

    // Generate collectibles
    const collectibleCount = 25 + gameState.level * 10;
    for (let i = 0; i < collectibleCount; i++) {
      const types: Collectible['type'][] = ['coin', 'gem', 'star', 'health'];
      const weights = [0.5, 0.3, 0.15, 0.05]; // Probability weights
      let selectedType: Collectible['type'] = 'coin';
      const random = Math.random();
      let cumulative = 0;
      
      for (let j = 0; j < types.length; j++) {
        cumulative += weights[j];
        if (random <= cumulative) {
          selectedType = types[j];
          break;
        }
      }

      newCollectibles.push({
        id: i,
        x: 300 + Math.random() * (worldWidth - 600),
        y: 30 + Math.random() * (window.innerHeight - 120),
        type: selectedType,
        value: selectedType === 'coin' ? 10 : selectedType === 'gem' ? 50 : selectedType === 'star' ? 100 : 0,
        collected: false
      });
    }

    // Generate power-ups
    const powerUpCount = 5 + gameState.level * 2;
    for (let i = 0; i < powerUpCount; i++) {
      const types: PowerUp['type'][] = ['boost', 'shield', 'magnet', 'double_score', 'extra_life'];
      newPowerUps.push({
        id: i,
        x: 600 + Math.random() * (worldWidth - 1200),
        y: 40 + Math.random() * (window.innerHeight - 140),
        type: types[Math.floor(Math.random() * types.length)],
        duration: 5000 + Math.random() * 5000,
        collected: false
      });
    }

    setObstacles(newObstacles);
    setCollectibles(newCollectibles);
    setPowerUps(newPowerUps);
  }, [gameState.level, worldWidth]);

  // Particle system management
  const addParticles = useCallback((x: number, y: number, type: string, count: number = 5) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: 60 + Math.random() * 60,
        type,
        size: 2 + Math.random() * 4
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Collision detection
  const checkCollisions = useCallback(() => {
    const playerRect = {
      x: gameState.position.x - 25,
      y: gameState.position.y - 25,
      width: 50,
      height: 50
    };

    // Check obstacle collisions
    if (!gameState.invulnerable && !gameState.shieldActive) {
      obstacles.forEach(obstacle => {
        const obstacleRect = {
          x: obstacle.x,
          y: obstacle.y,
          width: obstacle.width,
          height: obstacle.height
        };

        if (playerRect.x < obstacleRect.x + obstacleRect.width &&
            playerRect.x + playerRect.width > obstacleRect.x &&
            playerRect.y < obstacleRect.y + obstacleRect.height &&
            playerRect.y + playerRect.height > obstacleRect.y) {
          
          // Collision detected
          addParticles(gameState.position.x, gameState.position.y, 'explosion', 10);
          
          // Play explosion sound
          if ((window as any).gameSounds) {
            (window as any).gameSounds.explosion();
          }
          
          setGameState(prev => ({
            ...prev,
            lives: prev.lives - 1,
            invulnerable: true,
            score: Math.max(0, prev.score - 50)
          }));

          // Make invulnerable for 2 seconds
          setTimeout(() => {
            setGameState(prev => ({ ...prev, invulnerable: false }));
          }, 2000);

          toast.error("Ouch! -1 Life, -50 Points");
        }
      });
    }

    // Check collectible collisions
    collectibles.forEach(collectible => {
      if (collectible.collected) return;

      const collectRadius = gameState.magnetActive ? 80 : 30;
      const distance = Math.sqrt(
        Math.pow(gameState.position.x - collectible.x, 2) + 
        Math.pow(gameState.position.y - collectible.y, 2)
      );

      if (distance < collectRadius) {
        const scoreMultiplier = gameState.doubleScoreActive ? 2 : 1;
        const points = collectible.value * scoreMultiplier;
        
        setCollectibles(prev => 
          prev.map(c => c.id === collectible.id ? { ...c, collected: true } : c)
        );

        if (collectible.type === 'health') {
          setGameState(prev => ({
            ...prev,
            lives: Math.min(5, prev.lives + 1)
          }));
          toast.success("+1 Life!");
        } else {
          setGameState(prev => ({
            ...prev,
            score: prev.score + points
          }));
          toast.success(`+${points} Points!`);
        }

        // Play collect sound
        if ((window as any).gameSounds) {
          (window as any).gameSounds.collect();
        }

        addParticles(collectible.x, collectible.y, 'collect', 8);
      }
    });

    // Check power-up collisions
    powerUps.forEach(powerUp => {
      if (powerUp.collected) return;

      const distance = Math.sqrt(
        Math.pow(gameState.position.x - powerUp.x, 2) + 
        Math.pow(gameState.position.y - powerUp.y, 2)
      );

      if (distance < 40) {
        setPowerUps(prev => 
          prev.map(p => p.id === powerUp.id ? { ...p, collected: true } : p)
        );

        // Play power-up sound
        if ((window as any).gameSounds) {
          (window as any).gameSounds.powerup();
        }

        switch (powerUp.type) {
          case 'boost':
            setGameState(prev => ({ ...prev, boostActive: true }));
            setTimeout(() => setGameState(prev => ({ ...prev, boostActive: false })), powerUp.duration);
            toast.success("🚀 Speed Boost Activated!");
            break;
          case 'shield':
            setGameState(prev => ({ ...prev, shieldActive: true }));
            setTimeout(() => setGameState(prev => ({ ...prev, shieldActive: false })), powerUp.duration);
            toast.success("🛡️ Shield Activated!");
            break;
          case 'magnet':
            setGameState(prev => ({ ...prev, magnetActive: true }));
            setTimeout(() => setGameState(prev => ({ ...prev, magnetActive: false })), powerUp.duration);
            toast.success("🧲 Magnet Activated!");
            break;
          case 'double_score':
            setGameState(prev => ({ ...prev, doubleScoreActive: true }));
            setTimeout(() => setGameState(prev => ({ ...prev, doubleScoreActive: false })), powerUp.duration);
            toast.success("⭐ Double Score Activated!");
            break;
          case 'extra_life':
            setGameState(prev => ({ ...prev, lives: Math.min(5, prev.lives + 1) }));
            toast.success("❤️ Extra Life!");
            break;
        }

        addParticles(powerUp.x, powerUp.y, 'powerup', 12);
      }
    });
  }, [gameState.position, gameState.invulnerable, gameState.shieldActive, gameState.magnetActive, gameState.doubleScoreActive, obstacles, collectibles, powerUps, addParticles]);

  // Input handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
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
          if (key === 'shift' && gameState.boostCooldown <= 0) {
        // Boost ability
        if ((window as any).gameSounds) {
          (window as any).gameSounds.boost();
        }
        setGameState(prev => ({ 
          ...prev, 
          boostActive: true, 
          boostCooldown: 3000 
        }));
        setTimeout(() => setGameState(prev => ({ ...prev, boostActive: false })), 1000);
      }
  }, [gameState.gameStarted, gameState.gameOver, gameState.boostCooldown]);

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

  const handleJoystickDirection = useCallback((direction: { x: number; y: number }) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
    setGameState(prev => ({
      ...prev,
      keys: {
        up: direction.y < -0.3,
        down: direction.y > 0.3,
        left: direction.x < -0.3,
        right: direction.x > 0.3
      }
    }));
  }, [gameState.gameStarted, gameState.gameOver]);

  const handleJoystickBoost = useCallback((boosting: boolean) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.boostCooldown > 0) return;
    
    if (boosting) {
      setGameState(prev => ({ 
        ...prev, 
        boostActive: true, 
        boostCooldown: 3000 
      }));
      setTimeout(() => setGameState(prev => ({ ...prev, boostActive: false })), 1000);
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.boostCooldown]);

  // Game controls
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      levelComplete: false,
      position: { x: 200, y: 300 },
      velocity: { x: 0, y: 0 }
    }));
    initializeGame();
  }, [initializeGame]);

  const resetGame = useCallback(() => {
    setGameState({
      position: { x: 200, y: 300 },
      velocity: { x: 0, y: 0 },
      keys: { up: false, down: false, left: false, right: false },
      gameStarted: false,
      gameOver: false,
      levelComplete: false,
      score: 0,
      lives: 3,
      distance: 0,
      level: 1,
      speed: 1.5,
      invulnerable: false,
      boostActive: false,
      boostCooldown: 0,
      shieldActive: false,
      magnetActive: false,
      doubleScoreActive: false
    });
    setObstacles([]);
    setCollectibles([]);
    setPowerUps([]);
    setParticles([]);
    setCameraX(0);
  }, []);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      levelComplete: false,
      position: { x: 200, y: 300 },
      velocity: { x: 0, y: 0 },
      speed: Math.min(4, prev.speed + 0.3),
      lives: Math.min(5, prev.lives + 1),
      score: prev.score + 1000 * prev.level
    }));
    if ((window as any).gameSounds) {
      (window as any).gameSounds.levelComplete();
    }
    toast.success(`Level ${gameState.level + 1} Started! +${1000 * gameState.level} Bonus Points!`);
    initializeGame();
  }, [gameState.level, initializeGame]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.levelComplete) return;

    const gameLoop = () => {
      setGameState(prev => {
        const gravity = 0.2;
        const friction = 0.88;
        const baseSpeed = prev.speed + (prev.boostActive ? 2 : 0);
        
        let newVelX = prev.velocity.x * friction;
        let newVelY = prev.velocity.y * friction + gravity;
        
        // Apply input forces (reduced for better control)
        if (prev.keys.up) newVelY -= 0.8;
        if (prev.keys.down) newVelY += 0.6;
        if (prev.keys.left) newVelX -= 0.6;
        if (prev.keys.right) newVelX += 0.7;
        
        // Check if in updraft zone
        const inUpdraftZone = updraftZones.find(zone => 
          prev.position.x >= zone.x && prev.position.x <= zone.x + zone.width
        );
        if (inUpdraftZone) {
          newVelY -= inUpdraftZone.strength;
        }
        
        // Apply velocity limits
        newVelX = Math.max(-baseSpeed * 2, Math.min(baseSpeed * 2, newVelX));
        newVelY = Math.max(-baseSpeed * 2, Math.min(baseSpeed * 1.5, newVelY));
        
        let newX = prev.position.x + newVelX;
        let newY = prev.position.y + newVelY;
        
        // Keep character within bounds
        newX = Math.max(25, Math.min(worldWidth - 75, newX));
        newY = Math.max(25, Math.min(window.innerHeight - 75, newY));
        
        // If hit bounds, stop velocity in that direction
        if (newX <= 25 || newX >= worldWidth - 75) newVelX = 0;
        if (newY <= 25 || newY >= window.innerHeight - 75) newVelY = 0;
        
        const newDistance = Math.max(prev.distance, newX);
        
        // Check level completion
        const levelComplete = newX >= goalX;
        
        // Check game over
        const gameOver = prev.lives <= 0;
        
        // Reduce cooldowns
        const newBoostCooldown = Math.max(0, prev.boostCooldown - 16);
        
        return {
          ...prev,
          position: { x: newX, y: newY },
          velocity: { x: newVelX, y: newVelY },
          distance: newDistance,
          levelComplete,
          gameOver,
          boostCooldown: newBoostCooldown
        };
      });
      
      // Update camera position
      setCameraX(prev => {
        const targetX = Math.max(0, gameState.position.x - window.innerWidth / 2);
        return prev + (targetX - prev) * 0.1; // Smooth camera following
      });
      
      // Update particles
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
          life: particle.life + 1
        }))
        .filter(particle => particle.life < particle.maxLife)
      );
      
      // Update obstacles
      setObstacles(prev => prev.map(obstacle => ({
        ...obstacle,
        rotation: obstacle.rotation + obstacle.speed
      })));
      
      checkCollisions();
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  }, [gameState.gameStarted, gameState.gameOver, gameState.levelComplete, gameState.position.x, checkCollisions, worldWidth, goalX, updraftZones]);

  // Handle level completion
  useEffect(() => {
    if (gameState.levelComplete) {
      setTimeout(nextLevel, 3000);
    }
  }, [gameState.levelComplete, nextLevel]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div 
        className="relative bg-black"
        style={{ 
          width: `${worldWidth}px`, 
          height: '100vh',
          transform: `translateX(-${cameraX}px)`
        }}
      >
        <SpaceBackground width={worldWidth} height={window.innerHeight} />
        
        <UpdraftZone 
          worldX={gameState.position.x}
          cameraX={cameraX}
          zones={updraftZones}
        />
        
        <LevelGoal 
          worldX={gameState.position.x}
          goalX={goalX}
          cameraX={cameraX}
        />
        
        <Obstacles 
          obstacles={obstacles}
          cameraX={cameraX}
        />
        
        <Collectibles 
          collectibles={collectibles}
          cameraX={cameraX}
        />
        
        <PowerUps 
          powerUps={powerUps}
          cameraX={cameraX}
        />
        
        <ParticleSystem 
          particles={particles}
          cameraX={cameraX}
        />
        
        <DoctorCharacter 
          x={gameState.position.x} 
          y={gameState.position.y}
          velocity={Math.sqrt(gameState.velocity.x ** 2 + gameState.velocity.y ** 2)}
          forwardSpeed={gameState.speed + (gameState.boostActive ? 2 : 0)}
          rotation={gameState.velocity.x * 2}
          stalled={false}
          keys={gameState.keys}
          invulnerable={gameState.invulnerable}
          shieldActive={gameState.shieldActive}
          boostActive={gameState.boostActive}
        />
      </div>
      
      {/* UI Overlays */}
      <GameControls 
        gameStarted={gameState.gameStarted}
        gameOver={gameState.gameOver}
        levelComplete={gameState.levelComplete}
        distance={gameState.distance}
        score={gameState.score}
        lives={gameState.lives}
        level={gameState.level}
        boostCooldown={gameState.boostCooldown}
        shieldActive={gameState.shieldActive}
        magnetActive={gameState.magnetActive}
        doubleScoreActive={gameState.doubleScoreActive}
        onStart={startGame}
        onReset={resetGame}
      />
      
      <VirtualJoystick 
        onDirectionChange={handleJoystickDirection}
        onBoost={handleJoystickBoost}
      />
      
      <SoundManager enabled={soundEnabled} />
    </div>
  );
};