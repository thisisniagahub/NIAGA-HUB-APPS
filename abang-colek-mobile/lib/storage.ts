import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppData } from "./types";
import { defaultBadges, defaultTestimonials, successStories, sampleHooks } from "./preset-data";
import { safeParseAppData } from "./validation";

const STORAGE_KEY = "@abang_colek_app_data";

export const defaultAppData: AppData = {
  events: [],
  checklists: [],
  hooks: sampleHooks,
  contentPlans: [],
  reviews: [],
  milestones: [],
  badges: defaultBadges,
  testimonials: defaultTestimonials,
  successStories,
  luckyDrawCampaigns: [],
  luckyDrawEntries: [],
  luckyDrawWinners: [],
  settings: {
    soundEffects: true,
    backgroundMusic: false,
    haptics: true,
  },
};

export async function loadAppData(): Promise<AppData> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const raw = JSON.parse(jsonValue);
      const merged = {
        ...defaultAppData,
        ...raw,
        settings: {
          ...defaultAppData.settings,
          ...(raw?.settings ?? {}),
        },
      };
      const parsed = safeParseAppData(merged);
      if (!parsed.success) {
        console.error("Invalid app data found in storage:", parsed.error.flatten());
        return defaultAppData;
      }
      return parsed.data;
    }
    return defaultAppData;
  } catch (error) {
    console.error("Error loading app data:", error);
    return defaultAppData;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error("Error saving app data:", error);
    throw error;
  }
}

export async function clearAppData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing app data:", error);
    throw error;
  }
}

export async function exportAppData(): Promise<string> {
  try {
    const data = await loadAppData();
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error exporting app data:", error);
    throw error;
  }
}

export async function importAppData(jsonString: string): Promise<void> {
  try {
    const raw = JSON.parse(jsonString);
    const merged = {
      ...defaultAppData,
      ...raw,
      settings: {
        ...defaultAppData.settings,
        ...(raw?.settings ?? {}),
      },
    };
    const parsed = safeParseAppData(merged);
    if (!parsed.success) {
      throw new Error("Invalid app data format");
    }
    const data = parsed.data as AppData;
    await saveAppData(data);
  } catch (error) {
    console.error("Error importing app data:", error);
    throw error;
  }
}
