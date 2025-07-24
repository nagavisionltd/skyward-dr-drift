import { useState, useEffect } from 'react';

interface DoctorCharacterProps {
  x: number;
  y: number;
  velocity: number;
  forwardSpeed: number;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

export const DoctorCharacter = ({ x, y, keys }: DoctorCharacterProps) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  
  useEffect(() => {
    const isMoving = keys.up || keys.down || keys.left || keys.right;
    
    if (!isMoving) {
      setAnimationFrame(0);
      return;
    }
    
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 5);
    }, 200);
    
    return () => clearInterval(interval);
  }, [keys.up, keys.down, keys.left, keys.right]);

  const getCharacterSprite = () => {
    const sprites = [
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
      className="absolute z-10"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <img
        src={getCharacterSprite()}
        alt="Flying Doctor"
        className="w-12 h-16"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};