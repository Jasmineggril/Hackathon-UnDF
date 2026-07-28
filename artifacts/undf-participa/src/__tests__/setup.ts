import "@testing-library/jest-dom";
import { vi } from "vitest";

// Stub import.meta.env for tests
Object.defineProperty(import.meta, "env", {
  value: {
    BASE_URL: "/",
    VITE_DEMO_MODE: "true",
    MODE: "test",
    DEV: false,
    PROD: false,
  },
  writable: true,
});

// Stub localStorage
class LocalStorageMock {
  store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  removeItem(key: string) { delete this.store[key]; }
}
Object.defineProperty(global, "localStorage", { value: new LocalStorageMock() });

// Stub navigator.clipboard
Object.defineProperty(global.navigator, "clipboard", {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});
