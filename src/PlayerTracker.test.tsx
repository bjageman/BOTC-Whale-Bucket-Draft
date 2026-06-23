import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerTracker from './PlayerTracker';

describe('PlayerTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders setup phase and allows adding players', () => {
    render(<PlayerTracker theme="dark" toggleTheme={vi.fn()} />);

    expect(screen.getByText('Character Tracker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter player name in seating order...')).toBeInTheDocument();
    expect(screen.getByText('Start Game Tracker').closest('button')).toBeDisabled();

    // Add a player
    const input = screen.getByPlaceholderText('Enter player name in seating order...');
    const addButton = screen.getByRole('button', { name: '' }); // the Plus icon button
    
    fireEvent.change(input, { target: { value: 'Alice' } });
    fireEvent.click(addButton);

    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByText('Start Game Tracker').closest('button')).not.toBeDisabled();
  });

  it('transitions to game phase and displays players in circle with blank characters', () => {
    render(<PlayerTracker theme="dark" toggleTheme={vi.fn()} />);

    const input = screen.getByPlaceholderText('Enter player name in seating order...');
    const addButton = screen.getByRole('button', { name: '' });

    // Add 5 players
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    names.forEach(name => {
      fireEvent.change(input, { target: { value: name } });
      fireEvent.click(addButton);
    });

    // Start tracking
    const startButton = screen.getByText('Start Game Tracker');
    fireEvent.click(startButton);

    // Verify we are in game phase
    expect(screen.getByText(/night 1/i)).toBeInTheDocument();
    expect(screen.getAllByText('Alice')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Bob')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Charlie')[0]).toBeInTheDocument();
    expect(screen.getAllByText('David')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Eve')[0]).toBeInTheDocument();

    // Verify all players start with blank/question-mark roles in tokens
    // (Since role is unset, only the player names are rendered on the token)
    expect(screen.queryByText('Washerwoman')).toBeNull();
    expect(screen.queryByText('Imp')).toBeNull();
  });
});
