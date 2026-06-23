import React from 'react';
import { Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Player } from '../types';

interface PlayerTrackerSetupPlayerRowProps {
  player: Player;
  index: number;
  players: Player[];
  draggedIndex: number | null;
  dragOverIndex: number | null;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleTouchStart: (e: React.TouchEvent, index: number) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  movePlayer: (index: number, direction: 'up' | 'down') => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
}

export default function PlayerTrackerSetupPlayerRow({
  player: p,
  index,
  players,
  draggedIndex,
  dragOverIndex,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  movePlayer,
  removePlayer,
  updatePlayerName,
}: PlayerTrackerSetupPlayerRowProps) {
  const isDragged = draggedIndex === index;
  const isDragOver = dragOverIndex === index;

  return (
    <div
      data-drag-index={index}
      draggable={true}
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={(e) => handleDragOver(e, index)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, index)}
      onDragEnd={handleDragEnd}
      className={cn(
        "bg-gray-900/60 p-3 rounded-lg border border-gray-800/50 flex items-center justify-between gap-3 transition-all duration-200",
        isDragged && "opacity-40 scale-95 border-clocktower-blood/30 bg-clocktower-blood/5",
        isDragOver && "border-clocktower-townsfolk bg-clocktower-townsfolk/5 translate-y-1 shadow-lg shadow-black/20"
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Drag Handle */}
        <div
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="cursor-grab hover:text-white text-gray-500 p-1 select-none shrink-0"
          title="Drag to seat player"
        >
          <GripVertical size={16} />
        </div>

        {/* Index indicator */}
        <span className="text-[11px] font-mono text-gray-550 shrink-0 select-none">
          #{index + 1}
        </span>

        {/* Player Name Input */}
        <input
          type="text"
          value={p.name}
          onChange={(e) => updatePlayerName(p.id, e.target.value)}
          placeholder="Player Name"
          className="bg-transparent text-sm text-gray-200 font-bold border-b border-transparent hover:border-gray-800 focus:border-clocktower-blood focus:outline-none py-0.5 px-1 flex-1 min-w-0 transition-all"
        />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Reordering buttons (for accessibility/mobile fallback) */}
        <div className="flex flex-col select-none">
          <button
            type="button"
            onClick={() => movePlayer(index, 'up')}
            disabled={index === 0}
            className="text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 p-0.5"
            title="Move Seat Up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => movePlayer(index, 'down')}
            disabled={index === players.length - 1}
            className="text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 p-0.5"
            title="Move Seat Down"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => removePlayer(p.id)}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Remove Player"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
