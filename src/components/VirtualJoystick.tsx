import { useState, useRef, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  onBoost: (boosting: boolean) => void;
}

export const VirtualJoystick = ({ onDirectionChange, onBoost }: VirtualJoystickProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isBoosting, setIsBoosting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if device supports touch
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on desktop
  if (!isMobile) return null;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setIsDragging(true);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50; // Increased for better control
    
    let x = deltaX;
    let y = deltaY;
    
    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance;
      y = (deltaY / distance) * maxDistance;
    }
    
    setPosition({ x, y });
    
    // Normalize direction values with improved sensitivity
    const normalizedX = Math.max(-1, Math.min(1, x / maxDistance * 1.2));
    const normalizedY = Math.max(-1, Math.min(1, -y / maxDistance * 1.2)); // Invert Y for up/down
    
    onDirectionChange({ x: normalizedX, y: normalizedY });
  }, [isDragging, onDirectionChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onDirectionChange({ x: 0, y: 0 });
  }, [onDirectionChange]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  // Mouse events for testing on desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBoostPress = () => {
    setIsBoosting(true);
    onBoost(true);
  };

  const handleBoostRelease = () => {
    setIsBoosting(false);
    onBoost(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-30 flex items-end gap-6">
      {/* 3D Virtual Joystick */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-28 h-28 rounded-full touch-none relative"
          style={{
            background: 'linear-gradient(135deg, #4A5568 0%, #2D3748 50%, #1A202C 100%)',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)',
            border: '3px solid #4A5568'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleMouseDown}
        >
          {/* 3D Joystick Knob */}
          <div
            ref={joystickRef}
            className="w-12 h-12 rounded-full absolute top-1/2 left-1/2 transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
              background: 'linear-gradient(135deg, #63B3ED 0%, #3182CE 50%, #2C5282 100%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
              border: '2px solid #4299E1'
            }}
          />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
        </div>
        <p className="text-xs text-center text-white/80 mt-2 font-semibold">MOVE</p>
      </div>

      {/* 3D Boost Button */}
      <div className="flex flex-col items-center">
        <button
          className={`w-20 h-20 rounded-full touch-none transition-all transform ${
            isBoosting 
              ? 'scale-90' 
              : 'hover:scale-105'
          }`}
          style={{
            background: isBoosting 
              ? 'linear-gradient(135deg, #F56565 0%, #E53E3E 50%, #C53030 100%)'
              : 'linear-gradient(135deg, #68D391 0%, #48BB78 50%, #38A169 100%)',
            boxShadow: isBoosting
              ? 'inset 0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
              : '0 6px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
            border: '3px solid rgba(255,255,255,0.3)'
          }}
          onTouchStart={handleBoostPress}
          onTouchEnd={handleBoostRelease}
          onMouseDown={handleBoostPress}
          onMouseUp={handleBoostRelease}
          onMouseLeave={handleBoostRelease}
        >
          <span className="text-2xl">⚡</span>
        </button>
        <p className="text-xs text-center text-white/80 mt-2 font-semibold">BOOST</p>
      </div>
    </div>
  );
};