export interface BiomeEffect {
  name: string;
  windModifier: number;
  turbulenceModifier: number;
  gravityModifier: number;
  backgroundImage: string;
  backgroundOpacity: number;
  specialEffects: {
    updrafts?: Array<{ x: number; strength: number; width: number }>;
    downdrafts?: Array<{ x: number; strength: number; width: number }>;
    thermals?: Array<{ x: number; y: number; strength: number; radius: number }>;
  };
}

import pixelOcean from '@/assets/pixel-ocean.webp';
import pixelForest from '@/assets/pixel-forest.webp';
import pixelMountains from '@/assets/pixel-mountains.webp';
import pixelCity from '@/assets/pixel-city.webp';

export const BIOMES: Record<string, BiomeEffect> = {
  ocean: {
    name: 'Ocean',
    windModifier: 1.2,
    turbulenceModifier: 0.8,
    gravityModifier: 0.95, // Slight updraft from water
    backgroundImage: pixelOcean,
    backgroundOpacity: 0.7,
    specialEffects: {
      updrafts: [
        { x: 2000, strength: 0.3, width: 200 },
        { x: 4500, strength: 0.4, width: 150 },
        { x: 7000, strength: 0.5, width: 300 }
      ]
    }
  },
  forest: {
    name: 'Forest',
    windModifier: 0.7,
    turbulenceModifier: 1.5,
    gravityModifier: 1.0,
    backgroundImage: pixelForest,
    backgroundOpacity: 0.8,
    specialEffects: {
      thermals: [
        { x: 1500, y: 400, strength: 0.2, radius: 100 },
        { x: 3500, y: 300, strength: 0.3, radius: 120 },
        { x: 6000, y: 350, strength: 0.25, radius: 80 }
      ]
    }
  },
  mountains: {
    name: 'Mountains',
    windModifier: 1.8,
    turbulenceModifier: 2.0,
    gravityModifier: 1.1,
    backgroundImage: pixelMountains,
    backgroundOpacity: 0.8,
    specialEffects: {
      updrafts: [
        { x: 1000, strength: 0.6, width: 100 },
        { x: 3000, strength: 0.8, width: 80 }
      ],
      downdrafts: [
        { x: 2000, strength: -0.4, width: 150 },
        { x: 5000, strength: -0.6, width: 200 },
        { x: 8000, strength: -0.5, width: 120 }
      ]
    }
  },
  city: {
    name: 'City',
    windModifier: 1.1,
    turbulenceModifier: 1.3,
    gravityModifier: 1.05,
    backgroundImage: pixelCity,
    backgroundOpacity: 0.9,
    specialEffects: {
      thermals: [
        { x: 2500, y: 450, strength: 0.4, radius: 150 },
        { x: 5500, y: 400, strength: 0.5, radius: 180 },
        { x: 8500, y: 420, strength: 0.45, radius: 160 }
      ]
    }
  }
};

export const getBiomeFromDistance = (distance: number): BiomeEffect => {
  if (distance < 2500) return BIOMES.ocean;
  if (distance < 5000) return BIOMES.forest;
  if (distance < 7500) return BIOMES.mountains;
  return BIOMES.city;
};

export const calculateBiomeEffects = (
  position: { x: number; y: number },
  biome: BiomeEffect
): { wind: { x: number; y: number }; gravity: number; thermal: number } => {
  let thermalEffect = 0;
  let windEffect = { x: 0, y: 0 };
  
  // Calculate thermal effects
  if (biome.specialEffects.thermals) {
    biome.specialEffects.thermals.forEach(thermal => {
      const distance = Math.sqrt(
        Math.pow(position.x - thermal.x, 2) + Math.pow(position.y - thermal.y, 2)
      );
      if (distance < thermal.radius) {
        const strength = (1 - distance / thermal.radius) * thermal.strength;
        thermalEffect += strength;
      }
    });
  }
  
  // Calculate updraft/downdraft effects
  if (biome.specialEffects.updrafts) {
    biome.specialEffects.updrafts.forEach(updraft => {
      const distance = Math.abs(position.x - updraft.x);
      if (distance < updraft.width) {
        const strength = (1 - distance / updraft.width) * updraft.strength;
        windEffect.y -= strength;
      }
    });
  }
  
  if (biome.specialEffects.downdrafts) {
    biome.specialEffects.downdrafts.forEach(downdraft => {
      const distance = Math.abs(position.x - downdraft.x);
      if (distance < downdraft.width) {
        const strength = (1 - distance / downdraft.width) * Math.abs(downdraft.strength);
        windEffect.y += strength;
      }
    });
  }
  
  return {
    wind: windEffect,
    gravity: biome.gravityModifier,
    thermal: thermalEffect
  };
};