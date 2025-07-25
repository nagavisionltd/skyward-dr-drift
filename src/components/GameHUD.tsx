interface GameHUDProps {
  score: number;
  lives: number;
  distance: number;
}

export const GameHUD = ({ score, lives, distance }: GameHUDProps) => {
  return (
    <div className="absolute top-4 left-4 z-20 space-y-2">
      {/* Score */}
      <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border min-w-[120px]">
        <div className="flex items-center gap-2">
          <span className="text-primary">💊</span>
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-lg font-bold text-foreground">{score.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Lives */}
      <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="flex items-center gap-2">
          <span className="text-red-500">❤️</span>
          <div>
            <p className="text-xs text-muted-foreground">Lives</p>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`text-lg ${i < lives ? 'opacity-100' : 'opacity-30'}`}>
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distance */}
      <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">📏</span>
          <div>
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-sm font-semibold text-foreground">{Math.floor(distance / 10)}m</p>
          </div>
        </div>
      </div>
    </div>
  );
};