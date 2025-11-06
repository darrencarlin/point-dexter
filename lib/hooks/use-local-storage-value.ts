import { useSyncExternalStore } from "react";

/**
 * Hook to safely read a value from localStorage with SSR support.
 * Returns the default value during SSR and the actual value on the client.
 * Automatically syncs across tabs and components.
 */
export function useLocalStorageValue(key: string, defaultValue: string) {
  return useSyncExternalStore(
    (callback) => {
      // Listen for storage events (changes from other tabs)
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) {
          callback();
        }
      };
      
      // Listen for custom events (changes within same tab)
      const onLocalUpdate = (e: Event) => {
        if ((e as CustomEvent).detail?.key === key) {
          callback();
        }
      };
      
      window.addEventListener("storage", onStorage);
      window.addEventListener("local-storage-update", onLocalUpdate);
      
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("local-storage-update", onLocalUpdate);
      };
    },
    () => {
      if (typeof window === "undefined") return defaultValue;
      return localStorage.getItem(key) ?? defaultValue;
    },
    () => defaultValue // server snapshot
  );
}

/**
 * Helper function to set localStorage and trigger updates in all hooks.
 * Use this instead of directly calling localStorage.setItem() to ensure
 * all components stay in sync.
 */
export function setLocalStorageValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(key, value);
  
  // Dispatch custom event to notify same-tab listeners
  window.dispatchEvent(
    new CustomEvent("local-storage-update", { detail: { key } })
  );
}
