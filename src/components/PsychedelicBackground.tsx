export const PsychedelicBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, #FF6B6B 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #4ECDC4 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, #45B7D1 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, #8B5CF6 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, #F59E0B 0%, transparent 50%),
            linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)
          `,
          animation: 'psychedelicShift 20s ease-in-out infinite',
        }}
      />
      
      {/* Animated nebula layers */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse at 30% 70%, #FF1744 0%, transparent 60%),
            radial-gradient(ellipse at 70% 30%, #00E676 0%, transparent 60%)
          `,
          animation: 'nebulaFloat 15s ease-in-out infinite reverse',
        }}
      />
      
      {/* Swirling cosmic dust */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 50%, 
              #FF6B6B 0deg, 
              #4ECDC4 60deg, 
              #45B7D1 120deg, 
              #8B5CF6 180deg, 
              #F59E0B 240deg, 
              #FF1744 300deg, 
              #FF6B6B 360deg)
          `,
          animation: 'cosmicSwirl 30s linear infinite',
          borderRadius: '50%',
          filter: 'blur(100px)',
          transform: 'scale(2)',
        }}
      />
      
      {/* Twinkling stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-80"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      
      {/* Aurora-like light streaks */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            linear-gradient(45deg, transparent 40%, #00E676 50%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, #FF1744 50%, transparent 60%)
          `,
          animation: 'auroraWave 12s ease-in-out infinite',
        }}
      />
      
    </div>
  );
};