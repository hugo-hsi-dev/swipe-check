import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
import { Avatar, Card, Chip, ListGroup } from 'heroui-native';

export default function JournalScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Journal</Card.Title>
          <Card.Description>
            Record your daily thoughts, reflections, and experiences.
          </Card.Description>
        </Card.Body>
      </Card>

      <ListGroup>
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <Avatar alt="Entry" color="accent" variant="soft">
              <Avatar.Fallback>1</Avatar.Fallback>
            </Avatar>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Today&apos;s Entry</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Start writing your thoughts for today.
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>

        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name="calendar-outline" size={18} />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Past Entries</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Browse and search through your previous journal entries.
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>

        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="bookmark-outline" size={18} />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Saved</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Access your favorite and bookmarked entries.
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>

      <Card className="gap-4">
        <Card.Body className="gap-3">
          <Card.Title>Quick Tags</Card.Title>
          <View className="flex-row flex-wrap gap-2">
            <Chip>Personal</Chip>
            <Chip color="success" variant="secondary">
              Work
            </Chip>
            <Chip color="warning" variant="tertiary">
              Ideas
            </Chip>
            <Chip color="accent" variant="soft">
              Gratitude
            </Chip>
          </View>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
