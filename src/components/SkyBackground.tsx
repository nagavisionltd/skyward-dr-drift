import { useMemo } from 'react';
import pixelForest from '@/assets/pixel-forest.webp';
import pixelOcean from '@/assets/pixel-ocean.webp';
import pixelCity from '@/assets/pixel-city.webp';
import pixelMountains from '@/assets/pixel-mountains.webp';

interface SkyBackgroundProps {
  distance: number;
  forwardSpeed?: number;
}

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: number;
}

export const SkyBackground = ({ distance, forwardSpeed = 2 }: SkyBackgroundProps) => {
  // Calculate time of day based on distance with smooth transitions
  const timeProgress = (distance / 1000) % 4; // 4 phases: day, sunset, night, sunrise
  
  const getSkyStyles = () => {
    const phase = Math.floor(timeProgress) % 4; // Ensure phase is always 0-3
    const transition = timeProgress - Math.floor(timeProgress);
    
    // Define sky colors for each phase
    const skyPhases = {
      0: { // Day
        top: "rgb(135, 206, 250)", // sky-400
        middle: "rgb(147, 197, 253)", // sky-300  
        bottom: "rgb(224, 242, 254)" // sky-100
      },
      1: { // Sunset
        top: "rgb(249, 115, 22)", // orange-500
        middle: "rgb(251, 146, 60)", // pink-400 equivalent
        bottom: "rgb(254, 215, 170)" // orange-200
      },
      2: { // Night
        top: "rgb(49, 46, 129)", // indigo-900
        middle: "rgb(88, 28, 135)", // purple-900
        bottom: "rgb(30, 58, 138)" // blue-900
      },
      3: { // Sunrise
        top: "rgb(252, 165, 165)", // pink-300
        middle: "rgb(253, 186, 116)", // orange-300
        bottom: "rgb(254, 240, 138)" // yellow-200
      }
    };
    
    const currentPhase = skyPhases[phase as keyof typeof skyPhases];
    const nextPhase = skyPhases[((phase + 1) % 4) as keyof typeof skyPhases];
    
    // Safety check to ensure phases exist
    if (!currentPhase || !nextPhase) {
      return {
        background: `linear-gradient(to bottom, 
          rgb(135, 206, 250), 
          rgb(147, 197, 253), 
          rgb(224, 242, 254))`
      };
    }
    
    // Interpolate between current and next phase
    const interpolateColor = (color1: string, color2: string, factor: number) => {
      const rgb1 = color1.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const rgb2 = color2.match(/\d+/g)?.map(Number) || [0, 0, 0];
      
      const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * factor);
      const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * factor);
      const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * factor);
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    return {
      background: `linear-gradient(to bottom, 
        ${interpolateColor(currentPhase.top, nextPhase.top, transition)}, 
        ${interpolateColor(currentPhase.middle, nextPhase.middle, transition)}, 
        ${interpolateColor(currentPhase.bottom, nextPhase.bottom, transition)})`
    };
  };

  const getCurrentBiome = () => {
    // Change biome every 2500 units of distance
    const biomeIndex = Math.floor(distance / 2500) % 4;
    const biomes = [
      { name: 'forest', bg: pixelForest || '', opacity: 0.8 },
      { name: 'ocean', bg: pixelOcean || '', opacity: 0.7 },
      { name: 'city', bg: pixelCity || '', opacity: 0.9 },
      { name: 'mountains', bg: pixelMountains || '', opacity: 0.8 }
    ];
    
    const selectedBiome = biomes[biomeIndex];
    // Fallback to first biome if selection fails
    return selectedBiome || biomes[0];
  };

  const getCloudOpacity = () => {
    // Reduce cloud visibility at night with smooth transition
    if (timeProgress >= 1.5 && timeProgress < 2.5) {
      return 0.3; // Night
    } else if (timeProgress >= 1.2 && timeProgress < 1.8) {
      // Transition to night
      const factor = (timeProgress - 1.2) / 0.6;
      return 0.8 - (0.5 * factor);
    } else if (timeProgress >= 2.2 && timeProgress < 2.8) {
      // Transition from night
      const factor = (timeProgress - 2.2) / 0.6;
      return 0.3 + (0.5 * factor);
    }
    return 0.8;
  };
  // Generate clouds and background objects for parallax effect
  const backgroundObjects = useMemo(() => {
    const objectArray: Cloud[] = [];
    
    // Background layer clouds (slower, smaller)
    for (let i = 0; i < 12; i++) {
      objectArray.push({
        id: i,
        x: (i * 300) % 1200,
        y: 50 + Math.random() * 200,
        size: 60 + Math.random() * 40,
        speed: 0.3,
        layer: 1
      });
    }
    
    // Middle layer clouds
    for (let i = 12; i < 24; i++) {
      objectArray.push({
        id: i,
        x: (i * 250) % 1200,
        y: 100 + Math.random() * 300,
        size: 80 + Math.random() * 60,
        speed: 0.6,
        layer: 2
      });
    }
    
    // Foreground layer clouds (faster, larger)
    for (let i = 24; i < 36; i++) {
      objectArray.push({
        id: i,
        x: (i * 400) % 1600,
        y: 200 + Math.random() * 200,
        size: 100 + Math.random() * 80,
        speed: 1.0,
        layer: 3
      });
    }
    
    return objectArray;
  }, []);

  const CloudElement = ({ cloud }: { cloud: Cloud }) => {
    const offset = (distance * cloud.speed) % 1600;
    const baseOpacity = cloud.layer === 1 ? 0.4 : cloud.layer === 2 ? 0.6 : 0.8;
    const opacity = baseOpacity * getCloudOpacity();
    
    // Enhanced motion blur with horizontal streaking
    const speedFactor = Math.min(forwardSpeed / 10, 1);
    const blurAmount = speedFactor * cloud.speed * 1.2;
    const horizontalStreak = speedFactor * 3; // Horizontal streaking effect
    
    // Parallax speeds: background slower, foreground faster
    const parallaxMultiplier = cloud.layer === 1 ? 0.2 : cloud.layer === 2 ? 0.5 : 1.0;
    
    return (
      <div
        key={cloud.id}
        className="absolute rounded-full bg-gradient-cloud animate-float"
        style={{
          left: `${cloud.x - (offset * parallaxMultiplier)}px`,
          top: `${cloud.y}px`,
          width: `${cloud.size + horizontalStreak}px`, // Horizontal stretching for motion blur
          height: `${cloud.size * 0.6}px`,
          opacity,
          animationDelay: `${cloud.id * 0.2}s`,
          filter: `blur(${cloud.layer === 1 ? 2 + blurAmount : cloud.layer === 2 ? 1 + blurAmount : blurAmount}px)`,
          transform: `scaleX(${1 + horizontalStreak * 0.1})`, // Additional horizontal stretching
          transition: 'filter 0.3s ease, transform 0.3s ease'
        }}
      >
        {/* Cloud details with reduced detail for background layers */}
        <div 
          className="absolute inset-0 rounded-full bg-cloud-white/80" 
          style={{
            filter: cloud.layer === 1 ? 'blur(1px)' : 'none' // Reduced detail for background
          }}
        />
        {cloud.layer > 1 && (
          <>
            <div 
              className="absolute rounded-full bg-cloud-white"
              style={{
                width: '60%',
                height: '70%',
                left: '10%',
                top: '15%'
              }}
            />
            <div 
              className="absolute rounded-full bg-cloud-white"
              style={{
                width: '50%',
                height: '60%',
                right: '15%',
                top: '20%'
              }}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dynamic sky gradient background */}
      <div className="absolute inset-0" style={getSkyStyles()} />
      
      {/* Dynamic pixel art biome backgrounds */}
      {(() => {
        const currentBiome = getCurrentBiome();
        // Limit transform to prevent disappearing at high speeds
        const parallaxOffset = Math.min((distance * 0.3) % 100, 50);
        
        return (
          <div 
            className="absolute inset-0 pixel-art"
            style={{
              backgroundImage: `url(${currentBiome.bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'repeat-x',
              opacity: currentBiome.opacity,
              transform: `translateX(${-parallaxOffset}px)`,
              imageRendering: 'pixelated',
              transition: 'opacity 2s ease-in-out'
            }}
          />
        );
      })()}
      
      {/* Parallax cloud layers */}
      <div className="absolute inset-0">
        {backgroundObjects.map(cloud => (
          <CloudElement key={cloud.id} cloud={cloud} />
        ))}
      </div>
      
      {/* Additional atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sky-light/20" />
    </div>
  );
};