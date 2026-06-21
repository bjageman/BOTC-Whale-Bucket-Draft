import React from 'react';
import { Plus, Shuffle, Upload } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Player, Role } from '../types';
import rolesData from '../roles.json';
import { getDistribution } from '../constants';
import StandardSetupPlayerRow from './StandardSetupPlayerRow';

interface StandardSetupPhaseProps {
  players: Player[];
  customScriptRoles: Role[] | null;
  scriptName: string;
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleScriptUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearCustomScript: () => void;
  randomlyAssignRoles: () => void;
  setActivePlayerId: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  togglePlayerTheDrunk: (id: string) => void;
  togglePlayerTheMarionette: (id: string) => void;
  togglePlayerTheLunatic: (id: string) => void;
  togglePlayerTheLilMonsta: (id: string) => void;
  allAssigned: boolean;
  setPhase: (phase: 'setup' | 'game') => void;
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
}

export default function StandardSetupPhase({
  players,
  customScriptRoles,
  scriptName,
  newPlayerName,
  setNewPlayerName,
  addPlayer,
  removePlayer,
  updatePlayerName,
  fileInputRef,
  handleScriptUpload,
  clearCustomScript,
  randomlyAssignRoles,
  setActivePlayerId,
  setSearchTerm,
  togglePlayerTheDrunk,
  togglePlayerTheMarionette,
  togglePlayerTheLunatic,
  togglePlayerTheLilMonsta,
  allAssigned,
  setPhase,
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
}: StandardSetupPhaseProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[5fr_3fr] md:grid-rows-[auto_1fr] md:items-start animate-fadeIn">
      {/* Section A: Script & Randomization */}
      <div className="md:col-start-2 md:row-start-1 space-y-6 w-full">
        {/* Script Upload & Randomization Panel */}
        <section className="bg-gray-900/50 p-4 rounded-lg border border-gray-800/80 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-555 uppercase tracking-wider">Active Setup Script</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1",
                customScriptRoles 
                  ? "bg-clocktower-blood/10 border-clocktower-blood/40 text-clocktower-blood" 
                  : "bg-gray-950 border-gray-800 text-gray-400"
              )}>
                {customScriptRoles ? "📜" : "🌐"} {scriptName}
              </span>
              {customScriptRoles && (
                <span className="text-[10px] text-gray-500 font-medium">
                  ({customScriptRoles.length} roles loaded)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <input
              id="script-upload-input"
              type="file"
              ref={fileInputRef}
              onChange={handleScriptUpload}
              accept=".json"
              className="hidden"
            />
            <button
              id="script-upload-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-750 text-gray-300 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Upload size={14} /> Upload Script (.json)
            </button>
            {customScriptRoles && (
              <button
                id="script-reset-button"
                type="button"
                onClick={clearCustomScript}
                className="w-full text-center bg-transparent hover:bg-gray-800 border border-gray-800 text-gray-550 hover:text-gray-455 py-1.5 rounded text-xs font-semibold transition-all"
              >
                Reset to Default
              </button>
            )}
            
            <div className="border-t border-gray-800/60 my-1" />
            
            <button
              id="random-assign-button"
              type="button"
              onClick={randomlyAssignRoles}
              className="w-full bg-clocktower-blood hover:bg-red-800 text-white py-2.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={players.length < 5}
              title="Randomly assign roles to all players based on the active script, keeping to standard distribution rules"
            >
              <Shuffle size={14} /> Randomly Assign
            </button>
          </div>
        </section>
      </div>

      {/* Section B: Seating & Players list */}
      <div className="md:col-start-1 md:row-start-1 md:row-span-2 space-y-6 w-full">
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Players & Roles ({players.length})</h2>

          <div className="flex gap-2 mb-4">
            <input
              id="new-player-input"
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              disabled={players.length >= 20}
              placeholder={players.length >= 20 ? "Maximum players reached (20)" : "Enter player name in seating order..."}
              autoCapitalize="words"
              className="flex-1 bg-gray-955 border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-clocktower-blood text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              id="add-player-button"
              onClick={addPlayer} 
              disabled={players.length >= 20}
              className={cn(
                "px-4 py-2 rounded transition-colors text-white",
                players.length >= 20 
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50 border border-gray-800" 
                  : "bg-clocktower-blood hover:bg-red-800 border border-clocktower-blood"
              )}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2.5">
            {players.map((p, index) => (
              <StandardSetupPlayerRow
                key={p.id}
                player={p}
                index={index}
                players={players}
                customScriptRoles={customScriptRoles}
                draggedIndex={draggedIndex}
                dragOverIndex={dragOverIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                handleTouchStart={handleTouchStart}
                handleTouchMove={handleTouchMove}
                handleTouchEnd={handleTouchEnd}
                movePlayer={movePlayer}
                removePlayer={removePlayer}
                updatePlayerName={updatePlayerName}
                setActivePlayerId={setActivePlayerId}
                setSearchTerm={setSearchTerm}
                togglePlayerTheDrunk={togglePlayerTheDrunk}
                togglePlayerTheMarionette={togglePlayerTheMarionette}
                togglePlayerTheLunatic={togglePlayerTheLunatic}
                togglePlayerTheLilMonsta={togglePlayerTheLilMonsta}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Section C: Distribution & Validation & Open Grimoire */}
      <div className="md:col-start-2 md:row-start-2 space-y-6 w-full">


        {/* Distribution Card */}
        <section id="standard-base-distribution" className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Standard Base Distribution</h3>
          {players.length >= 5 ? (() => {
            const travelerCountInPlay = players.filter(p => {
              if (!p.roleId) return false;
              const r = (rolesData as Role[]).find(role => role.id === p.roleId);
              return r?.team === 'traveler';
            }).length;
            const baseCount = players.length - travelerCountInPlay;
            const dist = getDistribution(baseCount);
            return (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                  <div className="p-2 rounded bg-gray-955/40 border border-gray-800 text-clocktower-townsfolk">
                    TF: {dist.townsfolk}
                  </div>
                  <div className="p-2 rounded bg-gray-955/40 border border-gray-800 text-clocktower-outsider">
                    O: {dist.outsider}
                  </div>
                  <div className="p-2 rounded bg-gray-955/40 border border-gray-800 text-clocktower-minion">
                    M: {dist.minion}
                  </div>
                  <div className="p-2 rounded bg-gray-955/40 border border-gray-800 text-clocktower-demon">
                    D: {dist.demon}
                  </div>
                </div>
                {(dist.traveler > 0 || travelerCountInPlay > 0) && (
                  <div className="text-center text-xs font-semibold p-2 rounded bg-gray-955/40 border border-gray-800 text-clocktower-traveler">
                    Travelers: {travelerCountInPlay > 0 ? travelerCountInPlay : dist.traveler}
                  </div>
                )}
              </div>
            );
          })() : (
            <p className="text-sm text-gray-500 italic">Add at least 5 players to view distribution.</p>
          )}
        </section>


        <button
          id="open-grimoire-button"
          disabled={!allAssigned}
          onClick={() => {
            setPhase('game');
            setTimeout(() => {
              const grimoireElement = document.getElementById('grimoire-board-container');
              grimoireElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          className="w-full bg-clocktower-blood hover:bg-red-800 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/40 flex items-center justify-center gap-2"
        >
          Open Grimoire
        </button>
      </div>
    </div>
  );
}
