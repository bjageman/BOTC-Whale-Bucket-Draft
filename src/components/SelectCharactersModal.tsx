import React, { useEffect, useMemo } from 'react';
import { X, Shuffle, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Role } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { getDistribution } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  playerCount: number;
  isLightModeActive: boolean;
  onAssign: (selectedRoles: Role[]) => void;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const TEAMS = [
  { key: 'townsfolk', label: '🔵 Townsfolk', color: 'text-clocktower-townsfolk', border: 'border-clocktower-townsfolk/20' },
  { key: 'outsider',  label: '🔵 Outsiders', color: 'text-clocktower-outsider',  border: 'border-clocktower-outsider/20'  },
  { key: 'minion',    label: '🔴 Minions',   color: 'text-clocktower-minion',    border: 'border-clocktower-minion/20'    },
  { key: 'demon',     label: '🔴 Demons',    color: 'text-clocktower-demon',     border: 'border-clocktower-demon/20'     },
] as const;

export function computeBalance(selectedRoles: Role[], playerCount: number) {
  const base = getDistribution(playerCount);

  const has = (id: string) => selectedRoles.some(r => r.id === id);
  const hasDrunk       = has('drunk');

  const counts = {
    townsfolk: selectedRoles.filter(r => r.team === 'townsfolk').length,
    outsider:  selectedRoles.filter(r => r.team === 'outsider').length,
    minion:    selectedRoles.filter(r => r.team === 'minion').length,
    demon:     selectedRoles.filter(r => r.team === 'demon').length,
  };

  const hasLegion      = has('legion');
  const hasRiot        = has('riot');
  const hasAtheist     = has('atheist');
  const hasBaron       = has('baron');
  const hasFangGu      = has('fanggu');
  const hasBalloonist  = has('balloonist');
  const hasHermit      = has('hermit');
  const hasGodfather   = has('godfather');
  const hasLilMonsta   = has('lilmonsta');
  const hasSummoner    = has('summoner');
  const hasLordOfTyphon = has('lordoftyphon');
  const hasKazali      = has('kazali');
  const hasXaan        = has('xaan');
  const hasLunatic     = has('lunatic');
  const hasMarionette  = has('marionette');

  let expectedDemon  = base.demon;
  let expectedMinion = base.minion;
  const modifications: string[] = [];

  if (hasLegion) {
    const L = Math.round(playerCount * 0.6);
    expectedDemon  = L;
    expectedMinion = 0;
    modifications.push(`Legion active (${L} Demons, 0 Minions/Outsiders)`);
  } else if (hasRiot) {
    const D = 1 + base.minion;
    expectedDemon  = D;
    expectedMinion = 0;
    modifications.push(`Riot active (${D} Demons, 0 Minions/Outsiders)`);
  } else if (hasAtheist) {
    expectedDemon  = 0;
    expectedMinion = 0;
    modifications.push("Atheist (No Evil players)");
    if (hasBaron)      modifications.push("Baron (+2 Outsiders)");
    if (hasFangGu)     modifications.push("Fang Gu (+1 Outsider)");
    if (hasBalloonist) modifications.push("Balloonist (0 or +1 Outsider)");
    if (hasHermit)     modifications.push("Hermit (0 or -1 Outsider)");
  } else {
    if (hasLilMonsta)    { expectedMinion += 1; expectedDemon -= 1; modifications.push("Lil' Monsta (+1 Minion, -1 Demon)"); }
    if (hasLordOfTyphon) { expectedMinion += 1; modifications.push("Lord of Typhon (+1 Minion)"); }
    if (hasSummoner)     { expectedDemon  -= 1; modifications.push("Summoner (-1 Demon)"); }
    if (hasLunatic)      modifications.push("Lunatic (0 or +1 Demon)");
    if (hasBaron)        modifications.push("Baron (+2 Outsiders)");
    if (hasFangGu)       modifications.push("Fang Gu (+1 Outsider)");
    if (hasBalloonist)   modifications.push("Balloonist (0 or +1 Outsider)");
    if (hasHermit)       modifications.push("Hermit (0 or -1 Outsider)");
    if (hasGodfather)    modifications.push("Godfather (+1 or -1 Outsider)");
    if (hasMarionette)   modifications.push("Marionette (+1 Townsfolk)");
    if (hasDrunk)        modifications.push("Drunk (+1 Townsfolk)");
  }

  if (hasKazali) { expectedMinion = 0; modifications.push("Kazali (0 Minions)", "Kazali (Any Outsider count)"); }
  if (hasXaan)   modifications.push("Xaan (Any Outsider count)");

  expectedDemon = Math.max(0, expectedDemon);

  // Drunk and Marionette each need 1 extra character in the selection (for the role they impersonate).
  const tfDelta = !hasLegion && !hasRiot ? ((hasDrunk ? 1 : 0) + (hasMarionette ? 1 : 0)) : 0;

  const gfMods   = (hasGodfather  && !hasLegion && !hasRiot) ? [-1, 1] : [0];
  const balMods  = (hasBalloonist && !hasLegion && !hasRiot) ? [0, 1]  : [0];
  const hermMods = (hasHermit     && !hasLegion && !hasRiot) ? [-1, 0] : [0];
  const fixedDelta = (hasLegion || hasRiot) ? 0 : ((hasBaron ? 2 : 0) + (hasFangGu ? 1 : 0));

  const possibleOutsiders = new Set<number>();
  if (hasLegion || hasRiot) {
    possibleOutsiders.add(0);
  } else if (hasKazali || hasXaan) {
    const max = Math.max(0, playerCount - expectedDemon - expectedMinion);
    for (let i = 0; i <= max; i++) possibleOutsiders.add(i);
  } else {
    for (const gf of gfMods) for (const bal of balMods) for (const herm of hermMods) {
      possibleOutsiders.add(Math.max(0, base.outsider + fixedDelta + gf + bal + herm));
    }
  }

  const validOutsiders  = Array.from(possibleOutsiders).sort((a, b) => a - b);
  const validTownsfolk  = validOutsiders.map(out => Math.max(0, playerCount - expectedDemon - expectedMinion - out) + tfDelta);
  const uniqueTownsfolk = Array.from(new Set(validTownsfolk)).sort((a, b) => a - b);

  const isOutsiderValid  = (hasKazali || hasXaan) ? true : validOutsiders.includes(counts.outsider);
  const isTownsfolkValid = (hasKazali || hasXaan) ? true : (isOutsiderValid && counts.townsfolk === playerCount - expectedDemon - expectedMinion - counts.outsider + tfDelta);
  const isDemonValid     = counts.demon  === expectedDemon;
  const isMinionValid    = counts.minion === expectedMinion;

  const expectedOutsiderLabel  = (hasKazali || hasXaan) ? 'any' : validOutsiders.join(' or ');
  const expectedTownsfolkLabel = (hasKazali || hasXaan) ? 'any' : uniqueTownsfolk.join(' or ');

  const jinxWarnings: string[] = [];
  if (has('choirboy') && !has('king'))     jinxWarnings.push("Choirboy in play, but no King selected.");
  if (has('huntsman') && !has('damsel'))   jinxWarnings.push("Huntsman in play, but no Damsel selected.");

  const isValid = isDemonValid && isMinionValid && isOutsiderValid && isTownsfolkValid && jinxWarnings.length === 0;

  return { counts, modifications, validOutsiders, isDemonValid, isMinionValid, isOutsiderValid, isTownsfolkValid, isValid, expectedOutsiderLabel, expectedTownsfolkLabel, expectedDemon, expectedMinion, jinxWarnings };
}

