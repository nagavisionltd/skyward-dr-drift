import { useState, useRef, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
}

export const VirtualJoystick = ({ onDirectionChange }: VirtualJoystickProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if device supports touch
  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Don't render on desktop
  if (!isMobile) return null;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    // Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
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
    const maxDistance = 50;
    
    let x = deltaX;
    let y = deltaY;
    
    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance;
      y = (deltaY / distance) * maxDistance;
    }
    
    setPosition({ x, y });
    
    // Normalize the values between -1 and 1
    const normalizedX = x / maxDistance;
    const normalizedY = y / maxDistance;
    
    onDirectionChange({ x: normalizedX, y: normalizedY });
  }, [isDragging, onDirectionChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onDirectionChange({ x: 0, y: 0 });
  }, [onDirectionChange]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Global mouse move and up events
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className="fixed bottom-8 left-8 z-30">
      <div
        ref={containerRef}
        className="relative w-24 h-24 bg-black/40 border-2 border-white/30 rounded-full backdrop-blur-sm"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {/* Joystick knob */}
        <div
          ref={joystickRef}
          className="absolute w-8 h-8 bg-white/80 rounded-full border-2 border-white shadow-lg transition-transform duration-75"
          style={{
            left: `calc(50% + ${position.x}px - 1rem)`,
            top: `calc(50% + ${position.y}px - 1rem)`,
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        
        {/* Center dot */}
        <div className="absolute w-2 h-2 bg-white/60 rounded-full" style={{
          left: 'calc(50% - 0.25rem)',
          top: 'calc(50% - 0.25rem)',
        }} />
        
        {/* Direction indicators */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">↑</div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">↓</div>
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">←</div>
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">→</div>
        </div>
      </div>
      
      {/* Control label */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white/80 text-xs font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
        Flight Control
      </div>
    </div>
  );
};