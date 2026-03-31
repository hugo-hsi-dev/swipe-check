import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Button, Card } from 'heroui-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Card className="w-full max-w-sm gap-6">
        <Card.Body className="items-center gap-4">
          <View className="size-16 items-center justify-center rounded-2xl bg-accent">
            <Ionicons name="shield-checkmark" size={32} color="white" />
          </View>
          <View className="items-center gap-2">
            <Card.Title className="text-xl">Swipe Check</Card.Title>
            <Card.Description className="text-center">
              Ready to start checking items. Select a workflow to begin.
            </Card.Description>
          </View>
        </Card.Body>
        <Card.Footer className="flex-col gap-3">
          <Button className="w-full">
            <Ionicons name="scan" size={18} />
            <Button.Label>Start Check</Button.Label>
          </Button>
          <Button variant="secondary" className="w-full">
            <Ionicons name="time-outline" size={18} />
            <Button.Label>View History</Button.Label>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}
