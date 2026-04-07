/**
 * Settings Screen Tests
 *
 * Validates MVP Settings behavior:
 * - App information visibility
 * - Clear local data action with explicit confirmation
 * - Post-wipe routing to first-launch state
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

import { clearSQLiteData } from '@/lib/local-data/sqlite';
import SettingsScreen from '@/app/settings';

jest.mock('@/lib/local-data/sqlite', () => ({
  clearSQLiteData: jest.fn(() => Promise.resolve()),
}));

const originalSetTimeout = global.setTimeout;

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
    },
  },
}));

jest.mock('@/components/ui/app-icon', () => ({
  AppIcon: () => null,
}));

describe('Settings Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App Information', () => {
    it('should display Settings title', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('should display app info section with version and build', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('About')).toBeTruthy();
      expect(screen.getAllByText('Version')).toHaveLength(1);
      expect(screen.getAllByText('Build')).toHaveLength(1);
      expect(screen.getByText('1.0.0')).toBeTruthy();
      expect(screen.getByText('100')).toBeTruthy();
    });

    it('should display description about settings', () => {
      render(<SettingsScreen />);
      expect(
        screen.getByText('App information and local data controls')
      ).toBeTruthy();
    });
  });

  describe('Clear Local Data Action', () => {
    it('should display clear local data section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Clear Local Data')).toBeTruthy();
    });

    it('should show warning about permanent deletion', () => {
      render(<SettingsScreen />);
      expect(
        screen.getByText(/This will permanently delete all your data/i)
      ).toBeTruthy();
    });

    it('should show delete button initially', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Delete All Data')).toBeTruthy();
    });

    it('should show confirmation dialog when delete button pressed', () => {
      render(<SettingsScreen />);
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
      render(<SettingsScreen />);
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
      render(<SettingsScreen />);
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
      render(<SettingsScreen />);
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
      render(<SettingsScreen />);
      expect(screen.getByText('Go Back')).toBeTruthy();
    });

    it('should navigate back when go back button pressed', () => {
      render(<SettingsScreen />);
      const backButton = screen.getByText('Go Back');

      fireEvent.press(backButton);

      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('Wipe Error Handling', () => {
    it('should display error message when wipe fails', async () => {
      const testError = new Error('Test wipe failure');
      (clearSQLiteData as jest.Mock).mockRejectedValueOnce(testError);

      render(<SettingsScreen />);

      const deleteButton = screen.getByText('Delete All Data');
      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete data: Test wipe failure')).toBeTruthy();
      });
    });

    it('should clear error when canceling after failed wipe', async () => {
      const testError = new Error('Test wipe failure');
      (clearSQLiteData as jest.Mock).mockRejectedValueOnce(testError);

      render(<SettingsScreen />);

      const deleteButton = screen.getByText('Delete All Data');
      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete data: Test wipe failure')).toBeTruthy();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to delete data: Test wipe failure')).toBeNull();
      });
    });
  });

  describe('Wipe Loading State', () => {
    it('should disable confirm button while wiping', async () => {
      let resolveWipe: ((value?: void) => void) | undefined;
      (clearSQLiteData as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveWipe = resolve;
          })
      );

      render(<SettingsScreen />);

      const deleteButton = screen.getByText('Delete All Data');
      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });

      resolveWipe!();
    });

    it('should disable cancel button while wiping', async () => {
      let resolveWipe: ((value?: void) => void) | undefined;
      (clearSQLiteData as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveWipe = resolve;
          })
      );

      render(<SettingsScreen />);

      const deleteButton = screen.getByText('Delete All Data');
      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.press(cancelButton);

      resolveWipe!();
    });

    it('should disable go back button while wiping', async () => {
      let resolveWipe: ((value?: void) => void) | undefined;
      (clearSQLiteData as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveWipe = resolve;
          })
      );

      render(<SettingsScreen />);

      const deleteButton = screen.getByText('Delete All Data');
      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });

      const goBackButton = screen.getByText('Go Back');
      fireEvent.press(goBackButton);

      resolveWipe!();
    });

    it('should not navigate if component unmounts during successful wipe', async () => {
      let rejectWipe: ((reason?: unknown) => void) | undefined;
      (clearSQLiteData as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectWipe = reject;
          })
      );

      const { unmount } = render(<SettingsScreen />);

      const deleteButton = screen.getByText('Delete All Data');
      fireEvent.press(deleteButton);

      const confirmButton = screen.getByText('Yes, Delete All Data');
      fireEvent.press(confirmButton);

      unmount();

      rejectWipe!(new Error('Wipe aborted'));

      await new Promise((resolve) => originalSetTimeout(resolve, 0));

      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe('MVP Scope Boundary', () => {
    it('should NOT display reminders settings', () => {
      render(<SettingsScreen />);
      expect(screen.queryByText('Reminders', { exact: true })).toBeNull();
      expect(screen.queryByText('Notifications', { exact: true })).toBeNull();
    });

    it('should NOT display accounts settings', () => {
      render(<SettingsScreen />);
      expect(screen.queryByText('Account', { exact: true })).toBeNull();
      expect(screen.queryByText('Profile', { exact: true })).toBeNull();
      expect(screen.queryByText('Sign Out', { exact: true })).toBeNull();
    });

    it('should NOT display sync settings', () => {
      render(<SettingsScreen />);
      expect(screen.queryByText('Sync', { exact: true })).toBeNull();
      expect(screen.queryByText('Back up', { exact: true })).toBeNull();
      expect(screen.queryByText('Cloud sync', { exact: true })).toBeNull();
    });

    it('should NOT display theme customization', () => {
      render(<SettingsScreen />);
      expect(screen.queryByText('Theme', { exact: true })).toBeNull();
      expect(screen.queryByText('Dark mode', { exact: true })).toBeNull();
      expect(screen.queryByText('Light mode', { exact: true })).toBeNull();
      expect(screen.queryByText('Appearance', { exact: true })).toBeNull();
    });
  });
});
