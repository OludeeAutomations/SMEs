// Pure JavaScript memory storage for Expo Go compatibility.
// This completely avoids native JSI module conflicts (like react-native-mmkv / react-native-nitro-modules)
// that cannot run within standard Expo Go's pre-built client.

const memoryStore = new Map<string, any>();

export const storage = {
  set: (key: string, value: any) => {
    memoryStore.set(key, value);
  },
  getString: (key: string) => {
    const val = memoryStore.get(key);
    return typeof val === 'string' ? val : undefined;
  },
  getNumber: (key: string) => {
    const val = memoryStore.get(key);
    return typeof val === 'number' ? val : undefined;
  },
  getBoolean: (key: string) => {
    const val = memoryStore.get(key);
    return typeof val === 'boolean' ? val : undefined;
  },
  delete: (key: string) => {
    memoryStore.delete(key);
  },
  clearAll: () => {
    memoryStore.clear();
  }
};

export const storageService = {
  setString: (key: string, value: string) => storage.set(key, value),
  getString: (key: string) => storage.getString(key),
  
  setNumber: (key: string, value: number) => storage.set(key, value),
  getNumber: (key: string) => storage.getNumber(key),
  
  setBool: (key: string, value: boolean) => storage.set(key, value),
  getBool: (key: string) => storage.getBoolean(key),
  
  setObject: <T>(key: string, value: T) => storage.set(key, JSON.stringify(value)),
  getObject: <T>(key: string): T | null => {
    const raw = storage.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  
  delete: (key: string) => storage.delete(key),
  clearAll: () => storage.clearAll(),
};
