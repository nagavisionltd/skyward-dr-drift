import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GameControlsProps {
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  distance: number;
  onStart: () => void;
  onReset: () => void;
}

export const GameControls = ({ 
  gameStarted, 
  gameOver, 
  levelComplete,
  distance, 
  onStart, 
  onReset 
}: GameControlsProps) => {
  if (gameStarted && !gameOver && !levelComplete) {
    return (
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>🔺 W/↑/Space: Fly Up</div>
              <div>🔻 S/↓: Dive Down</div>
              <div>◀️ A/←: Move Left</div>
              <div>▶️ D/→: Move Right</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <Card className="w-96 bg-card/95 backdrop-blur-sm border-border shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {levelComplete ? "🏁 Level Complete!" : "Flying Doctor"}
          </CardTitle>
          <CardDescription className="text-lg">
            {levelComplete 
              ? `Congratulations! You reached the goal in ${Math.floor(distance / 10)}m!`
              : !gameStarted 
                ? "Help the doctor fly through the endless sky!" 
                : gameOver 
                  ? `Flight completed! You traveled ${Math.floor(distance / 10)}m`
                  : ""
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {levelComplete ? (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  🎉 Amazing Flying, Doctor!
                </p>
                <p className="text-sm text-muted-foreground">
                  You successfully reached the goal!
                </p>
              </div>
              <Button 
                onClick={onReset}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Play Again
              </Button>
            </>
          ) : !gameStarted ? (
            <>
              <div className="text-center space-y-2 text-sm text-muted-foreground">
                <p>Use WASD/arrow keys or touch controls to fly</p>
                <p>Reach the goal flag to complete the level!</p>
              </div>
              <Button 
                onClick={onStart}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Start Flying
              </Button>
            </>
          ) : gameOver ? (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  Great flight, Doctor!
                </p>
                <p className="text-sm text-muted-foreground">
                  Distance: {Math.floor(distance / 10)} meters
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={onReset}
                  variant="outline"
                  className="flex-1"
                >
                  Menu
                </Button>
                <Button 
                  onClick={onStart}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Fly Again
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};