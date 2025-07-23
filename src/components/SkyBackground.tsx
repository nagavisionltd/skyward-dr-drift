import { useMemo } from 'react';

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
    return {
      background: `linear-gradient(to bottom, 
        rgb(135, 206, 250), 
        rgb(147, 197, 253), 
        rgb(224, 242, 254))`
    };
  };


  const getCloudOpacity = () => {
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
      {/* Basic blue sky gradient background */}
      <div className="absolute inset-0" style={getSkyStyles()} />
      
      {/* Parallax cloud layers */}
      <div className="absolute inset-0">
        {backgroundObjects.map(cloud => (
          <CloudElement key={cloud.id} cloud={cloud} />
        ))}
      </div>
    </div>
  );
};