import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NightOrderWidget from './NightOrderWidget';
import type { Player } from '../types';

describe('NightOrderWidget', () => {
  const mockPlayers: Player[] = [
    {
      id: 'p1',
      name: 'Alice',
      roleId: 'imp', // Lunatic thinks they are the Imp
      isTheLunatic: true,
      isDead: false,
    },
    {
      id: 'p2',
      name: 'Bob',
      roleId: 'empath', // Marionette thinks they are Empath
      isTheMarionette: true,
      isDead: false,
    },
    {
      id: 'p3',
      name: 'Charlie',
      roleId: 'washerwoman',
      isDead: false,
    }
  ];

  it('correctly displays lunatic and marionette in the first night list', () => {
    render(
      <NightOrderWidget
        players={mockPlayers}
        timeOfDay="night"
        dayNumber={1}
        isLightModeActive={false}
      />
    );

    // Both Lunatic and Marionette should be in the list on Night 1
    expect(screen.getByText('Lunatic')).toBeInTheDocument();
    expect(screen.getByText('Marionette')).toBeInTheDocument();
    
    // Player names should be displayed next to their actual role items
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('correctly displays lunatic but not marionette in other nights list', () => {
    render(
      <NightOrderWidget
        players={mockPlayers}
        timeOfDay="night"
        dayNumber={2}
        isLightModeActive={false}
      />
    );

    // Lunatic wakes up on other nights to choose targets; Marionette only acts on Night 1
    expect(screen.getByText('Lunatic')).toBeInTheDocument();
    expect(screen.queryByText('Marionette')).toBeNull();
  });

  it('allows checking and resetting checkboxes', () => {
    const handleSetCheckedItems = vi.fn();
    
    render(
      <NightOrderWidget
        players={mockPlayers}
        timeOfDay="night"
        dayNumber={1}
        isLightModeActive={false}
        checkedItems={{}}
        onSetCheckedItems={handleSetCheckedItems}
      />
    );

    // The reset button is the first button (RotateCcw icon), let's find the checklist items
    const lunaticRow = screen.getByText('Lunatic').closest('div');
    expect(lunaticRow).toBeInTheDocument();
    
    if (lunaticRow) {
      fireEvent.click(lunaticRow);
      expect(handleSetCheckedItems).toHaveBeenCalled();
    }
  });
});
