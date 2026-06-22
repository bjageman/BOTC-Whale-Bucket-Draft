import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PreferenceSelectionModal from './PreferenceSelectionModal';
import type { Player } from '../WhaleBucket';

describe('PreferenceSelectionModal', () => {
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Player One',
      preferences: {
        townsfolk: ['washerwoman'],
        outsider: [],
        minion: [],
        demon: [],
        traveler: [],
      },
      isDead: false,
    },
  ];

  const defaultProps = {
    activePrefModal: { playerId: '1', team: 'townsfolk' as const },
    players: mockPlayers,
    prefSearchTerm: '',
    setPrefSearchTerm: vi.fn(),
    togglePreference: vi.fn(),
    setPlayers: vi.fn(),
    setActivePrefModal: vi.fn(),
    excludedRoleIds: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with correct title and elements', () => {
    render(<PreferenceSelectionModal {...defaultProps} />);

    expect(screen.getByText('Select Townsfolk')).toBeInTheDocument();
    expect(screen.getByText('For Player One (select 1)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search character name...')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Clear Selection')).toBeInTheDocument();
    expect(screen.getByText('Select Random')).toBeInTheDocument();
  });

  it('filters and displays roles based on team', () => {
    render(<PreferenceSelectionModal {...defaultProps} />);
    
    // Washerwoman is a townsfolk and should be rendered
    expect(screen.getByText('Washerwoman')).toBeInTheDocument();
    // Poisoner is a minion and should not be rendered when team is townsfolk
    expect(screen.queryByText('Poisoner')).not.toBeInTheDocument();
  });

  it('calls setPrefSearchTerm on input change', () => {
    render(<PreferenceSelectionModal {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search character name...');
    fireEvent.change(input, { target: { value: 'chef' } });

    expect(defaultProps.setPrefSearchTerm).toHaveBeenCalledWith('chef');
  });

  it('calls togglePreference and closes when a role button is clicked', () => {
    render(<PreferenceSelectionModal {...defaultProps} />);

    // Click a townsfolk, e.g., Chef
    const chefButton = screen.getByText('Chef').closest('button');
    expect(chefButton).toBeTruthy();
    fireEvent.click(chefButton!);

    expect(defaultProps.togglePreference).toHaveBeenCalledWith('1', 'townsfolk', 'chef');
    expect(defaultProps.setActivePrefModal).toHaveBeenCalledWith(null);
  });

  it('calls setActivePrefModal(null) when Done is clicked', () => {
    render(<PreferenceSelectionModal {...defaultProps} />);

    const doneButton = screen.getByText('Done');
    fireEvent.click(doneButton);

    expect(defaultProps.setActivePrefModal).toHaveBeenCalledWith(null);
  });

  it('clears preference selection when Clear Selection is clicked', () => {
    render(<PreferenceSelectionModal {...defaultProps} />);

    const clearButton = screen.getByText('Clear Selection');
    fireEvent.click(clearButton);

    expect(defaultProps.setPlayers).toHaveBeenCalled();
    const updateFn = defaultProps.setPlayers.mock.calls[0][0];
    const updatedPlayers = updateFn(mockPlayers);
    expect(updatedPlayers[0].preferences.townsfolk).toEqual([]);
  });

  it('selects a random role when Select Random is clicked', () => {
    render(<PreferenceSelectionModal {...defaultProps} />);

    const randomButton = screen.getByText('Select Random');
    fireEvent.click(randomButton);

    expect(defaultProps.setPlayers).toHaveBeenCalled();
    expect(defaultProps.setActivePrefModal).toHaveBeenCalledWith(null);
  });
});