export default function SelectCharactersModal({ isOpen, onClose, roles, playerCount, isLightModeActive, onAssign, selectedIds, setSelectedIds }: Props) {
  const assignableRoles = useMemo(() => roles.filter(r => r.team !== 'traveler'), [roles]);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const byTeam = useMemo(
    () => Object.fromEntries(TEAMS.map(t => [t.key, assignableRoles.filter(r => r.team === t.key)])),
    [assignableRoles]
  );

  const selectedRoles = useMemo(() => assignableRoles.filter(r => selectedIds.has(r.id)), [assignableRoles, selectedIds]);

  const balance = useMemo(
    () => playerCount >= 5 ? computeBalance(selectedRoles, playerCount) : null,
    [selectedRoles, playerCount]
  );

  const toggleRole = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTeam = (teamKey: string) => {
    const teamRoles = byTeam[teamKey as keyof typeof byTeam];
    const allSelected = teamRoles.every(r => selectedIds.has(r.id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) teamRoles.forEach(r => next.delete(r.id));
      else teamRoles.forEach(r => next.add(r.id));
      return next;
    });
  };

  const selectAll   = () => setSelectedIds(new Set(assignableRoles.map(r => r.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const canAssign = playerCount >= 5 && selectedIds.size >= playerCount;

  const handleAssign = () => { onAssign(selectedRoles); onClose(); };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-2xl rounded-lg flex flex-col shadow-2xl max-h-[90vh]",
          isLightModeActive ? "bg-[#fdfaf2] border border-amber-900/10 text-gray-800" : "bg-gray-900 border border-gray-800 text-gray-150"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center gap-4 px-5 pt-5 pb-4 shrink-0">
          <h3 className={cn("font-display font-bold text-xl tracking-wider", isLightModeActive ? "text-clocktower-blood" : "text-white")}>
            Select Characters to Assign
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={cn("p-1.5 rounded-full transition-colors", isLightModeActive ? "text-gray-500 hover:bg-gray-200 hover:text-gray-800" : "text-gray-400 hover:bg-gray-800 hover:text-white")}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1 px-5 space-y-4 pb-4 pt-1">
          {/* Global select controls */}
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-semibold", isLightModeActive ? "text-gray-600" : "text-gray-400")}>
              {selectedIds.size} of {assignableRoles.length} characters
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className={cn("text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors", isLightModeActive ? "border-gray-300 text-gray-600 hover:bg-gray-100" : "border-gray-700 text-gray-400 hover:bg-gray-800")}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className={cn("text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors", isLightModeActive ? "border-gray-300 text-gray-600 hover:bg-gray-100" : "border-gray-700 text-gray-400 hover:bg-gray-800")}
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Role list by team */}
          <div className="space-y-4">
            {TEAMS.map(({ key, label, color, border }) => {
              const teamRoles = byTeam[key as keyof typeof byTeam];
              if (teamRoles.length === 0) return null;
              const allTeamSelected = teamRoles.every(r => selectedIds.has(r.id));

              const actual   = balance?.counts[key as keyof typeof balance.counts] ?? 0;
              const expected = balance
                ? key === 'townsfolk' ? balance.expectedTownsfolkLabel
                : key === 'outsider'  ? balance.expectedOutsiderLabel
                : key === 'minion'    ? String(balance.expectedMinion)
                :                       String(balance.expectedDemon)
                : null;
              const isValid = balance
                ? key === 'townsfolk' ? balance.isTownsfolkValid
                : key === 'outsider'  ? balance.isOutsiderValid
                : key === 'minion'    ? balance.isMinionValid
                :                       balance.isDemonValid
                : false;

              return (
                <div key={key}>
                  <div className={cn("flex items-center justify-between border-b pb-1 mb-2", border)}>
                    <h4 className={cn("text-xs uppercase font-bold tracking-wider flex items-center gap-2", color)}>
                      {label}
                      {expected !== null && (
                        <span className={cn(
                          "font-mono font-bold normal-case tracking-normal text-[11px]",
                          isValid ? color : (isLightModeActive ? "text-amber-700" : "text-yellow-500")
                        )}>
                          {actual}/{expected}
                        </span>
                      )}
                    </h4>
                    <button
                      type="button"
                      onClick={() => toggleTeam(key)}
                      className={cn("text-[10px] font-semibold transition-colors opacity-70 hover:opacity-100", color)}
                    >
                      {allTeamSelected ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {teamRoles.map(role => {
                      const checked = selectedIds.has(role.id);
                      return (
                        <label
                          key={role.id}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all select-none",
                            checked
                              ? isLightModeActive
                                ? "border-gray-400 bg-white shadow-sm"
                                : "border-gray-600 bg-gray-800"
                              : isLightModeActive
                                ? "border-gray-200 bg-white/50 opacity-40"
                                : "border-gray-800 bg-gray-955/40 opacity-40"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRole(role.id)}
                            className="shrink-0 w-3.5 h-3.5"
                          />
                          <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                            <img
                              src={`/icons/${role.id}.svg`}
                              alt=""
                              className="w-3.5 h-3.5 object-contain"
                              onError={e => { e.currentTarget.parentElement!.style.display = 'none'; }}
                            />
                          </span>
                          <span className={cn("font-semibold text-xs truncate", isLightModeActive ? "text-gray-900" : "text-gray-100")}>
                            {role.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={cn("px-5 py-4 border-t shrink-0 space-y-3", isLightModeActive ? "border-gray-200" : "border-gray-800")}>
          {balance && (balance.modifications.length > 0 || balance.jinxWarnings.length > 0) && (
            <div className="space-y-1.5">
              {balance.modifications.map((m, idx) => (
                <span key={idx} className={cn(
                  "inline-block mr-1 text-[9px] border px-1.5 py-0.5 rounded font-medium",
                  isLightModeActive ? "bg-clocktower-blood/5 border-clocktower-blood/20 text-clocktower-blood" : "bg-clocktower-blood/10 border-clocktower-blood/30 text-clocktower-parchment/80"
                )}>
                  {m}
                </span>
              ))}
              {balance.jinxWarnings.map((w, idx) => (
                <div key={idx} className={cn("text-[10px] flex items-center gap-1 font-medium", isLightModeActive ? "text-amber-700" : "text-yellow-500")}>
                  <AlertTriangle size={10} /> {w}
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleAssign}
            disabled={!canAssign}
            className="w-full bg-clocktower-blood hover:bg-red-800 text-white py-2.5 rounded text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle size={14} /> Randomly Assign
          </button>
        </div>
      </div>
    </div>
  );
}
