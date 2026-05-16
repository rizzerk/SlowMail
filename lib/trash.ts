import AsyncStorage from '@react-native-async-storage/async-storage';

const TRASH_KEY = 'trashed_letters';

export const getTrash = async (): Promise<any[]> => {
  const data = await AsyncStorage.getItem(TRASH_KEY);
  return data ? JSON.parse(data) : [];
};

export const addToTrash = async (letter: any) => {
  const trash = await getTrash();
  const exists = trash.find((l: any) => l.id === letter.id);
  if (!exists) {
    trash.push({ ...letter, trashed_at: new Date().toISOString() });
    await AsyncStorage.setItem(TRASH_KEY, JSON.stringify(trash));
  }
};

export const removeFromTrash = async (id: number) => {
  const trash = await getTrash();
  const updated = trash.filter((l: any) => l.id !== id);
  await AsyncStorage.setItem(TRASH_KEY, JSON.stringify(updated));
};

export const clearTrash = async () => {
  await AsyncStorage.setItem(TRASH_KEY, JSON.stringify([]));
};
