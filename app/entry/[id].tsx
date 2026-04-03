import { Redirect, useLocalSearchParams } from 'expo-router';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (id) {
    return <Redirect href={`/journal/${id}`} />;
  }

  return <Redirect href="/journal" />;
}
