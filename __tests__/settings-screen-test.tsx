/**
 * Settings Screen Tests
 *
 * Validates MVP Settings behavior:
 * - App information visibility
 * - Clear local data action with explicit confirmation
 * - Post-wipe routing to first-launch state
 */

import { waitFor, renderHook, act, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { render, screen } from '@testing-library/react-native';
import { HeroUINativeProvider } from 'heroui-native';
import React from 'react';

import { clearSQLiteData } from '@/lib/local-data/sqlite';
import SettingsScreen from '@/app/settings';

jest.mock('@/lib/local-data/sqlite', () => ({
  clearSQLiteData: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

describe('Settings Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithHeroUI(ui: React.ReactElement) {
    return render(<HeroUINativeProvider>{ui}</HeroUINativeProvider>);
  }

  describe('App Information', () => {
    it('should display Settings title', () => {
      renderWithHeroUI(<SettingsScreen />);
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('should display app info section with version and build', () => {
      renderWithHeroUI(<SettingsScreen />);
      expect(screen.getByText('About')).toBeTruthy();
      expect(screen.getAllByText('Version')).toHaveLength(1);
      expect(screen.getAllByText('Build')).toHaveLength(1);
      expect(screen.getByText('1.0.0')).toBeTruthy();
      expect(screen.getByText('100')).toBeTruthy();
    });

    it('should display description about settings', () => {
      renderWithHeroUI(<SettingsScreen />);
      expect(
        screen.getByText('App information and local data controls')
      ).toBeTruthy();
    });
  });

  describe('Clear Local Data Action', () => {
    it('should display clear local data section', () => {
      renderWithHeroUI(<SettingsScreen />);
      expect(screen.getByText('Clear Local Data')).toBeTruthy();
    });

    it('should show warning about permanent deletion', () => {
      renderWithHeroUI(<SettingsScreen />);
      expect(
        screen.getByText(/This will permanently delete all your data/i)
      ).toBeTruthy();
    });

    it('should show delete button initially', () => {
      renderWithHeroUI(<SettingsScreen />);
      expect(screen.getByText('Delete All Data')).toBeTruthy();
    });

    it('should show confirmation dialog when delete button pressed', () => {
      renderWithHeroUI(<SettingsScreen />);
      const deleteButton = screen.getByText('Delete All Data');

      fireEvent.press(deleteButton);

      expect(screen.getByText('Are you sure?')).toBeTruthy();
      expect(
        screen.getByText(
          /This will permanently delete all your local data\. The app will return to its first-launch state\./i
        )
      ).toBeTruthy();
      expect(screen.getByText('Yes, Delete All Data')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('should cancel confirmation when cancel button pressed', () => {
      renderWithHeroUI(<SettingsScreen />);
      const deleteButton = screen.getByText('Delete All Data');

      fireEvent.press(deleteButton);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(screen.queryByText('Are you sure?')).toBeNull();
      expect(screen.getByText('Clear Local Data')).toBeTruthy();
    });
  });

  describe('Post-Wipe Behavior', () => {
    it('should call clearSQLiteData when confirmed', async () => {
      renderWithHeroUI(<SettingsScreen />);
      const deleteButton = screen.getByText('Delete All Data');

      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');

      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(clearSQLiteData).toHaveBeenCalled();
      });
    });

    it('should navigate to onboarding after wipe completes', async () => {
      (clearSQLiteData as jest.Mock).mockResolvedValueOnce(undefined);
      renderWithHeroUI(<SettingsScreen />);
      const deleteButton = screen.getByText('Delete All Data');

      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');

      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/onboarding');
      });
    });
  });

  describe('Navigation', () => {
    it('should provide a go back button', () => {
      renderWithHeroUI(<SettingsScreen />);
      expect(screen.getByText('Go Back')).toBeTruthy();
    });

    it('should navigate back when go back button pressed', () => {
      renderWithHeroUI(<SettingsScreen />);
      const backButton = screen.getByText('Go Back');

      fireEvent.press(backButton);

      expect(router.back).toHaveBeenCalled();
    });
  });
});