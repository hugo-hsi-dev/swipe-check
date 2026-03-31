import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
import { Avatar, Card, Chip, ListGroup } from 'heroui-native';

export default function ExploreScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
      <Card>
        <Card.Body className="gap-2">
          <Card.Title>Component gallery</Card.Title>
          <Card.Description>
            A second screen showing list rows, avatars, chips, and themed icons from HeroUI Native.
          </Card.Description>
        </Card.Body>
      </Card>

      <ListGroup>
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <Avatar alt="UI preview" color="accent" variant="soft">
              <Avatar.Fallback>UI</Avatar.Fallback>
            </Avatar>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Compound components</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Cards, buttons, dialogs, and lists are all composed with library subcomponents.
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>

        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name="color-palette-outline" size={18} />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Theme tokens</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Icons and surfaces are reading semantic colors from `useThemeColor`.
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>

        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="phone-portrait-outline" size={18} />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Native-first styling</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Uniwind powers `className` styling while HeroUI supplies the primitives and variants.
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>

      <Card className="gap-4">
        <Card.Body className="gap-3">
          <Card.Title>Status badges</Card.Title>
          <View className="flex-row flex-wrap gap-2">
            <Chip>Default</Chip>
            <Chip color="success" variant="secondary">
              Synced
            </Chip>
            <Chip color="warning" variant="tertiary">
              Review
            </Chip>
            <Chip color="danger" variant="soft">
              Blocked
            </Chip>
          </View>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
