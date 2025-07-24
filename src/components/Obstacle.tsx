interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'tree' | 'building';
  cameraX: number;
}

export const Obstacle = ({ x, y, width, height, type, cameraX }: ObstacleProps) => {
  const screenX = x - cameraX;
  const isVisible = screenX > -width && screenX < window.innerWidth + width;

  if (!isVisible) return null;

  const getObstacleStyle = () => {
    switch (type) {
      case 'rock':
        return 'bg-gradient-to-b from-gray-400 to-gray-600 rounded-full';
      case 'tree':
        return 'bg-gradient-to-b from-green-400 to-green-700 rounded-t-full';
      case 'building':
        return 'bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-md';
      default:
        return 'bg-gradient-to-b from-gray-400 to-gray-600 rounded-full';
    }
  };

  const getObstacleIcon = () => {
    switch (type) {
      case 'rock': return '🪨';
      case 'tree': return '🌲';
      case 'building': return '🏢';
      default: return '🪨';
    }
  };

  return (
    <div
      className={`absolute z-5 ${getObstacleStyle()} border-2 border-black/20 shadow-lg flex items-center justify-center`}
      style={{
        left: `${screenX}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <span className="text-2xl opacity-80">{getObstacleIcon()}</span>
    </div>
  );
};