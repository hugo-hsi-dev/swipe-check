import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card } from 'heroui-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-4">
      <Card>
        <Card.Body className="gap-3">
          <Card.Title>Modal route</Card.Title>
          <Card.Description>
            Even the standalone Expo Router modal route now uses HeroUI Native surfaces and actions.
          </Card.Description>
        </Card.Body>
        <Card.Footer>
          <Button variant="secondary" onPress={() => router.dismissTo('/')}>
            <Button.Label>Back home</Button.Label>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}
