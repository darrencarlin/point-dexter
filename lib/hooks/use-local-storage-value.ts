import { useSyncExternalStore } from "react";

/**
 * Hook to safely read a value from localStorage with SSR support.
 * Returns the default value during SSR and the actual value on the client.
 */
export function useLocalStorageValue(key: string, defaultValue: string) {
  return useSyncExternalStore(
    () => () => {}, // subscribe - no-op since localStorage doesn't emit events
    () => {
      if (typeof window === "undefined") return defaultValue;
      return localStorage.getItem(key) ?? defaultValue;
    },
    () => defaultValue // server snapshot
  );
}
