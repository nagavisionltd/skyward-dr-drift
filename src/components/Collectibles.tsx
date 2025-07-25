interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'gem' | 'star' | 'health';
  value: number;
  collected: boolean;
}

interface CollectiblesProps {
  collectibles: Collectible[];
  cameraX: number;
}

export const Collectibles = ({ collectibles, cameraX }: CollectiblesProps) => {
  const getCollectibleStyle = (collectible: Collectible) => {
    const baseStyles = {
      position: 'absolute' as const,
      left: `${collectible.x - cameraX}px`,
      top: `${collectible.y}px`,
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      zIndex: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      animation: 'float 3s ease-in-out infinite, spin 4s linear infinite',
    };

    switch (collectible.type) {
      case 'coin':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #FFD700, #FFA500, #FF8C00)',
          border: '2px solid #FFD700',
          boxShadow: '0 0 10px rgba(255,215,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.2)',
        };
      case 'gem':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #9C27B0, #673AB7, #3F51B5)',
          border: '2px solid #E91E63',
          boxShadow: '0 0 15px rgba(156,39,176,0.8), inset -2px -2px 4px rgba(0,0,0,0.3)',
          transform: 'rotate(45deg)',
        };
      case 'star':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #FFEB3B, #FFC107, #FF9800)',
          border: '2px solid #FFEB3B',
          boxShadow: '0 0 20px rgba(255,235,59,0.9), inset -2px -2px 4px rgba(0,0,0,0.2)',
          animation: 'float 2s ease-in-out infinite, sparkle 1.5s ease-in-out infinite',
        };
      case 'health':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle at 30% 30%, #F44336, #E91E63, #9C27B0)',
          border: '2px solid #F44336',
          boxShadow: '0 0 12px rgba(244,67,54,0.7), inset -2px -2px 4px rgba(0,0,0,0.2)',
          animation: 'float 2.5s ease-in-out infinite, pulse 2s ease-in-out infinite',
        };
      default:
        return baseStyles;
    }
  };

  const getCollectibleIcon = (type: Collectible['type']) => {
    switch (type) {
      case 'coin': return '🪙';
      case 'gem': return '💎';
      case 'star': return '⭐';
      case 'health': return '❤️';
      default: return '●';
    }
  };

  const getCollectibleEffect = (collectible: Collectible) => {
    if (collectible.type === 'star') {
      return (
        <div className="absolute inset-0 animate-ping">
          <div className="w-full h-full bg-yellow-400 rounded-full opacity-20"></div>
        </div>
      );
    }
    if (collectible.type === 'gem') {
      return (
        <div className="absolute inset-0">
          <div className="w-full h-full bg-purple-400 rounded-full opacity-30 animate-pulse"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {collectibles
        .filter(collectible => !collectible.collected)
        .map(collectible => {
          const screenX = collectible.x - cameraX;
          const isVisible = screenX > -50 && screenX < window.innerWidth + 50;
          
          if (!isVisible) return null;

          return (
            <div key={collectible.id}>
              {/* Background effect */}
              {getCollectibleEffect(collectible)}
              
              {/* Main collectible */}
              <div style={getCollectibleStyle(collectible)}>
                <span style={{ 
                  transform: collectible.type === 'gem' ? 'rotate(-45deg)' : 'none',
                  filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.5))'
                }}>
                  {getCollectibleIcon(collectible.type)}
                </span>
              </div>

              {/* Value indicator for high-value items */}
              {collectible.value >= 50 && (
                <div 
                  className="absolute text-xs font-bold text-yellow-300 animate-bounce"
                  style={{
                    left: `${collectible.x - cameraX + 20}px`,
                    top: `${collectible.y - 10}px`,
                    zIndex: 9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  +{collectible.value}
                </div>
              )}
            </div>
          );
        })
      }
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255,235,59,0.9), inset -2px -2px 4px rgba(0,0,0,0.2);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255,235,59,1), inset -2px -2px 4px rgba(0,0,0,0.2);
            transform: scale(1.1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
};