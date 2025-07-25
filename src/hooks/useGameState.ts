import { useState, useCallback } from 'react';

export interface CollectibleData {
  id: string;
  x: number;
  y: number;
  type: 'bandage' | 'pill' | 'syringe';
  collected: boolean;
}

export interface ObstacleData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'tree' | 'building';
}

export interface GameStateData {
  score: number;
  lives: number;
  distance: number;
  collectibles: CollectibleData[];
  obstacles: ObstacleData[];
  gameOver: boolean;
  levelComplete: boolean;
}

const generateCollectibles = (): CollectibleData[] => {
  const collectibles: CollectibleData[] = [];
  const types: ('bandage' | 'pill' | 'syringe')[] = ['bandage', 'pill', 'syringe'];
  
  for (let i = 0; i < 50; i++) {
    collectibles.push({
      id: `collectible-${i}`,
      x: Math.random() * 9500 + 250, // Spread across the world
      y: Math.random() * (window.innerHeight - 200) + 100,
      type: types[Math.floor(Math.random() * types.length)],
      collected: false,
    });
  }
  
  return collectibles;
};

const generateObstacles = (): ObstacleData[] => {
  const obstacles: ObstacleData[] = [];
  const types: ('rock' | 'tree' | 'building')[] = ['rock', 'tree', 'building'];
  
  for (let i = 0; i < 30; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    let width, height;
    
    switch (type) {
      case 'rock':
        width = 40 + Math.random() * 30;
        height = 40 + Math.random() * 30;
        break;
      case 'tree':
        width = 30 + Math.random() * 20;
        height = 60 + Math.random() * 40;
        break;
      case 'building':
        width = 50 + Math.random() * 50;
        height = 80 + Math.random() * 60;
        break;
    }
    
    obstacles.push({
      id: `obstacle-${i}`,
      x: Math.random() * 9000 + 500,
      y: Math.random() * (window.innerHeight - height - 100) + 50,
      width,
      height,
      type,
    });
  }
  
  return obstacles;
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameStateData>({
    score: 0,
    lives: 3,
    distance: 0,
    collectibles: generateCollectibles(),
    obstacles: generateObstacles(),
    gameOver: false,
    levelComplete: false,
  });

  const collectItem = useCallback((collectibleId: string) => {
    setGameState(prev => {
      const collectible = prev.collectibles.find(c => c.id === collectibleId);
      if (!collectible || collectible.collected) return prev;

      const points = collectible.type === 'bandage' ? 10 : 
                    collectible.type === 'pill' ? 25 : 50;

      return {
        ...prev,
        score: prev.score + points,
        collectibles: prev.collectibles.map(c =>
          c.id === collectibleId ? { ...c, collected: true } : c
        ),
      };
    });
  }, []);

  const checkCollisions = useCallback((playerX: number, playerY: number) => {
    setGameState(prev => {
      // Check obstacle collisions
      const playerSize = 50; // Approximate player size
      const hitObstacle = prev.obstacles.some(obstacle => 
        playerX + playerSize > obstacle.x &&
        playerX < obstacle.x + obstacle.width &&
        playerY + playerSize > obstacle.y &&
        playerY < obstacle.y + obstacle.height
      );

      if (hitObstacle && prev.lives > 0) {
        const newLives = prev.lives - 1;
        return {
          ...prev,
          lives: newLives,
          gameOver: newLives === 0,
        };
      }

      return prev;
    });
  }, []);

  const updateDistance = useCallback((playerX: number) => {
    setGameState(prev => ({
      ...prev,
      distance: Math.max(prev.distance, playerX),
      levelComplete: playerX >= 9500,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      distance: 0,
      collectibles: generateCollectibles(),
      obstacles: generateObstacles(),
      gameOver: false,
      levelComplete: false,
    });
  }, []);

  return {
    gameState,
    collectItem,
    checkCollisions,
    updateDistance,
    resetGame,
  };
};