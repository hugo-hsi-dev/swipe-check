import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card } from 'heroui-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-4">
      <Card>
        <Card.Body className="gap-3">
          <Card.Title>Check Details</Card.Title>
          <Card.Description>
            View detailed information about this verification session. Results and flagged items will appear here.
          </Card.Description>
        </Card.Body>
        <Card.Footer>
          <Button variant="secondary" onPress={() => router.back()} className="w-full">
            <Button.Label>Close</Button.Label>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}
