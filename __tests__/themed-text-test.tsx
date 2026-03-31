import { render } from '@testing-library/react-native';

import { ThemedText } from '@/components/themed-text';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(() => '#11181C'),
}));

describe('<ThemedText />', () => {
  test('Text renders correctly', () => {
    const { getByText } = render(<ThemedText>Welcome!</ThemedText>);

    getByText('Welcome!');
  });
});
