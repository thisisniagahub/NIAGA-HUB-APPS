// Generic Local Storage Database Wrapper
// This simulates a real DB by persisting changes to the browser's local storage.

export const db = {
  get: <T>(key: string, defaultData: T): T => {
    try {
      const stored = localStorage.getItem(`startupos_${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
      // Seed initial data
      localStorage.setItem(`startupos_${key}`, JSON.stringify(defaultData));
      return defaultData;
    } catch (e) {
      console.error('DB Read Error', e);
      return defaultData;
    }
  },

  set: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(`startupos_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('DB Write Error', e);
    }
  },

  updateItem: <T extends { id: string }>(key: string, id: string, updates: Partial<T>, defaultData: T[]): T[] => {
    const items = db.get<T[]>(key, defaultData);
    const newItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
    db.set(key, newItems);
    return newItems;
  },

  addItem: <T>(key: string, item: T, defaultData: T[]): T[] => {
    const items = db.get<T[]>(key, defaultData);
    const newItems = [...items, item];
    db.set(key, newItems);
    return newItems;
  },

  deleteItem: <T extends { id: string }>(key: string, id: string, defaultData: T[]): T[] => {
    const items = db.get<T[]>(key, defaultData);
    const newItems = items.filter(item => item.id !== id);
    db.set(key, newItems);
    return newItems;
  }
};