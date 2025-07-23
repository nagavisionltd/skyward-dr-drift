interface LevelGoalProps {
  worldX: number;
  goalX: number;
  cameraX: number;
}

export const LevelGoal = ({ worldX, goalX, cameraX }: LevelGoalProps) => {
  const screenX = goalX - cameraX;
  const distanceToGoal = Math.max(0, goalX - worldX);
  const isVisible = screenX > -100 && screenX < 900; // Show when close to screen

  if (!isVisible) return null;

  return (
    <>
      {/* Goal marker */}
      <div
        className="absolute z-10 flex flex-col items-center"
        style={{
          left: `${screenX}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <div className="w-16 h-32 bg-gradient-to-t from-yellow-400 via-yellow-300 to-yellow-200 rounded-t-full border-4 border-yellow-600 animate-pulse shadow-lg">
          <div className="w-full h-full bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-t-full" />
        </div>
        <div className="w-4 h-8 bg-yellow-600 rounded-b-sm" />
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-900 text-xs font-bold">
          🏁 GOAL
        </div>
      </div>

      {/* Distance indicator */}
      {distanceToGoal > 50 && (
        <div className="absolute top-20 left-4 z-20">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg p-2 border border-border">
            <p className="text-xs text-muted-foreground">Distance to Goal:</p>
            <p className="text-sm font-semibold text-foreground">
              {Math.floor(distanceToGoal / 10)}m
            </p>
          </div>
        </div>
      )}
    </>
  );
};