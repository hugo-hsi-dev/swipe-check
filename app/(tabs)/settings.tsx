import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Button, Card, ListGroup } from 'heroui-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const settingsItems = [
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {
        // TODO: Implement notifications settings
      },
    },
    {
      icon: 'moon-outline',
      label: 'Dark Mode',
      right: (
        <Switch
          value={isDark}
          onValueChange={() => {
            // TODO: Implement theme toggle
          }}
        />
      ),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {
        // TODO: Navigate to help
      },
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => {
        // TODO: Navigate to about
      },
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 16,
        paddingTop: 24,
        paddingBottom: 24,
        gap: 16,
      }}>
      <Card>
        <Card.Header>
          <Card.Title className="text-xl">Settings</Card.Title>
        </Card.Header>
      </Card>

      <ListGroup>
        {settingsItems.map((item, index) => (
          <ListGroup.Item key={index} onPress={item.onPress}>
            <ListGroup.ItemPrefix>
              <View className="size-10 items-center justify-center rounded-full bg-surface-secondary">
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} />
              </View>
            </ListGroup.ItemPrefix>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{item.label}</ListGroup.ItemTitle>
            </ListGroup.ItemContent>
            {item.right ?? <Ionicons name="chevron-forward" size={20} />}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Card>
        <Card.Body>
          <Button variant="danger" onPress={() => router.push('/reset-data')}>
            <Ionicons name="trash-outline" size={18} />
            <Button.Label>Reset All Data</Button.Label>
          </Button>
        </Card.Body>
      </Card>

      <Text className="text-center text-sm text-text-secondary">Swipe Check v1.0.0</Text>
    </ScrollView>
  );
}
