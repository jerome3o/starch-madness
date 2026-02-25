import { useState } from "react";
import type { Starch, Region } from "../types";
import RegionView from "./RegionView";

interface Props {
  starches: Starch[];
  regions: Region[];
  assignedIds: Set<string>;
  onAssign: (regionName: string, seedIndex: number, starchId: string) => void;
  onRemove: (regionName: string, seedIndex: number) => void;
  onAutoSeed: () => void;
  onClearAll: () => void;
  onShuffle: () => void;
}

export default function BracketSeeding({
  starches,
  regions,
  assignedIds,
  onAssign,
  onRemove,
  onAutoSeed,
  onClearAll,
  onShuffle,
}: Props) {
  const [selectedStarchId, setSelectedStarchId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{
    regionName: string;
    seedIndex: number;
  } | null>(null);

  const unassignedCount = starches.filter((s) => !assignedIds.has(s.id)).length;

  const totalSlots = regions.length * 16;
  const filledSlots = regions.reduce(
    (sum, r) => sum + r.seeds.filter((s) => s !== null).length,
    0
  );

  function handleSlotClick(regionName: string, seedIndex: number) {
    if (selectedStarchId) {
      onAssign(regionName, seedIndex, selectedStarchId);
      setSelectedStarchId(null);
      setPendingSlot(null);
      setDrawerOpen(false);
    } else {
      // No starch selected — remember which slot was tapped and open the drawer
      setPendingSlot({ regionName, seedIndex });
      setDrawerOpen(true);
    }
  }

  function handleSlotRemove(regionName: string, seedIndex: number) {
    onRemove(regionName, seedIndex);
  }

  function handleDrop(
    regionName: string,
    seedIndex: number,
    starchId: string
  ) {
    onAssign(regionName, seedIndex, starchId);
    setSelectedStarchId(null);
  }

  function handleStarchDragStart(e: React.DragEvent, starchId: string) {
    e.dataTransfer.setData("text/plain", starchId);
    e.dataTransfer.effectAllowed = "move";
  }

  function selectStarch(id: string) {
    // If there's a pending slot, assign immediately and close the drawer
    if (pendingSlot) {
      onAssign(pendingSlot.regionName, pendingSlot.seedIndex, id);
      setPendingSlot(null);
      setSelectedStarchId(null);
      setDrawerOpen(false);
      return;
    }

    const next = selectedStarchId === id ? null : id;
    setSelectedStarchId(next);
    if (next) {
      // On mobile, close drawer after selection so user can tap a slot
      setDrawerOpen(false);
    }
  }

  const selectedStarch = selectedStarchId
    ? starches.find((s) => s.id === selectedStarchId)
    : null;

  return (
    <div className="seeding-layout">
      {/* Mobile-only: overlay behind drawer */}
      <div
        className={`starch-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => {
          setDrawerOpen(false);
          setPendingSlot(null);
        }}
      />

      {/* Mobile-only: toggle button for starch drawer */}
      <button
        className={`mobile-starch-toggle ${selectedStarch ? "has-selection" : ""}`}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        {selectedStarch
          ? `${selectedStarch.emoji} ${selectedStarch.name} selected — tap a slot`
          : `Select a starch (${unassignedCount} available)`}
      </button>

      {/* Sidebar / mobile drawer */}
      <div className={`seeding-sidebar ${drawerOpen ? "open" : ""}`}>
        <h3>
          {pendingSlot
            ? `Pick a starch for ${pendingSlot.regionName} #${pendingSlot.seedIndex + 1}`
            : `Unassigned (${unassignedCount})`}
        </h3>
        <input
          className="sidebar-search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="sidebar-starch-list">
          {starches
            .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
            .map((s) => {
              const isAssigned = assignedIds.has(s.id);
              return (
                <div
                  key={s.id}
                  className={`sidebar-starch ${selectedStarchId === s.id ? "selected" : ""} ${isAssigned ? "assigned" : ""}`}
                  onClick={() => {
                    if (!isAssigned) {
                      selectStarch(s.id);
                    }
                  }}
                  draggable={!isAssigned}
                  onDragStart={(e) =>
                    !isAssigned && handleStarchDragStart(e, s.id)
                  }
                >
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="starch-image"
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <span style={{ fontSize: "1rem" }}>{s.emoji}</span>
                  )}
                  <span className="starch-name">{s.name}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="seeding-main">
        <div className="auto-seed-bar">
          <p>
            {filledSlots}/{totalSlots} slots filled
            {selectedStarch && (
              <> — Tap a slot to place <strong>{selectedStarch.name}</strong></>
            )}
          </p>
          <button className="btn btn-sm" onClick={onAutoSeed}>
            Auto-Seed
          </button>
          <button className="btn btn-sm" onClick={onShuffle}>
            Shuffle
          </button>
          <button className="btn btn-sm btn-danger" onClick={onClearAll}>
            Clear All
          </button>
        </div>

        <div className="regions-grid">
          {regions.map((region) => (
            <RegionView
              key={region.name}
              region={region}
              starches={starches}
              selectedStarchId={selectedStarchId}
              pendingSlot={
                pendingSlot?.regionName === region.name
                  ? pendingSlot.seedIndex
                  : null
              }
              onAssign={handleSlotClick}
              onRemove={handleSlotRemove}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
