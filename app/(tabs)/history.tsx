import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View, Text } from 'react-native';
import { Card, ListGroup } from 'heroui-native';

export default function HistoryScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ gap: 12, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Recent Checks</Card.Title>
          <Card.Description>
            View your completed verification sessions and their results.
          </Card.Description>
        </Card.Body>
      </Card>

      <ListGroup>
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-success-soft">
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Daily Inventory</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Completed today at 9:30 AM • 24 items verified
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>

        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-success-soft">
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Equipment Audit</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Completed yesterday at 4:15 PM • 12 items verified
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>

        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-warning-soft">
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Supplies Check</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Completed Mar 29 at 2:00 PM • 3 items flagged
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>

      <Card className="gap-4">
        <Card.Body className="gap-3">
          <Card.Title>Summary</Card.Title>
          <View className="flex-row justify-between">
            <View className="items-center gap-1">
              <Text className="text-2xl font-semibold text-foreground">156</Text>
              <Text className="text-sm text-muted">Total Checks</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-semibold text-success">142</Text>
              <Text className="text-sm text-muted">Passed</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-semibold text-warning">14</Text>
              <Text className="text-sm text-muted">Flagged</Text>
            </View>
          </View>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
