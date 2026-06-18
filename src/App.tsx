import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Search, RefreshCcw, Check, AlertTriangle } from 'lucide-react';
import rolesData from './roles.json';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Role {
  id: string;
  name: string;
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon';
}

interface Player {
  id: string;
  name: string;
  type: 'townsfolk' | 'outsider' | 'minion' | 'demon';
  roleId?: string;
  isDead: boolean;
  isDrunk: boolean;
}

type Phase = 'setup' | 'draft' | 'game';

const DISTRIBUTION: Record<number, { townsfolk: number; outsider: number; minion: number; demon: number }> = {
  5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
  6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
  7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
  8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
  9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
  10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
  11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
  12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
  13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
  14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
  15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<Phase>('setup');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDraftPlayerId, setActiveDraftPlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('whale-bucket-game');
    if (saved) {
      const { players: p, phase: ph } = JSON.parse(saved);
      setPlayers(p);
      setPhase(ph);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('whale-bucket-game', JSON.stringify({ players, phase }));
  }, [players, phase]);

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayerName.trim(),
      type: 'townsfolk',
      isDead: false,
      isDrunk: false,
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayerType = (id: string, type: Player['type']) => {
    setPlayers(players.map(p => p.id === id ? { ...p, type } : p));
  };

  const updatePlayerRole = (id: string, roleId: string) => {
    setPlayers(players.map(p => {
      if (p.id === id) {
        const isDuplicate = players.some(other => other.id !== id && other.roleId === roleId);
        return { ...p, roleId, isDrunk: isDuplicate };
      }
      return p;
    }));
  };

  const togglePlayerDead = (id: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, isDead: !p.isDead } : p));
  };

  const togglePlayerDrunk = (id: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, isDrunk: !p.isDrunk } : p));
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset the game?')) {
      setPlayers([]);
      setPhase('setup');
      setActiveDraftPlayerId(null);
      setSearchTerm('');
      localStorage.removeItem('whale-bucket-game');
    }
  };

  const distribution = DISTRIBUTION[players.length] || { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
  const counts = players.reduce((acc, p) => {
    acc[p.type]++;
    return acc;
  }, { townsfolk: 0, outsider: 0, minion: 0, demon: 0 });

  const filteredRoles = useMemo(() => {
    return (rolesData as Role[]).filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-clocktower-night text-clocktower-parchment p-4 font-sans max-w-lg mx-auto">
      <header className="flex justify-between items-center mb-6 border-b border-clocktower-blood pb-2">
        <h1 className="text-2xl font-bold text-clocktower-blood tracking-wide">Whale Bucket</h1>
        <button onClick={resetGame} className="p-2 text-gray-500 hover:text-white transition-colors">
          <RefreshCcw size={20} />
        </button>
      </header>

      {phase === 'setup' && (
        <div className="space-y-6">
          <section>
            <h2 className="text-xl mb-4 font-semibold text-gray-300">1. Setup Seating ({players.length})</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Enter player name in seating order..."
                className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-clocktower-blood"
              />
              <button onClick={addPlayer} className="bg-clocktower-blood hover:bg-red-800 px-4 py-2 rounded transition-colors">
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {players.map((p, index) => (
                <div key={p.id} className="flex items-center gap-2 bg-gray-900/60 p-2.5 rounded border border-gray-800/50">
                  <span className="text-xs text-gray-600 font-mono w-5">{index + 1}</span>
                  <span className="flex-1 font-medium">{p.name}</span>
                  <select
                    value={p.type}
                    onChange={(e) => updatePlayerType(p.id, e.target.value as Player['type'])}
                    className={cn(
                      "bg-gray-800 border border-gray-700 rounded text-xs p-1 font-semibold outline-none",
                      p.type === 'townsfolk' && "text-clocktower-townsfolk border-clocktower-townsfolk/30",
                      p.type === 'outsider' && "text-clocktower-outsider border-clocktower-outsider/30",
                      p.type === 'minion' && "text-clocktower-minion border-clocktower-minion/30",
                      p.type === 'demon' && "text-clocktower-demon border-clocktower-demon/30",
                    )}
                  >
                    <option value="townsfolk">Townsfolk</option>
                    <option value="outsider">Outsider</option>
                    <option value="minion">Minion</option>
                    <option value="demon">Demon</option>
                  </select>
                  <button onClick={() => removePlayer(p.id)} className="text-gray-600 hover:text-red-500 p-1 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-900 p-4 rounded border border-gray-800/80">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Recommended Character Distribution</h3>
            {players.length >= 5 ? (
              <div className="grid grid-cols-4 gap-2 text-center text-sm font-semibold">
                <div className={cn("p-2 rounded bg-gray-950/40 border border-gray-800", counts.townsfolk === distribution.townsfolk ? "text-clocktower-townsfolk border-clocktower-townsfolk/20" : "text-gray-400")}>
                  TS: {counts.townsfolk}/{distribution.townsfolk}
                </div>
                <div className={cn("p-2 rounded bg-gray-950/40 border border-gray-800", counts.outsider === distribution.outsider ? "text-clocktower-outsider border-clocktower-outsider/20" : "text-gray-400")}>
                  O: {counts.outsider}/{distribution.outsider}
                </div>
                <div className={cn("p-2 rounded bg-gray-950/40 border border-gray-800", counts.minion === distribution.minion ? "text-clocktower-minion border-clocktower-minion/20" : "text-gray-400")}>
                  M: {counts.minion}/{distribution.minion}
                </div>
                <div className={cn("p-2 rounded bg-gray-950/40 border border-gray-800", counts.demon === distribution.demon ? "text-clocktower-demon border-clocktower-demon/20" : "text-gray-400")}>
                  D: {counts.demon}/{distribution.demon}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Add at least 5 players to see distribution guidance.</p>
            )}
          </section>

          <button
            disabled={players.length < 5}
            onClick={() => setPhase('draft')}
            className="w-full bg-clocktower-blood hover:bg-red-800 text-white py-3 rounded font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/40"
          >
            Start Character Draft
          </button>
        </div>
      )}

      {phase === 'draft' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-300">2. Night 1 Character Selection</h2>
          <div className="space-y-2.5">
            {players.map(p => (
              <div key={p.id} className="bg-gray-900 p-3.5 rounded border border-gray-800/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base text-gray-200">{p.name}</span>
                  <span className={cn(
                    "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border",
                    p.type === 'townsfolk' && "text-clocktower-townsfolk border-clocktower-townsfolk/40 bg-clocktower-townsfolk/5",
                    p.type === 'outsider' && "text-clocktower-outsider border-clocktower-outsider/40 bg-clocktower-outsider/5",
                    p.type === 'minion' && "text-clocktower-minion border-clocktower-minion/40 bg-clocktower-minion/5",
                    p.type === 'demon' && "text-clocktower-demon border-clocktower-demon/40 bg-clocktower-demon/5",
                  )}>
                    {p.type}
                  </span>
                </div>

                {!p.roleId ? (
                  <div className="relative">
                    <div 
                      onClick={() => setActiveDraftPlayerId(p.id)}
                      className="flex items-center bg-gray-800/50 rounded px-3 py-2 border border-gray-700/60 cursor-text"
                    >
                      <Search size={14} className="text-gray-500 mr-2" />
                      <input
                        type="text"
                        placeholder="Tap to search and select character..."
                        className="bg-transparent flex-1 outline-none text-sm text-gray-200 pointer-events-none"
                        value={activeDraftPlayerId === p.id ? searchTerm : ''}
                        onChange={(e) => {
                          if (activeDraftPlayerId === p.id) {
                            setSearchTerm(e.target.value);
                          }
                        }}
                        readOnly={activeDraftPlayerId !== p.id}
                      />
                    </div>
                    
                    {activeDraftPlayerId === p.id && (
                      <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-gray-900 border border-gray-800 w-full max-w-sm rounded-lg p-4 space-y-3 max-h-[80vh] flex flex-col shadow-2xl">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-300">Role for {p.name}</h3>
                            <button onClick={() => { setActiveDraftPlayerId(null); setSearchTerm(''); }} className="text-xs text-gray-500 underline">Close</button>
                          </div>
                          <div className="flex items-center bg-gray-800 rounded px-3 py-2 border border-gray-700">
                            <Search size={14} className="text-gray-500 mr-2" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Type role name..."
                              className="bg-transparent flex-1 outline-none text-sm text-white"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 border border-gray-800 rounded bg-gray-950/40 divide-y divide-gray-800/60">
                            {filteredRoles.map(role => (
                              <button
                                key={role.id}
                                onClick={() => {
                                  updatePlayerRole(p.id, role.id);
                                  setActiveDraftPlayerId(null);
                                  setSearchTerm('');
                                }}
                                className="w-full text-left px-3 py-2.5 hover:bg-gray-800 text-sm transition-colors flex justify-between items-center"
                              >
                                <span className={cn(
                                  "font-medium",
                                  role.team === 'townsfolk' && "text-clocktower-townsfolk",
                                  role.team === 'outsider' && "text-clocktower-outsider",
                                  role.team === 'minion' && "text-clocktower-minion",
                                  role.team === 'demon' && "text-clocktower-demon",
                                )}>
                                  {role.name}
                                </span>
                                <span className="text-[10px] uppercase font-mono text-gray-600">{role.team[0]}</span>
                              </button>
                            ))}
                            {filteredRoles.length === 0 && (
                              <div className="p-3 text-xs text-gray-500 italic text-center">No matching roles found.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-800/40 px-3 py-2 rounded border border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold text-base",
                        (rolesData as any).find((r: any) => r.id === p.roleId)?.team === 'townsfolk' && "text-clocktower-townsfolk",
                        (rolesData as any).find((r: any) => r.id === p.roleId)?.team === 'outsider' && "text-clocktower-outsider",
                        (rolesData as any).find((r: any) => r.id === p.roleId)?.team === 'minion' && "text-clocktower-minion",
                        (rolesData as any).find((r: any) => r.id === p.roleId)?.team === 'demon' && "text-clocktower-demon",
                      )}>
                        {(rolesData as any).find((r: any) => r.id === p.roleId)?.name}
                      </span>
                      {p.isDrunk && (
                        <span className="flex items-center gap-1 text-[9px] bg-yellow-950 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-800/50 font-bold font-mono">
                          <AlertTriangle size={10} /> DUPLICATE
                        </span>
                      )}
                    </div>
                    <button onClick={() => updatePlayerRole(p.id, '')} className="text-gray-500 hover:text-gray-300 text-xs font-medium underline">
                      Change
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setPhase('setup')} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded font-bold transition-colors">Back</button>
            <button
              disabled={players.some(p => !p.roleId)}
              onClick={() => setPhase('game')}
              className="flex-[2] bg-clocktower-blood hover:bg-red-800 text-white py-3 rounded font-bold transition-all disabled:opacity-40 shadow-lg shadow-black/40"
            >
              Open Grimoire
            </button>
          </div>
        </div>
      )}

      {phase === 'game' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-800/80 pb-2">
            <h2 className="text-xl font-semibold text-gray-300">3. The Circular Grimoire</h2>
            <div className="flex gap-2 text-[10px] font-bold tracking-wider text-gray-500">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-clocktower-townsfolk" /> TS</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-clocktower-outsider" /> OUT</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-clocktower-minion" /> MIN</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-clocktower-demon" /> DEM</span>
            </div>
          </div>
          
          {/* Circular Arrangement Grid Container */}
          <div className="relative w-full aspect-square bg-gray-950/40 rounded-full border border-gray-900/60 shadow-inner flex items-center justify-center overflow-hidden my-4 max-w-[380px] mx-auto">
            
            {/* Center Focal Decorative Accent */}
            <div className="absolute w-20 h-20 rounded-full border border-clocktower-blood/10 flex flex-col items-center justify-center pointer-events-none bg-clocktower-night/30">
              <span className="text-[10px] text-clocktower-blood/40 font-serif tracking-widest font-bold">BOTC</span>
              <span className="text-[8px] text-gray-700 font-mono mt-0.5">NIGHT</span>
            </div>

            {players.map((p, index) => {
              // Calculate angles for absolute circular positioning (0 degrees is top center)
              const total = players.length;
              const angle = (index * (360 / total) - 90) * (Math.PI / 180);
              
              // Define positioning percentage offset from the circle center
              const radiusPercent = 36; 
              const leftPos = 50 + radiusPercent * Math.cos(angle);
              const topPos = 50 + radiusPercent * Math.sin(angle);

              const roleObj = (rolesData as any).find((r: any) => r.id === p.roleId);

              return (
                <div 
                  key={p.id}
                  style={{
                    position: 'absolute',
                    left: `${leftPos}%`,
                    top: `${topPos}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="z-10 group"
                >
                  {/* Compact Player Circular Interactive Node */}
                  <div className="relative flex flex-col items-center">
                    <button
                      onClick={() => togglePlayerDead(p.id)}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center transition-all shadow-md relative",
                        p.isDead 
                          ? "bg-black border-gray-800 text-gray-600 scale-95 opacity-50" 
                          : "bg-gray-900 border-gray-700 text-clocktower-parchment hover:border-gray-500"
                      )}
                    >
                      {/* Character Type Color Stripe Dot at the top edge */}
                      <div className={cn(
                        "absolute top-0.5 w-1.5 h-1.5 rounded-full shadow-xs",
                        roleObj?.team === 'townsfolk' && "bg-clocktower-townsfolk",
                        roleObj?.team === 'outsider' && "bg-clocktower-outsider",
                        roleObj?.team === 'minion' && "bg-clocktower-minion",
                        roleObj?.team === 'demon' && "bg-clocktower-demon",
                      )} />

                      {/* Initials / First 2 letters */}
                      <span className={cn("text-xs font-bold font-sans tracking-tighter mt-1", p.isDead && "line-through text-gray-700")}>
                        {p.name.substring(0, 3)}
                      </span>

                      {/* Tiny abbreviated character indicator */}
                      <span className={cn(
                        "text-[8px] font-semibold truncate max-w-[40px] leading-none text-gray-400 mt-0.5 px-0.5",
                        roleObj?.team === 'townsfolk' && "text-clocktower-townsfolk/80",
                        roleObj?.team === 'outsider' && "text-clocktower-outsider/80",
                        roleObj?.team === 'minion' && "text-clocktower-minion/80",
                        roleObj?.team === 'demon' && "text-clocktower-demon/80",
                        p.isDead && "text-gray-700"
                      )}>
                        {roleObj?.name.substring(0, 4)}
                      </span>
                    </button>

                    {/* Drunk Ribbon Anchor Badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayerDrunk(p.id);
                      }}
                      className={cn(
                        "absolute -bottom-1 text-[7px] font-extrabold px-1 rounded scale-90 border transition-all z-20 shadow-xs",
                        p.isDrunk 
                          ? "bg-yellow-600 border-yellow-700 text-black font-black" 
                          : "bg-gray-900/90 border-gray-800 text-gray-600 hover:text-gray-400"
                      )}
                    >
                      DRK
                    </button>

                    {/* Popover Floating Label for rich description upon tap or look */}
                    <div className="absolute top-12 scale-0 group-hover:scale-100 bg-gray-900/95 border border-gray-800 p-2 rounded text-center shadow-xl transition-all z-30 pointer-events-none min-w-[100px]">
                      <p className="font-bold text-xs text-white">{p.name}</p>
                      <p className={cn(
                        "text-[10px] font-medium",
                        roleObj?.team === 'townsfolk' && "text-clocktower-townsfolk",
                        roleObj?.team === 'outsider' && "text-clocktower-outsider",
                        roleObj?.team === 'minion' && "text-clocktower-minion",
                        roleObj?.team === 'demon' && "text-clocktower-demon",
                      )}>{roleObj?.name}</p>
                      <p className="text-[8px] text-gray-500 italic mt-0.5">{p.isDead ? 'Dead' : 'Alive'} {p.isDrunk ? '(Drunk)' : ''}</p>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

          {/* Fallback Grid Reference list underneath the circle for quick manual lookups */}
          <div className="bg-gray-900/40 rounded border border-gray-800/80 p-3 space-y-1.5 max-h-48 overflow-y-auto">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Grimoire Ledger Reference</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {players.map((p, index) => {
                const rObj = (rolesData as any).find((r: any) => r.id === p.roleId);
                return (
                  <div key={p.id} className={cn("flex items-center gap-1.5 py-0.5 px-1 rounded bg-gray-950/20 border border-gray-900/40", p.isDead && "opacity-45")}>
                    <span className="text-[9px] text-gray-600 font-mono w-4">{index + 1}</span>
                    <span className={cn("font-medium truncate flex-1", p.isDead && "line-through text-gray-500")}>{p.name}</span>
                    <span className={cn(
                      "font-semibold text-[10px]",
                      rObj?.team === 'townsfolk' && "text-clocktower-townsfolk",
                      rObj?.team === 'outsider' && "text-clocktower-outsider",
                      rObj?.team === 'minion' && "text-clocktower-minion",
                      rObj?.team === 'demon' && "text-clocktower-demon",
                    )}>{rObj?.name.substring(0, 6)}..</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setPhase('draft')} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded font-bold transition-colors">Return to Draft Screen</button>
        </div>
      )}
    </div>
  );
}
