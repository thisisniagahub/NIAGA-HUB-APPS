import { useCallback, useEffect, useState } from "react";

import { defaultAppData, loadAppData, saveAppData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

type UpdateFn = (current: AppData) => AppData;

export function useAppData() {
  const [data, setData] = useState<AppData>(defaultAppData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const next = await loadAppData();
      setData(next);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load app data");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (updater: UpdateFn) => {
    try {
      setError(null);
      let nextState: AppData | null = null;
      setData((prev) => {
        nextState = updater(prev);
        return nextState;
      });
      if (nextState) {
        await saveAppData(nextState);
        return nextState;
      }
      throw new Error("Failed to update data");
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to save app data");
      setError(nextError);
      throw nextError;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    update,
  };
}
