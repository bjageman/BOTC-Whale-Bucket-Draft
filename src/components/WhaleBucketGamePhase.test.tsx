import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WhaleBucketGamePhase from './WhaleBucketGamePhase';
import type { Player } from '../WhaleBucket';

describe('WhaleBucketGamePhase - Script Modal Integration', () => {
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Alice',
      roleId: 'washerwoman',
      isDead: false,
      preferences: {
        townsfolk: [],
        outsider: [],
        minion: [],
        demon: [],
        traveler: [],
      },
    },
    {
      id: '2',
      name: 'Bob',
      roleId: 'poisoner',
      isDead: false,
      preferences: {
        townsfolk: [],
        outsider: [],
        minion: [],
        demon: [],
        traveler: [],
      },
    },
  ];

  const defaultProps = {
    players: mockPlayers,
    timeOfDay: 'night' as const,
    dayNumber: 1,
    newTravelerName: '',
    newTravelerRoleId: 'beggar',
    isLightModeActive: false,
    draggedIndex: null,
    dragOverIndex: null,
    handleMouseDown: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDrop: vi.fn(),
    handleDragEnd: vi.fn(),
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
    setSelectedPlayerId: vi.fn(),
    toggleTimeOfDay: vi.fn(),
    addTravelerGamePhase: vi.fn(),
    setNewTravelerName: vi.fn(),
    setNewTravelerRoleId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders active script button with correct counts', () => {
    render(<WhaleBucketGamePhase {...defaultProps} />);

    // Should display the button with "Active Script"
    const scriptButton = screen.getByText(/Active Script/i).closest('button');
    expect(scriptButton).toBeInTheDocument();

    // Since washerwoman (TF) and poisoner (Minion) are active:
    // Should display stats: 1 TF / 0 O / 1 M / 0 D
    expect(screen.getByText('1 TF / 0 O / 1 M / 0 D')).toBeInTheDocument();
  });

  it('opens modal on script button click and displays active characters sorted by team', () => {
    render(<WhaleBucketGamePhase {...defaultProps} />);

    const scriptButton = screen.getByText(/Active Script/i).closest('button');
    fireEvent.click(scriptButton!);

    // Modal should be open
    expect(screen.getByRole('heading', { name: /Active Script/i })).toBeInTheDocument();

    const modalContainer = screen.getByPlaceholderText('Search character by name or type...').closest('.max-w-2xl') as HTMLElement;
    const modal = within(modalContainer);

    // Should display Townsfolk header with count
    expect(modal.getByText(/Townsfolk/i)).toBeInTheDocument();
    // Washerwoman should be listed in the townsfolk list
    expect(modal.getByText('Washerwoman')).toBeInTheDocument();

    // Should display Minions header with count
    expect(modal.getByText(/Minions/i)).toBeInTheDocument();
    // Poisoner should be listed
    expect(modal.getByText('Poisoner')).toBeInTheDocument();

    // Demons and Outsiders should not be listed as headers (counts are 0)
    expect(modal.queryByText(/Demons/i)).toBeNull();
    expect(modal.queryByText(/Outsiders/i)).toBeNull();
  });

  it('opens character details modal when character is clicked', () => {
    render(<WhaleBucketGamePhase {...defaultProps} />);

    const scriptButton = screen.getByText(/Active Script/i).closest('button');
    fireEvent.click(scriptButton!);

    const modalContainer = screen.getByPlaceholderText('Search character by name or type...').closest('.max-w-2xl') as HTMLElement;
    const modal = within(modalContainer);

    // Click on Washerwoman button inside the modal
    const washerwomanBtn = modal.getByText('Washerwoman').closest('button');
    expect(washerwomanBtn).toBeInTheDocument();
    fireEvent.click(washerwomanBtn!);

    // Ability details modal should open
    expect(screen.getByText('townsfolk', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('You start knowing that 1 of 2 players is a particular Townsfolk.')).toBeInTheDocument();

    // Close details
    const closeBtn = screen.getByText('Close Details');
    fireEvent.click(closeBtn);

    // Detail overlay should be closed, but list modal should still be open
    expect(screen.queryByText('You start knowing that 1 of 2 players is a particular Townsfolk.')).toBeNull();
    expect(screen.getByRole('heading', { name: /Active Script/i })).toBeInTheDocument();
  });
});
