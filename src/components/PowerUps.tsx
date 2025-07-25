interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'boost' | 'shield' | 'magnet' | 'double_score' | 'extra_life';
  duration: number;
  collected: boolean;
}

interface PowerUpsProps {
  powerUps: PowerUp[];
  cameraX: number;
}

export const PowerUps = ({ powerUps, cameraX }: PowerUpsProps) => {
  const getPowerUpStyle = (powerUp: PowerUp) => {
    const baseStyles = {
      position: 'absolute' as const,
      left: `${powerUp.x - cameraX}px`,
      top: `${powerUp.y}px`,
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      zIndex: 7,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      animation: 'powerUpFloat 2s ease-in-out infinite, powerUpGlow 2s ease-in-out infinite alternate',
    };

    switch (powerUp.type) {
      case 'boost':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #FF6B35, #F7931E, #FFD700)',
          border: '2px solid #FF6B35',
          boxShadow: '0 0 15px rgba(255,107,53,0.8), inset -2px -2px 4px rgba(0,0,0,0.2)',
        };
      case 'shield':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #4FC3F7, #29B6F6, #03A9F4)',
          border: '2px solid #4FC3F7',
          boxShadow: '0 0 15px rgba(79,195,247,0.8), inset -2px -2px 4px rgba(0,0,0,0.2)',
        };
      case 'magnet':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #AB47BC, #8E24AA, #7B1FA2)',
          border: '2px solid #AB47BC',
          boxShadow: '0 0 15px rgba(171,71,188,0.8), inset -2px -2px 4px rgba(0,0,0,0.2)',
        };
      case 'double_score':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #66BB6A, #4CAF50, #388E3C)',
          border: '2px solid #66BB6A',
          boxShadow: '0 0 15px rgba(102,187,106,0.8), inset -2px -2px 4px rgba(0,0,0,0.2)',
        };
      case 'extra_life':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #EC407A, #E91E63, #C2185B)',
          border: '2px solid #EC407A',
          boxShadow: '0 0 15px rgba(236,64,122,0.8), inset -2px -2px 4px rgba(0,0,0,0.2)',
          animation: 'powerUpFloat 1.5s ease-in-out infinite, heartBeat 1s ease-in-out infinite',
        };
      default:
        return baseStyles;
    }
  };

  const getPowerUpIcon = (type: PowerUp['type']) => {
    switch (type) {
      case 'boost': return '🚀';
      case 'shield': return '🛡️';
      case 'magnet': return '🧲';
      case 'double_score': return '⭐';
      case 'extra_life': return '❤️';
      default: return '⚡';
    }
  };

  const getPowerUpEffect = (powerUp: PowerUp) => {
    // Special effects for different power-ups
    switch (powerUp.type) {
      case 'boost':
        return (
          <div className="absolute inset-0 -m-2 animate-spin-slow">
            <div className="w-full h-full border-2 border-orange-400 rounded-full opacity-50"></div>
          </div>
        );
      case 'shield':
        return (
          <div className="absolute inset-0 -m-1 animate-ping">
            <div className="w-full h-full bg-blue-400 rounded-lg opacity-30"></div>
          </div>
        );
      case 'magnet':
        return (
          <>
            <div className="absolute inset-0 -m-3 animate-pulse">
              <div className="w-full h-full border border-purple-400 rounded-full opacity-60"></div>
            </div>
            <div className="absolute inset-0 -m-6 animate-pulse delay-300">
              <div className="w-full h-full border border-purple-400 rounded-full opacity-40"></div>
            </div>
          </>
        );
      case 'double_score':
        return (
          <div className="absolute inset-0 -m-2">
            <div className="w-full h-full bg-green-400 rounded-lg opacity-40 animate-pulse"></div>
          </div>
        );
      case 'extra_life':
        return (
          <div className="absolute inset-0 animate-ping">
            <div className="w-full h-full bg-pink-400 rounded-lg opacity-50"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const getPowerUpLabel = (type: PowerUp['type']) => {
    switch (type) {
      case 'boost': return 'BOOST';
      case 'shield': return 'SHIELD';
      case 'magnet': return 'MAGNET';
      case 'double_score': return 'x2';
      case 'extra_life': return '+1';
      default: return '';
    }
  };

  return (
    <>
      {powerUps
        .filter(powerUp => !powerUp.collected)
        .map(powerUp => {
          const screenX = powerUp.x - cameraX;
          const isVisible = screenX > -60 && screenX < window.innerWidth + 60;
          
          if (!isVisible) return null;

          return (
            <div key={powerUp.id}>
              {/* Background effects */}
              {getPowerUpEffect(powerUp)}
              
              {/* Main power-up */}
              <div style={getPowerUpStyle(powerUp)}>
                <span style={{ 
                  filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.7))',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {getPowerUpIcon(powerUp.type)}
                </span>
              </div>

              {/* Power-up label */}
              <div 
                className="absolute text-xs font-bold text-white animate-bounce"
                style={{
                  left: `${powerUp.x - cameraX + 35}px`,
                  top: `${powerUp.y + 8}px`,
                  zIndex: 8,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  fontSize: '10px'
                }}
              >
                {getPowerUpLabel(powerUp.type)}
              </div>
            </div>
          );
        })
      }
      
      <style>{`
        @keyframes powerUpFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
          }
          50% { 
            transform: translateY(-10px) scale(1.05); 
          }
        }
        
        @keyframes powerUpGlow {
          from { 
            filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.5));
          }
          to { 
            filter: brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.8));
          }
        }
        
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </>
  );
};