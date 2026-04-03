import { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      router.replace(`/journal/${id}`);
    } else {
      router.back();
    }
  }, [id]);

  return null;
}
