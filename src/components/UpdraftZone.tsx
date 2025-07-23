interface UpdraftZoneProps {
  worldX: number;
  cameraX: number;
  zones: Array<{ x: number; width: number; strength: number }>;
}

export const UpdraftZone = ({ worldX, cameraX, zones }: UpdraftZoneProps) => {
  return (
    <>
      {zones.map((zone, index) => {
        const screenX = zone.x - cameraX;
        const isVisible = screenX > -zone.width && screenX < window.innerWidth + zone.width;
        const isActive = worldX >= zone.x && worldX <= zone.x + zone.width;
        
        if (!isVisible) return null;
        
        return (
          <div
            key={index}
            className="absolute z-5 pointer-events-none"
            style={{
              left: `${screenX}px`,
              top: '0px',
              width: `${zone.width}px`,
              height: '100vh',
            }}
          >
            {/* Updraft visual effect */}
            <div 
              className={`w-full h-full relative ${isActive ? 'opacity-100' : 'opacity-60'}`}
              style={{
                background: `linear-gradient(to top, 
                  rgba(135, 206, 235, 0.1) 0%, 
                  rgba(135, 206, 235, 0.3) 50%, 
                  rgba(135, 206, 235, 0.1) 100%)`,
                animation: 'flow-up 2s ease-in-out infinite'
              }}
            >
              {/* Floating particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full"
                  style={{
                    left: `${(i * 12.5) + Math.random() * 20}%`,
                    animation: `float-up ${2 + Math.random()}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
              
              {/* Strength indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-semibold">
                ↑ Updraft {zone.strength.toFixed(1)}x
              </div>
            </div>
          </div>
        );
      })}
      
      <style>{`
        @keyframes flow-up {
          0%, 100% { background-position: 0% 100%; }
          50% { background-position: 0% 0%; }
        }
        
        @keyframes float-up {
          0% { 
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(90vh) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(10vh) scale(1);
          }
          100% { 
            transform: translateY(0) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};