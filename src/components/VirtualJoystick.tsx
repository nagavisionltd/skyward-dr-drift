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
    <div className="fixed bottom-4 left-4 z-30 flex items-end gap-4">
      {/* Virtual Joystick */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-24 h-24 bg-card/60 backdrop-blur-sm border-2 border-border rounded-full flex items-center justify-center touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          onMouseDown={handleMouseDown}
        >
          <div
            ref={joystickRef}
            className="w-8 h-8 bg-primary rounded-full transition-transform duration-75"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground mt-1">Move</p>
      </div>

      {/* Boost Button */}
      <div className="flex flex-col items-center">
        <button
          className={`w-16 h-16 rounded-full border-2 border-border backdrop-blur-sm touch-none transition-all ${
            isBoosting 
              ? 'bg-primary text-primary-foreground scale-95' 
              : 'bg-card/60 text-foreground hover:bg-card/80'
          }`}
          onTouchStart={handleBoostPress}
          onTouchEnd={handleBoostRelease}
          onMouseDown={handleBoostPress}
          onMouseUp={handleBoostRelease}
          onMouseLeave={handleBoostRelease}
        >
          ⚡
        </button>
        <p className="text-xs text-center text-muted-foreground mt-1">Boost</p>
      </div>
    </div>
  );
};