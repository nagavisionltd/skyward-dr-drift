import { useState, useEffect } from 'react';

interface DoctorCharacterProps {
  x: number;
  y: number;
  velocity: number;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

export const DoctorCharacter = ({ x, y, velocity, keys }: DoctorCharacterProps) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  
  // Animation cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 6);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Determine rotation based on velocity and movement
  const getRotation = () => {
    let rotation = 0;
    if (velocity < -2) rotation = -15; // Flying up
    else if (velocity > 2) rotation = 15; // Flying down
    
    if (keys.left) rotation -= 5;
    if (keys.right) rotation += 5;
    
    return rotation;
  };

  // Character sprites using the uploaded images
  const getCharacterSprite = () => {
    const sprites = [
      '/lovable-uploads/38f5e5c7-aac2-45f8-bcae-642e0c5ca239.png',
      '/lovable-uploads/6ccfd2c3-9961-48ae-bdc2-fad6619a6af3.png',
      '/lovable-uploads/77cce5c4-74e2-4f1b-91a5-a82152dc2b3d.png',
      '/lovable-uploads/c3a3637e-efb0-4a03-9498-43a510244199.png',
      '/lovable-uploads/db63a21f-5a7f-4592-962d-f1cd45943f0f.png',
      '/lovable-uploads/dd3a3a22-d446-4fc2-b490-ccc05800b1d8.png',
    ];
    return sprites[animationFrame];
  };

  return (
    <div 
      className="absolute z-10 transition-transform duration-75"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `rotate(${getRotation()}deg)`,
      }}
    >
      <img
        src={getCharacterSprite()}
        alt="Flying Doctor"
        className="w-12 h-16 pixelated drop-shadow-lg"
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
        }}
      />
    </div>
  );
};