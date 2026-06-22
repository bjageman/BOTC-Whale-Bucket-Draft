import { describe, it, expect } from 'vitest';
import { assignCharacters } from './assignment';
import type { Player, Role } from '../types';

describe('assignCharacters', () => {
  const mockRoles: Role[] = [
    { id: 'chef', name: 'Chef', team: 'townsfolk' },
    { id: 'empath', name: 'Empath', team: 'townsfolk' },
    { id: 'fortune_teller', name: 'Fortune Teller', team: 'townsfolk' },
    { id: 'legion', name: 'Legion', team: 'demon' },
  ];

  it('should assign Legion to majority but honor Townsfolk preference for good players', () => {
    const players: Player[] = [
      { id: '1', name: 'Alice', isDead: false, preferences: { townsfolk: ['chef'], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '2', name: 'Bob', isDead: false, preferences: { townsfolk: ['empath'], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '3', name: 'Charlie', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: ['legion'], traveler: [] } },
      { id: '4', name: 'David', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: ['legion'], traveler: [] } },
      { id: '5', name: 'Eve', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: ['legion'], traveler: [] } },
    ];

    const result = assignCharacters(players, mockRoles);
    expect(result).not.toBeNull();
    if (!result) return;

    // Check count of Legion
    const legionAssignments = result.filter(r => r.role.id === 'legion');
    // 5 players * 0.6 = 3 Legion
    expect(legionAssignments.length).toBe(3);

    // Verify good players still got their preferred roles
    const chefAssignment = result.find(r => r.role.id === 'chef');
    const empathAssignment = result.find(r => r.role.id === 'empath');

    expect(chefAssignment).toBeDefined();
    expect(empathAssignment).toBeDefined();

    expect(chefAssignment?.player.id).toBe('1'); // Alice preferred chef
    expect(empathAssignment?.player.id).toBe('2'); // Bob preferred empath
  });

  it('should assign Legion to majority even if nobody preferred it (random selection)', () => {
    // 6 players, none prefer Legion, but Legion is the only Demon in mockRoles
    const players: Player[] = [
      { id: '1', name: 'Alice', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '2', name: 'Bob', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '3', name: 'Charlie', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '4', name: 'David', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '5', name: 'Eve', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '6', name: 'Frank', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
    ];

    const result = assignCharacters(players, mockRoles);
    expect(result).not.toBeNull();
    if (!result) return;

    // Check that Legion was assigned to the majority (4 out of 6 players)
    const legionAssignments = result.filter(r => r.role.id === 'legion');
    expect(legionAssignments.length).toBe(4);
  });

  it('should assign a Damsel when a Huntsman is in play', () => {
    const roles: Role[] = [
      { id: 'huntsman', name: 'Huntsman', team: 'townsfolk' },
      { id: 'chef', name: 'Chef', team: 'townsfolk' },
      { id: 'damsel', name: 'Damsel', team: 'outsider' },
      { id: 'poisoner', name: 'Poisoner', team: 'minion' },
      { id: 'imp', name: 'Imp', team: 'demon' },
    ];

    const players: Player[] = [
      { id: '1', name: 'Alice', isDead: false, preferences: { townsfolk: ['huntsman'], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '2', name: 'Bob', isDead: false, preferences: { townsfolk: ['chef'], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '3', name: 'Charlie', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: ['imp'], traveler: [] } },
      { id: '4', name: 'David', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '5', name: 'Eve', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
    ];

    const result = assignCharacters(players, roles);
    expect(result).not.toBeNull();
    if (!result) return;

    const huntsmanAssignment = result.find(r => r.role.id === 'huntsman');
    const damselAssignment = result.find(r => r.role.id === 'damsel');

    expect(huntsmanAssignment).toBeDefined();
    expect(damselAssignment).toBeDefined();
    expect(damselAssignment?.player.id).not.toBe(huntsmanAssignment?.player.id);
  });

  it('should assign a King when a Choirboy is in play', () => {
    const roles: Role[] = [
      { id: 'choirboy', name: 'Choirboy', team: 'townsfolk' },
      { id: 'chef', name: 'Chef', team: 'townsfolk' },
      { id: 'king', name: 'King', team: 'townsfolk' },
      { id: 'poisoner', name: 'Poisoner', team: 'minion' },
      { id: 'imp', name: 'Imp', team: 'demon' },
    ];

    const players: Player[] = [
      { id: '1', name: 'Alice', isDead: false, preferences: { townsfolk: ['choirboy'], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '2', name: 'Bob', isDead: false, preferences: { townsfolk: ['chef'], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '3', name: 'Charlie', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: ['imp'], traveler: [] } },
      { id: '4', name: 'David', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
      { id: '5', name: 'Eve', isDead: false, preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] } },
    ];

    const result = assignCharacters(players, roles);
    expect(result).not.toBeNull();
    if (!result) return;

    const choirboyAssignment = result.find(r => r.role.id === 'choirboy');
    const kingAssignment = result.find(r => r.role.id === 'king');

    expect(choirboyAssignment).toBeDefined();
    expect(kingAssignment).toBeDefined();
    expect(kingAssignment?.player.id).not.toBe(choirboyAssignment?.player.id);
  });
});
