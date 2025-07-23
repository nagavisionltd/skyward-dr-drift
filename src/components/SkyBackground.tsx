import { useMemo } from 'react';

interface SkyBackgroundProps {
  distance: number;
}

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: number;
}

export const SkyBackground = ({ distance }: SkyBackgroundProps) => {
  // Generate clouds for parallax effect
  const clouds = useMemo(() => {
    const cloudArray: Cloud[] = [];
    
    // Background layer clouds (slower, smaller)
    for (let i = 0; i < 8; i++) {
      cloudArray.push({
        id: i,
        x: (i * 300) % 1200,
        y: 50 + Math.random() * 200,
        size: 60 + Math.random() * 40,
        speed: 0.3,
        layer: 1
      });
    }
    
    // Middle layer clouds
    for (let i = 8; i < 16; i++) {
      cloudArray.push({
        id: i,
        x: (i * 250) % 1200,
        y: 100 + Math.random() * 300,
        size: 80 + Math.random() * 60,
        speed: 0.6,
        layer: 2
      });
    }
    
    // Foreground layer clouds (faster, larger)
    for (let i = 16; i < 24; i++) {
      cloudArray.push({
        id: i,
        x: (i * 400) % 1600,
        y: 200 + Math.random() * 200,
        size: 100 + Math.random() * 80,
        speed: 1.0,
        layer: 3
      });
    }
    
    return cloudArray;
  }, []);

  const CloudElement = ({ cloud }: { cloud: Cloud }) => {
    const offset = (distance * cloud.speed) % 1600;
    const opacity = cloud.layer === 1 ? 0.4 : cloud.layer === 2 ? 0.6 : 0.8;
    
    return (
      <div
        key={cloud.id}
        className="absolute rounded-full bg-gradient-cloud animate-float"
        style={{
          left: `${cloud.x - offset}px`,
          top: `${cloud.y}px`,
          width: `${cloud.size}px`,
          height: `${cloud.size * 0.6}px`,
          opacity,
          animationDelay: `${cloud.id * 0.2}s`,
          filter: cloud.layer === 1 ? 'blur(1px)' : 'none'
        }}
      >
        {/* Cloud details */}
        <div className="absolute inset-0 rounded-full bg-cloud-white/80" />
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
      </div>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-gradient-sky" />
      
      {/* Background image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url("/lovable-uploads/38f5e5c7-aac2-45f8-bcae-642e0c5ca239.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateX(${-(distance * 0.2) % 100}px)`
        }}
      />
      
      {/* Parallax cloud layers */}
      <div className="absolute inset-0">
        {clouds.map(cloud => (
          <CloudElement key={cloud.id} cloud={cloud} />
        ))}
      </div>
      
      {/* Additional atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sky-light/20" />
    </div>
  );
};