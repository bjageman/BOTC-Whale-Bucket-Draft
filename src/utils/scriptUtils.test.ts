import { describe, it, expect } from 'vitest';
import { expandVillageIdiots } from './scriptUtils';
import type { Role } from '../types';

const r = (id: string, team: Role['team']): Role => ({ id, name: id, team });
const vi = r('villageidiot', 'townsfolk');

describe('expandVillageIdiots', () => {
  it('returns the list unchanged when no Village Idiot is present', () => {
    const roles = [r('imp', 'demon'), r('poisoner', 'minion'), r('washerwoman', 'townsfolk')];
    expect(expandVillageIdiots(roles)).toEqual(roles);
  });

  it('inserts villageidiot2 and villageidiot3 right after villageidiot', () => {
    const roles = [r('washerwoman', 'townsfolk'), vi, r('imp', 'demon')];
    const result = expandVillageIdiots(roles);
    expect(result.map(r => r.id)).toEqual(['washerwoman', 'villageidiot', 'villageidiot2', 'villageidiot3', 'imp']);
  });

  it('inserted entries have the correct team and name', () => {
    const result = expandVillageIdiots([vi]);
    expect(result).toHaveLength(3);
    expect(result[1]).toMatchObject({ id: 'villageidiot2', name: 'Village Idiot', team: 'townsfolk' });
    expect(result[2]).toMatchObject({ id: 'villageidiot3', name: 'Village Idiot', team: 'townsfolk' });
  });

  it('does not mutate the original array', () => {
    const roles = [vi, r('imp', 'demon')];
    const original = [...roles];
    expandVillageIdiots(roles);
    expect(roles).toEqual(original);
  });

});
