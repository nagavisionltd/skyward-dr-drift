interface CollectibleProps {
  x: number;
  y: number;
  type: 'bandage' | 'pill' | 'syringe';
  collected: boolean;
  onCollect: () => void;
  cameraX: number;
}

export const Collectible = ({ x, y, type, collected, onCollect, cameraX }: CollectibleProps) => {
  const screenX = x - cameraX;
  const isVisible = screenX > -50 && screenX < window.innerWidth + 50;

  if (collected || !isVisible) return null;

  const getCollectibleIcon = () => {
    switch (type) {
      case 'bandage': return '🩹';
      case 'pill': return '💊';
      case 'syringe': return '💉';
      default: return '🩹';
    }
  };

  const getCollectibleValue = () => {
    switch (type) {
      case 'bandage': return 10;
      case 'pill': return 25;
      case 'syringe': return 50;
      default: return 10;
    }
  };

  return (
    <div
      className="absolute z-10 flex flex-col items-center animate-bounce cursor-pointer"
      style={{
        left: `${screenX}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onCollect}
    >
      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full border-2 border-primary/50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
        <span className="text-lg">{getCollectibleIcon()}</span>
      </div>
      <div className="absolute -bottom-6 text-xs text-primary font-bold">
        +{getCollectibleValue()}
      </div>
    </div>
  );
};