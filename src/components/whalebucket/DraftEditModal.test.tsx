import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import WhaleBucketDraftEditModal from './DraftEditModal';
import type { Player } from '../../WhaleBucket';

describe('WhaleBucketDraftEditModal', () => {
  const alice: Player = {
    id: 'p1',
    name: 'Alice',
    isDead: false,
    preferences: { townsfolk: [], outsider: [], minion: [], demon: [], traveler: [] },
  };

  const defaultProps = {
    activeDraftPlayerId: 'p1',
    players: [alice],
    searchTerm: '',
    setSearchTerm: vi.fn(),
    updatePlayerRole: vi.fn(),
    togglePlayerTheDrunk: vi.fn(),
    togglePlayerTheMarionette: vi.fn(),
    togglePlayerTheLunatic: vi.fn(),
    togglePlayerTheLilMonsta: vi.fn(),
    onClose: vi.fn(),
  };

  it('never renders a solid-dark background class while in light mode', () => {
    const { container } = render(<WhaleBucketDraftEditModal {...defaultProps} isLightModeActive={true} />);
    const modal = container.querySelector('#whalebucket-draft-edit-modal')!;
    expect(modal.className).not.toContain('bg-gray-900');
    expect(modal.className).toContain('bg-[#fdfaf2]');
  });

  it('uses the dark background class when light mode is off', () => {
    const { container } = render(<WhaleBucketDraftEditModal {...defaultProps} isLightModeActive={false} />);
    const modal = container.querySelector('#whalebucket-draft-edit-modal')!;
    expect(modal.className).toContain('bg-gray-900');
  });
});
