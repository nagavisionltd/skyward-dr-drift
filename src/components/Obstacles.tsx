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

interface ObstaclesProps {
  obstacles: Obstacle[];
  cameraX: number;
}

export const Obstacles = ({ obstacles, cameraX }: ObstaclesProps) => {
  const getObstacleStyle = (obstacle: Obstacle) => {
    const baseStyles = {
      position: 'absolute' as const,
      left: `${obstacle.x - cameraX}px`,
      top: `${obstacle.y}px`,
      width: `${obstacle.width}px`,
      height: `${obstacle.height}px`,
      transform: `rotate(${obstacle.rotation}deg)`,
      borderRadius: '50%',
      zIndex: 5,
    };

    switch (obstacle.type) {
      case 'asteroid':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #8B4513, #654321, #3E2723)',
          border: '2px solid #5D4037',
          boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.5), 0 0 10px rgba(139,69,19,0.3)',
        };
      case 'meteor':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 20% 20%, #FF6B35, #FF4500, #8B0000)',
          border: '2px solid #FF0000',
          boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.4), 0 0 15px rgba(255,69,0,0.6)',
          animation: 'glow 2s ease-in-out infinite alternate',
        };
      case 'debris':
        return {
          ...baseStyles,
          background: 'linear-gradient(45deg, #424242, #616161, #757575)',
          border: '1px solid #9E9E9E',
          borderRadius: '20%',
          boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.6), 0 0 8px rgba(66,66,66,0.4)',
        };
      case 'satellite':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #37474F, #546E7A, #607D8B)',
          border: '2px solid #78909C',
          borderRadius: '10%',
          boxShadow: 'inset -4px -4px 8px rgba(0,0,0,0.5), 0 0 12px rgba(55,71,79,0.5)',
        };
      default:
        return baseStyles;
    }
  };

  const getObstacleIcon = (type: Obstacle['type']) => {
    switch (type) {
      case 'asteroid': return '🪨';
      case 'meteor': return '☄️';
      case 'debris': return '🔩';
      case 'satellite': return '🛰️';
      default: return '⚫';
    }
  };

  return (
    <>
      {obstacles.map(obstacle => {
        const screenX = obstacle.x - cameraX;
        const isVisible = screenX > -obstacle.width && screenX < window.innerWidth + obstacle.width;
        
        if (!isVisible) return null;

        return (
          <div
            key={obstacle.id}
            style={getObstacleStyle(obstacle)}
          >
            <div 
              className="w-full h-full flex items-center justify-center text-lg"
              style={{ 
                filter: obstacle.type === 'meteor' ? 'drop-shadow(0 0 5px #FF4500)' : 'none',
                transform: `rotate(-${obstacle.rotation}deg)` // Counter-rotate the icon
              }}
            >
              {getObstacleIcon(obstacle.type)}
            </div>
            
            {/* Danger warning for meteors */}
            {obstacle.type === 'meteor' && (
              <div 
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-red-400 text-xs font-bold animate-pulse"
                style={{ transform: `translateX(-50%) rotate(-${obstacle.rotation}deg)` }}
              >
                ⚠️
              </div>
            )}
          </div>
        );
      })}
      
      <style>{`
        @keyframes glow {
          from { 
            box-shadow: inset -3px -3px 8px rgba(0,0,0,0.4), 0 0 15px rgba(255,69,0,0.6);
          }
          to { 
            box-shadow: inset -3px -3px 8px rgba(0,0,0,0.4), 0 0 25px rgba(255,69,0,0.9);
          }
        }
      `}</style>
    </>
  );
};