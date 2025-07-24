import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
}

interface Planet {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rings?: boolean;
}

interface SpaceBackgroundProps {
  width: number;
  height: number;
}

export const SpaceBackground = ({ width, height }: SpaceBackgroundProps) => {
  const { stars, planets } = useMemo(() => {
    const starCount = Math.floor((width * height) / 8000); // Density-based star count
    const planetCount = Math.floor(width / 800); // About 1 planet per 800px

    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleDelay: Math.random() * 3
      });
    }

    const planetColors = [
      '#ff6b6b', // Red planet
      '#4ecdc4', // Cyan planet  
      '#45b7d1', // Blue planet
      '#f9ca24', // Yellow planet
      '#6c5ce7', // Purple planet
      '#fd79a8', // Pink planet
      '#00b894', // Green planet
      '#fdcb6e'  // Orange planet
    ];

    const planets: Planet[] = [];
    for (let i = 0; i < planetCount; i++) {
      const size = Math.random() * 80 + 30;
      planets.push({
        id: i,
        x: Math.random() * (width - size),
        y: Math.random() * (height - size),
        size,
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        rings: Math.random() > 0.7 // 30% chance of rings
      });
    }

    return { stars, planets };
  }, [width, height]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}px`,
            top: `${star.y}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.twinkleDelay}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,${star.opacity * 0.5})`
          }}
        />
      ))}

      {/* Planets */}
      {planets.map((planet) => (
        <div
          key={`planet-${planet.id}`}
          className="absolute rounded-full"
          style={{
            left: `${planet.x}px`,
            top: `${planet.y}px`,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            backgroundColor: planet.color,
            boxShadow: `inset -${planet.size * 0.2}px -${planet.size * 0.2}px ${planet.size * 0.3}px rgba(0,0,0,0.3)`
          }}
        >
          {planet.rings && (
            <div
              className="absolute rounded-full border-2 border-opacity-60"
              style={{
                left: '50%',
                top: '50%',
                width: `${planet.size * 1.8}px`,
                height: `${planet.size * 0.3}px`,
                transform: 'translate(-50%, -50%) rotateX(75deg)',
                borderColor: planet.color,
                filter: 'brightness(0.7)'
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};