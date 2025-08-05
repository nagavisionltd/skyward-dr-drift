import { useState, useRef, useCallback, useEffect } from 'react';

interface TouchControlsProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  onBoost: (boosting: boolean) => void;
}

export const VirtualJoystick = ({ onDirectionChange, onBoost }: TouchControlsProps) => {
  const [isBoosting, setIsBoosting] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Simple mobile detection - always show on touch devices
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const handleTouch = useCallback((clientX: number, clientY: number) => {
    if (!screenRef.current) return;
    
    const rect = screenRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate direction from screen center to touch point
    const deltaX = clientX - rect.left - centerX;
    const deltaY = clientY - rect.top - centerY;
    
    // Normalize direction
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedX = distance > 0 ? deltaX / (rect.width / 2) : 0;
    const normalizedY = distance > 0 ? -deltaY / (rect.height / 2) : 0; // Invert Y
    
    // Clamp values
    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));
    
    setTouchPosition({ x: clientX - rect.left, y: clientY - rect.top });
    onDirectionChange({ x: clampedX, y: clampedY });
  }, [onDirectionChange]);

  const handleTouchEnd = useCallback(() => {
    setTouchPosition(null);
    onDirectionChange({ x: 0, y: 0 });
  }, [onDirectionChange]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleTouch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleTouch(touch.clientX, touch.clientY);
  };

  const handleBoostPress = () => {
    setIsBoosting(true);
    onBoost(true);
  };

  const handleBoostRelease = () => {
    setIsBoosting(false);
    onBoost(false);
  };

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <>
      {/* Full screen touch area */}
      <div
        ref={screenRef}
        className="fixed inset-0 z-20 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Touch indicator */}
        {touchPosition && (
          <div
            className="absolute w-12 h-12 rounded-full border-4 border-white/60 bg-white/20 pointer-events-none"
            style={{
              transform: `translate(${touchPosition.x - 24}px, ${touchPosition.y - 24}px)`,
              boxShadow: '0 0 20px rgba(255,255,255,0.6)'
            }}
          />
        )}
      </div>

      {/* Boost Button */}
      <div className="fixed bottom-4 right-4 z-30">
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
        >
          <span className="text-2xl">⚡</span>
        </button>
        <p className="text-xs text-center text-white/80 mt-2 font-semibold">BOOST</p>
      </div>

    </>
  );
};