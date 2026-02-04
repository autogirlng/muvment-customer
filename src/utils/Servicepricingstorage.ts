import { ServicePricingShowcase } from "@/types/Servicepricing";

const STORAGE_KEY = "selected_service_pricing";

export class ServicePricingStorage {
  static saveToStorage(data: ServicePricingShowcase): void {
    try {
      if (typeof window === "undefined") return;

      const serialized = JSON.stringify(data);
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  }

  static getFromStorage(): ServicePricingShowcase | null {
    try {
      if (typeof window === "undefined") return null;

      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  }

  static clearStorage(): void {
    try {
      if (typeof window === "undefined") return;

      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  static hasData(): boolean {
    try {
      if (typeof window === "undefined") return false;

      return sessionStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      console.error("Error checking storage:", error);
      return false;
    }
  }
}
