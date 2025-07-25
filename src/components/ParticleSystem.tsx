interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: string;
  size: number;
}

interface ParticleSystemProps {
  particles: Particle[];
  cameraX: number;
}

export const ParticleSystem = ({ particles, cameraX }: ParticleSystemProps) => {
  const getParticleStyle = (particle: Particle) => {
    const opacity = 1 - (particle.life / particle.maxLife);
    const scale = 1 - (particle.life / particle.maxLife) * 0.5;
    
    const baseStyles = {
      position: 'absolute' as const,
      left: `${particle.x - cameraX}px`,
      top: `${particle.y}px`,
      width: `${particle.size * scale}px`,
      height: `${particle.size * scale}px`,
      borderRadius: '50%',
      opacity: opacity,
      zIndex: 15,
      pointerEvents: 'none' as const,
      transform: `scale(${scale})`,
    };

    switch (particle.type) {
      case 'explosion':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, #FF4500, #FF6347, #FFD700)',
          boxShadow: '0 0 8px rgba(255,69,0,0.8)',
          animation: 'explode 0.5s ease-out',
        };
      case 'collect':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, #FFD700, #FFEB3B, #FFF)',
          boxShadow: '0 0 6px rgba(255,215,0,0.9)',
          animation: 'sparkle 0.8s ease-out',
        };
      case 'powerup':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, #9C27B0, #E91E63, #FFF)',
          boxShadow: '0 0 10px rgba(156,39,176,0.9)',
          animation: 'powerupBurst 1s ease-out',
        };
      case 'boost':
        return {
          ...baseStyles,
          background: 'linear-gradient(45deg, #FF6B35, #FFD700)',
          boxShadow: '0 0 6px rgba(255,107,53,0.8)',
        };
      case 'damage':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, #F44336, #E57373, #FFCDD2)',
          boxShadow: '0 0 8px rgba(244,67,54,0.7)',
        };
      default:
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, #FFF, #E0E0E0)',
          boxShadow: '0 0 4px rgba(255,255,255,0.6)',
        };
    }
  };

  const getParticleIcon = (particle: Particle) => {
    switch (particle.type) {
      case 'explosion':
        return '💥';
      case 'collect':
        return '✨';
      case 'powerup':
        return '⚡';
      case 'boost':
        return '🔥';
      case 'damage':
        return '💢';
      default:
        return '•';
    }
  };

  const shouldShowIcon = (particle: Particle) => {
    return particle.type === 'explosion' || particle.type === 'collect' || particle.type === 'powerup';
  };

  return (
    <>
      {particles.map(particle => {
        const screenX = particle.x - cameraX;
        const isVisible = screenX > -100 && screenX < window.innerWidth + 100;
        
        if (!isVisible) return null;

        return (
          <div key={particle.id}>
            {/* Main particle */}
            <div style={getParticleStyle(particle)}>
              {shouldShowIcon(particle) && (
                <div 
                  className="w-full h-full flex items-center justify-center text-xs"
                  style={{ 
                    fontSize: `${Math.max(8, particle.size * 0.6)}px`,
                    transform: 'scale(1)',
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))'
                  }}
                >
                  {getParticleIcon(particle)}
                </div>
              )}
            </div>

            {/* Additional effect layers for special particles */}
            {particle.type === 'explosion' && particle.life < 10 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${particle.x - cameraX - 10}px`,
                  top: `${particle.y - 10}px`,
                  width: `${particle.size + 20}px`,
                  height: `${particle.size + 20}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,69,0,0.3), transparent)',
                  opacity: 1 - (particle.life / 20),
                  zIndex: 14,
                  pointerEvents: 'none',
                  animation: 'shockwave 0.3s ease-out',
                }}
              />
            )}

            {particle.type === 'powerup' && (
              <div
                style={{
                  position: 'absolute',
                  left: `${particle.x - cameraX - 5}px`,
                  top: `${particle.y - 5}px`,
                  width: `${particle.size + 10}px`,
                  height: `${particle.size + 10}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(156,39,176,0.4), transparent)',
                  opacity: 1 - (particle.life / particle.maxLife),
                  zIndex: 14,
                  pointerEvents: 'none',
                  animation: 'pulse 0.5s ease-out infinite',
                }}
              />
            )}
          </div>
        );
      })}
      
      <style>{`
        @keyframes explode {
          0% { 
            transform: scale(0.5);
            opacity: 1;
          }
          50% { 
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% { 
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes sparkle {
          0% { 
            transform: scale(0.2);
            opacity: 1;
          }
          50% { 
            transform: scale(1);
            opacity: 0.9;
          }
          100% { 
            transform: scale(0.1);
            opacity: 0;
          }
        }
        
        @keyframes powerupBurst {
          0% { 
            transform: scale(0.3);
            opacity: 1;
          }
          50% { 
            transform: scale(1.3);
            opacity: 0.8;
          }
          100% { 
            transform: scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes shockwave {
          0% { 
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% { 
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};