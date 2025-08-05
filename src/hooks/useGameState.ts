import { useState, useCallback } from 'react';

export interface GlowingOrbData {
  id: string;
  x: number;
  y: number;
  color: string;
  points: number;
  collected: boolean;
}

export interface GameStateData {
  score: number;
  lives: number;
  distance: number;
  orbs: GlowingOrbData[];
  gameOver: boolean;
  levelComplete: boolean;
  currentLevel: number;
  totalLevels: number;
}

const generateOrbs = (): GlowingOrbData[] => {
  const orbs: GlowingOrbData[] = [];
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#FF6B6B', '#4ECDC4'];
  const rarityWeights = [40, 30, 20, 15, 10, 8, 5, 3]; // Common to legendary
  const pointValues = [10, 15, 25, 35, 50, 75, 100, 150];
  
  for (let i = 0; i < 40; i++) {
    // Weighted random color selection
    const rand = Math.random() * 100;
    let colorIndex = 0;
    let accumulator = 0;
    
    for (let j = 0; j < rarityWeights.length; j++) {
      accumulator += rarityWeights[j];
      if (rand <= accumulator) {
        colorIndex = j;
        break;
      }
    }
    
    orbs.push({
      id: `orb-${i}`,
      x: Math.random() * 9000 + 500,
      y: Math.random() * (window.innerHeight - 200) + 100,
      color: colors[colorIndex],
      points: pointValues[colorIndex],
      collected: false,
    });
  }
  
  return orbs;
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameStateData>({
    score: 0,
    lives: 3,
    distance: 0,
    orbs: [],
    gameOver: false,
    levelComplete: false,
    currentLevel: 1,
    totalLevels: 3,
  });

  const collectOrb = useCallback((orbId: string) => {
    setGameState(prev => {
      const orb = prev.orbs.find(o => o.id === orbId);
      if (!orb || orb.collected) return prev;

      return {
        ...prev,
        score: prev.score + orb.points,
        orbs: prev.orbs.map(o =>
          o.id === orbId ? { ...o, collected: true } : o
        ),
      };
    });
  }, []);

  const checkCollisions = useCallback((playerX: number, playerY: number) => {
    // Collision logic is now handled in GlowingOrb component
    // This function kept for future obstacle implementation
    return;
  }, []);

  const updateDistance = useCallback((playerX: number) => {
    setGameState(prev => ({
      ...prev,
      distance: Math.max(prev.distance, playerX),
      levelComplete: playerX >= 9500,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      score: prev.score, // Keep score across levels
      lives: 3,
      distance: 0,
      orbs: [],
      gameOver: false,
      levelComplete: false,
      currentLevel: prev.currentLevel,
      totalLevels: prev.totalLevels,
    }));
  }, []);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
      distance: 0,
      orbs: [],
      levelComplete: false,
    }));
  }, []);

  const resetToLevel1 = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      distance: 0,
      orbs: [],
      gameOver: false,
      levelComplete: false,
      currentLevel: 1,
      totalLevels: 3,
    });
  }, []);

  return {
    gameState,
    collectOrb,
    checkCollisions,
    updateDistance,
    resetGame,
    nextLevel,
    resetToLevel1,
  };
};