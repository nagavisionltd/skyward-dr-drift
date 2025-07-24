import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GameControlsProps {
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  onStartGame: () => void;
  onResetGame: () => void;
}

export const GameControls = ({ 
  gameStarted, 
  gameOver, 
  levelComplete,
  onStartGame, 
  onResetGame 
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
              ? "Congratulations! You reached the goal!"
              : !gameStarted 
                ? "Collect medical supplies and avoid obstacles!" 
                : gameOver 
                  ? "Game Over! You ran out of lives."
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
                onClick={onResetGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Play Again
              </Button>
            </>
          ) : !gameStarted ? (
            <>
              <div className="text-center space-y-2 text-sm text-muted-foreground">
                <p>🩹 Collect medical supplies for points</p>
                <p>🪨 Avoid obstacles or lose lives</p>
                <p>🏁 Reach the goal to complete the level</p>
              </div>
              <Button 
                onClick={onStartGame}
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
                  Game Over!
                </p>
                <p className="text-sm text-muted-foreground">
                  The doctor ran out of lives
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={onResetGame}
                  variant="outline"
                  className="flex-1"
                >
                  Menu
                </Button>
                <Button 
                  onClick={onStartGame}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Try Again
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};