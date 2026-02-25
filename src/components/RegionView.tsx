import type { Starch, Region } from "../types";
import { MATCHUP_ORDER } from "../types";

interface Props {
  region: Region;
  starches: Starch[];
  selectedStarchId: string | null;
  pendingSlot: number | null;
  onAssign: (regionName: string, seedIndex: number) => void;
  onRemove: (regionName: string, seedIndex: number) => void;
  onDrop: (regionName: string, seedIndex: number, starchId: string) => void;
}

export default function RegionView({
  region,
  starches,
  selectedStarchId,
  pendingSlot,
  onAssign,
  onRemove,
  onDrop,
}: Props) {
  const filledCount = region.seeds.filter((s) => s !== null).length;

  function getStarch(seedIndex: number): Starch | undefined {
    const id = region.seeds[seedIndex];
    if (!id) return undefined;
    return starches.find((s) => s.id === id);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, seedIndex: number) {
    e.preventDefault();
    const starchId = e.dataTransfer.getData("text/plain");
    if (starchId) {
      onDrop(region.name, seedIndex, starchId);
    }
    (e.currentTarget as HTMLElement).classList.remove("drag-over");
  }

  function handleDragEnter(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).classList.add("drag-over");
  }

  function handleDragLeave(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove("drag-over");
  }

  return (
    <div className="region-card">
      <div className="region-header">
        <h3>{region.name} Region</h3>
        <span className="region-count">{filledCount}/16</span>
      </div>
      <div className="matchups">
        {MATCHUP_ORDER.map(([seedA, seedB], i) => {
          const starchA = getStarch(seedA - 1);
          const starchB = getStarch(seedB - 1);

          return (
            <div key={i} className="matchup">
              <div className="matchup-label">Game {i + 1}</div>
              <SeedSlot
                seed={seedA}
                starch={starchA}
                hasSelection={selectedStarchId !== null}
                isPending={pendingSlot === seedA - 1}
                onClick={() =>
                  starchA
                    ? onRemove(region.name, seedA - 1)
                    : onAssign(region.name, seedA - 1)
                }
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, seedA - 1)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              />
              <div className="vs-divider">VS</div>
              <SeedSlot
                seed={seedB}
                starch={starchB}
                hasSelection={selectedStarchId !== null}
                isPending={pendingSlot === seedB - 1}
                onClick={() =>
                  starchB
                    ? onRemove(region.name, seedB - 1)
                    : onAssign(region.name, seedB - 1)
                }
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, seedB - 1)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeedSlot({
  seed,
  starch,
  hasSelection,
  isPending,
  onClick,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
}: {
  seed: number;
  starch?: Starch;
  hasSelection: boolean;
  isPending: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
}) {
  return (
    <div
      className={`seed-slot ${starch ? "filled" : ""} ${isPending ? "pending" : ""}`}
      onClick={onClick}
      onDragOver={!starch ? onDragOver : undefined}
      onDrop={!starch ? onDrop : undefined}
      onDragEnter={!starch ? onDragEnter : undefined}
      onDragLeave={!starch ? onDragLeave : undefined}
      title={starch ? `Click to remove ${starch.name}` : hasSelection ? "Click to place selected starch" : "Tap to choose a starch"}
    >
      <span className="seed-number">#{seed}</span>
      {starch ? (
        <>
          {starch.imageUrl ? (
            <img
              src={starch.imageUrl}
              alt={starch.name}
              className="starch-image"
            />
          ) : (
            <span className="starch-emoji">{starch.emoji}</span>
          )}
          <span className="starch-name">{starch.name}</span>
          <button
            className="seed-remove"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            ✕
          </button>
        </>
      ) : (
        <span className="seed-empty-text">
          {isPending ? "Picking..." : "Empty"}
        </span>
      )}
    </div>
  );
}
