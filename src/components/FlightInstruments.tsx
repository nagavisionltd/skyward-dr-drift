import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FlightInstrumentsProps {
  distance: number;
  speed: number;
  altitude: number;
  energy: number;
  lift: number;
  drag: number;
  biome: string;
  flightMode: string;
  efficiency: number;
  smoothness: number;
  onFlightModeChange: (mode: string) => void;
}

export const FlightInstruments = ({
  distance,
  speed,
  altitude,
  energy,
  lift,
  drag,
  biome,
  flightMode,
  efficiency,
  smoothness,
  onFlightModeChange
}: FlightInstrumentsProps) => {
  const getSpeedColor = () => {
    if (speed < 5) return 'text-red-400';
    if (speed < 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getEnergyColor = () => {
    if (energy < 20) return 'bg-red-500';
    if (energy < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getEfficiencyColor = () => {
    if (efficiency < 50) return 'text-red-400';
    if (efficiency < 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="absolute top-4 left-4 z-20 space-y-2">
      {/* Primary Flight Display */}
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 border border-border min-w-[200px]">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Distance</p>
            <p className="font-bold text-foreground">{Math.floor(distance / 10)}m</p>
          </div>
          <div>
            <p className="text-muted-foreground">Speed</p>
            <p className={`font-bold ${getSpeedColor()}`}>{speed.toFixed(1)} u/s</p>
          </div>
          <div>
            <p className="text-muted-foreground">Altitude</p>
            <p className="font-bold text-foreground">{Math.floor(altitude)}ft</p>
          </div>
          <div>
            <p className="text-muted-foreground">Biome</p>
            <p className="font-bold text-blue-400">{biome}</p>
          </div>
        </div>
      </div>

      {/* Energy and Physics Display */}
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Energy</span>
              <span className="text-foreground">{Math.floor(energy)}%</span>
            </div>
            <Progress value={energy} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Lift</p>
              <p className="font-mono text-green-400">{lift.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Drag</p>
              <p className="font-mono text-red-400">{drag.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Efficiency</p>
              <p className={`font-bold ${getEfficiencyColor()}`}>{Math.floor(efficiency)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Smoothness</p>
              <p className={`font-bold ${getEfficiencyColor()}`}>{Math.floor(smoothness)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Mode Controls */}
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Flight Mode</p>
          <div className="flex gap-1">
            {['normal', 'precision', 'speed'].map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={flightMode === mode ? 'default' : 'outline'}
                className="h-6 px-2 text-xs"
                onClick={() => onFlightModeChange(mode)}
              >
                {mode.charAt(0).toUpperCase()}{mode.slice(1)}
              </Button>
            ))}
          </div>
          
          {/* Flight Mode Info */}
          <div className="text-xs text-muted-foreground">
            {flightMode === 'normal' && 'Balanced flight controls'}
            {flightMode === 'precision' && 'Reduced speed, enhanced stability'}
            {flightMode === 'speed' && 'Maximum speed and responsiveness'}
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-2 border border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>1/2/3: Switch flight modes</div>
          <div>↑/W/Space: Thrust up</div>
          <div>↓/S: Air brake</div>
          <div>←→/A/D: Maneuver</div>
        </div>
      </div>
    </div>
  );
};