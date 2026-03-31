import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Description,
  Dialog,
  FieldError,
  Input,
  Label,
  Switch,
  TextField,
} from 'heroui-native';
import { useState } from 'react';

export default function TodayScreen() {
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const emailInvalid = email.length > 0 && !email.includes('@');

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ gap: 16, padding: 16, paddingTop: 24, paddingBottom: 24 }}>
      <Card className="gap-5">
        <Card.Header className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Avatar alt="Swipe Check" color="accent" size="lg">
              <Avatar.Fallback>SC</Avatar.Fallback>
            </Avatar>
            <View className="shrink">
              <Card.Title>Today</Card.Title>
              <Card.Description>
                Your daily overview and quick actions.
              </Card.Description>
            </View>
          </View>
          <Chip variant="secondary" color="success">
            <View className="size-2 rounded-full bg-success" />
            <Chip.Label>Ready</Chip.Label>
          </Chip>
        </Card.Header>

        <Card.Body className="gap-4">
          <View className="flex-row flex-wrap gap-2">
            <Chip>Expo 54</Chip>
            <Chip variant="soft" color="warning">
              <Ionicons name="sparkles" size={12} />
              <Chip.Label>HeroUI</Chip.Label>
            </Chip>
            <Chip variant="secondary" color="success">
              <Ionicons name="phone-portrait" size={12} />
              <Chip.Label>Native</Chip.Label>
            </Chip>
          </View>

          <TextField isInvalid={emailInvalid} isRequired>
            <Label>Work email</Label>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@company.com"
              value={email}
            />
            {emailInvalid ? (
              <FieldError>Enter a valid email address.</FieldError>
            ) : (
              <Description>Input, label, helper text, and validation all come from HeroUI Native.</Description>
            )}
          </TextField>

          <View className="gap-3 rounded-2xl bg-surface-secondary p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="shrink">
                <Card.Title className="text-base">Push alerts</Card.Title>
                <Card.Description>
                  Animated switch component using the HeroUI Native theme tokens.
                </Card.Description>
              </View>
              <Switch isSelected={notificationsEnabled} onSelectedChange={setNotificationsEnabled}>
                <Switch.Thumb />
              </Switch>
            </View>
          </View>
        </Card.Body>

        <Card.Footer className="flex-row flex-wrap gap-3">
          <Button>
            <Ionicons name="flash" size={16} />
            <Button.Label>Primary action</Button.Label>
          </Button>
          <Button variant="secondary" onPress={() => setDialogOpen(true)}>
            <Button.Label>Open dialog</Button.Label>
          </Button>
          <Button variant="danger">
            <Ionicons name="trash" size={16} />
            <Button.Label>Danger</Button.Label>
          </Button>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Body className="gap-3">
          <Card.Title>Settings</Card.Title>
          <Card.Description>
            Manage your preferences and account settings.
          </Card.Description>
          <Button variant="secondary" onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={16} />
            <Button.Label>Open Settings</Button.Label>
          </Button>
        </Card.Body>
      </Card>

      <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <View className="gap-3">
              <Dialog.Title>HeroUI Native dialog</Dialog.Title>
              <Dialog.Description>
                The modal layer, overlay, content animation, and close action all come from the UI library.
              </Dialog.Description>
              <View className="flex-row justify-end gap-2 pt-2">
                <Dialog.Close variant="tertiary">
                  <Button.Label>Close</Button.Label>
                </Dialog.Close>
              </View>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </ScrollView>
  );
}
