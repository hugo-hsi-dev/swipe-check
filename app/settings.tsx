import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Description,
  Input,
  Label,
  ListGroup,
  Switch,
  TextField,
} from 'heroui-native';
import { useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');
  const [email, setEmail] = useState('');

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
      <Card>
        <Card.Header className="flex-row items-center gap-3">
          <Avatar alt="User" color="accent" size="lg">
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
          <View className="shrink">
            <Card.Title>John Doe</Card.Title>
            <Card.Description>
              john.doe@example.com
            </Card.Description>
          </View>
        </Card.Header>
      </Card>

      <ListGroup>
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name="notifications-outline" size={18} />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Notifications</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Push alerts and reminders
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <Switch isSelected={notificationsEnabled} onSelectedChange={setNotificationsEnabled}>
            <Switch.Thumb />
          </Switch>
        </ListGroup.Item>

        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <View className="size-10 items-center justify-center rounded-full bg-surface-secondary">
              <Ionicons name="moon-outline" size={18} />
            </View>
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Dark Mode</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Use dark theme
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <Switch isSelected={darkModeEnabled} onSelectedChange={setDarkModeEnabled}>
            <Switch.Thumb />
          </Switch>
        </ListGroup.Item>
      </ListGroup>

      <Card>
        <Card.Body className="gap-4">
          <Card.Title>Account</Card.Title>
          <TextField>
            <Label>Email</Label>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Enter your email"
              value={email}
            />
            <Description>Update your email address.</Description>
          </TextField>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="gap-3">
          <Card.Title>About</Card.Title>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Description>Version</Description>
              <Description>1.0.0</Description>
            </View>
            <View className="flex-row items-center justify-between">
              <Description>Build</Description>
              <Description>100</Description>
            </View>
          </View>
        </Card.Body>
      </Card>

      <Button variant="secondary" onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={16} />
        <Button.Label>Go Back</Button.Label>
      </Button>
    </ScrollView>
  );
}
