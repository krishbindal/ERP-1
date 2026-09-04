export default function TimetableLoading() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  return (
    <div className="space-y-6" data-testid="timetable-loading-skeleton">
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-36 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-56 bg-muted/60 animate-pulse rounded-md mt-2" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Timetable grid skeleton */}
      <div
        className="w-full overflow-x-auto rounded-lg border border-border bg-surface shadow-xs"
        role="region"
        aria-label="Loading timetable schedule"
        tabIndex={0}
      >
        <div className="min-w-[850px] md:min-w-[960px]">
          {/* Day column headers */}
          <div className="flex border-b-2 border-border bg-muted/60 pl-20">
            {days.map((day) => (
              <div
                key={day}
                className="flex-1 text-center py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground border-l border-border"
              >
                <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto" />
              </div>
            ))}
          </div>

          {/* Grid body skeleton */}
          <div className="flex relative h-[540px]">
            {/* Time axis */}
            <div className="w-20 flex flex-col relative border-r-2 border-border bg-muted/30">
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute w-full text-xs font-mono text-muted-foreground/60 text-right pr-3 -mt-2.5"
                  style={{ top: `${i * 60}px` }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Grid area with simulated loading cards */}
            <div className="flex flex-1 relative">
              {hours.map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-border/40"
                  style={{ top: `${i * 60}px` }}
                />
              ))}

              {days.map((day, colIdx) => (
                <div key={day} className="flex-1 relative border-l border-border/80">
                  {/* Staggered simulated class cards for visual skeleton fidelity */}
                  {colIdx % 2 === 0 && (
                    <div
                      className="absolute left-1 right-1 rounded-md border border-border/60 bg-muted/50 p-2 animate-pulse"
                      style={{ top: `${(colIdx + 1) * 45}px`, height: '70px' }}
                    >
                      <div className="h-3 w-3/4 bg-muted-foreground/20 rounded mb-1.5" />
                      <div className="h-2.5 w-1/2 bg-muted-foreground/15 rounded mb-1" />
                      <div className="h-2 w-2/3 bg-muted-foreground/10 rounded" />
                    </div>
                  )}

                  {colIdx % 3 === 1 && (
                    <div
                      className="absolute left-1 right-1 rounded-md border border-border/60 bg-muted/50 p-2 animate-pulse"
                      style={{ top: `${(colIdx * 50) + 120}px`, height: '75px' }}
                    >
                      <div className="h-3 w-4/5 bg-muted-foreground/20 rounded mb-1.5" />
                      <div className="h-2.5 w-3/5 bg-muted-foreground/15 rounded mb-1" />
                      <div className="h-2 w-1/2 bg-muted-foreground/10 rounded" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
