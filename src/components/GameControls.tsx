import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GameControlsProps {
  gameStarted: boolean;
  gameOver: boolean;
  levelComplete: boolean;
  distance: number;
  score: number;
  lives: number;
  level: number;
  boostCooldown: number;
  shieldActive: boolean;
  magnetActive: boolean;
  doubleScoreActive: boolean;
  onStart: () => void;
  onReset: () => void;
}

export const GameControls = ({ 
  gameStarted, 
  gameOver, 
  levelComplete,
  distance,
  score,
  lives,
  level,
  boostCooldown,
  shieldActive,
  magnetActive,
  doubleScoreActive,
  onStart, 
  onReset 
}: GameControlsProps) => {
  if (gameStarted && !gameOver && !levelComplete) {
    return (
      <>
        {/* Game HUD */}
        <div className="absolute top-4 left-4 z-20 space-y-2">
          <Card className="bg-card/90 backdrop-blur-sm border-border">
            <CardContent className="p-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-bold text-yellow-400">{score.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-bold text-blue-400">{level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lives:</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span 
                        key={i} 
                        className={i < lives ? "text-red-500" : "text-gray-600"}
                      >
                        ❤️
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-bold text-green-400">{Math.floor(distance / 10)}m</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Power-ups */}
          {(shieldActive || magnetActive || doubleScoreActive) && (
            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardContent className="p-2">
                <div className="text-xs font-semibold text-muted-foreground mb-1">Active Power-ups:</div>
                <div className="flex space-x-1">
                  {shieldActive && (
                    <div className="flex items-center space-x-1 text-blue-400">
                      <span>🛡️</span>
                      <span className="text-xs">Shield</span>
                    </div>
                  )}
                  {magnetActive && (
                    <div className="flex items-center space-x-1 text-purple-400">
                      <span>🧲</span>
                      <span className="text-xs">Magnet</span>
                    </div>
                  )}
                  {doubleScoreActive && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <span>⭐</span>
                      <span className="text-xs">2x Score</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boost Indicator */}
          <Card className="bg-card/90 backdrop-blur-sm border-border">
            <CardContent className="p-2">
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                Boost: {boostCooldown > 0 ? 'Charging...' : 'Ready!'}
              </div>
              <Progress 
                value={boostCooldown > 0 ? ((3000 - boostCooldown) / 3000) * 100 : 100} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {boostCooldown > 0 ? `${Math.ceil(boostCooldown / 1000)}s` : 'Press Shift'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Help */}
        <div className="absolute bottom-4 left-4 z-20">
          <Card className="bg-card/90 backdrop-blur-sm border-border">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>🔺 W/↑/Space: Fly Up</div>
                <div>🔻 S/↓: Dive Down</div>
                <div>◀️ A/←: Move Left</div>
                <div>▶️ D/→: Move Right</div>
                <div>🚀 Shift: Boost (when ready)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High Score Celebration */}
        {score > 0 && score % 1000 === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 animate-bounce">
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-lg">
              🎉 {score.toLocaleString()} Points! 🎉
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <Card className="w-96 bg-card/95 backdrop-blur-sm border-border shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {levelComplete ? "🏁 Level Complete!" : gameOver ? "💥 Game Over!" : "🚀 Flying Doctor Adventure"}
          </CardTitle>
          <CardDescription className="text-lg">
            {levelComplete 
              ? `Congratulations! You completed Level ${level}!`
              : gameOver
                ? `You reached Level ${level} with ${score.toLocaleString()} points!`
                : !gameStarted 
                  ? "Navigate through space, collect items, and avoid obstacles!" 
                  : "Continue your adventure!"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {(gameOver || levelComplete) && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">Final Score: {score.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Level {level} • Distance: {Math.floor(distance / 10)}m</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">💰 Coins</div>
                  <div className="text-sm text-muted-foreground">Collected</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">⭐ Stars</div>
                  <div className="text-sm text-muted-foreground">Gathered</div>
                </div>
              </div>
            </div>
          )}

          {!gameStarted && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎮 Game Features:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Collect coins (🪙), gems (💎), and stars (⭐) for points</li>
                <li>• Find power-ups: Shield (🛡️), Boost (🚀), Magnet (🧲)</li>
                <li>• Avoid asteroids (🪨), meteors (☄️), and debris (🔩)</li>
                <li>• Use updraft zones for easier flying</li>
                <li>• Complete levels to unlock harder challenges</li>
                <li>• Collect health items (❤️) to restore lives</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            {!gameStarted && (
              <Button onClick={onStart} size="lg" className="flex-1">
                🚀 Start Adventure
              </Button>
            )}
            {(gameOver || levelComplete) && (
              <>
                <Button onClick={onReset} variant="outline" className="flex-1">
                  🔄 New Game
                </Button>
                {levelComplete && (
                  <Button onClick={onStart} size="lg" className="flex-1">
                    ➡️ Next Level
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};