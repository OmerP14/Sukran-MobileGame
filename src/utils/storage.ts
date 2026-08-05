import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadJSON<T>(key: string): Promise<T | undefined> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) {
    return undefined;
  }
  return JSON.parse(raw) as T;
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
