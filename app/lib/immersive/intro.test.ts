import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { shouldShowIntro, type IntroSessionStore } from "./intro";

/**
 * Build a fresh session store for a single property run.
 *
 * - When `throwing` is true, both methods throw (simulating blocked/private
 *   storage), exercising the in-memory fallback path.
 * - Otherwise it behaves like a working `sessionStorage` backed by a Map.
 */
function makeStore(throwing: boolean): IntroSessionStore {
  if (throwing) {
    return {
      getItem() {
        throw new Error("storage blocked");
      },
      setItem() {
        throw new Error("storage blocked");
      },
    };
  }
  const map = new Map<string, string>();
  return {
    getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

// Feature: immersive-experience, Property 13: The intro overlay shows only on the first session invocation
//
// For any sequence of shouldShowIntro(sessionStore) calls sharing one session
// store, only the first call (when the session flag is unset) returns true;
// every subsequent call returns false.
// Validates: Requirements 6.7
describe("shouldShowIntro", () => {
  it("Property 13: only the first call on a shared session store returns true", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.boolean(),
        (numCalls, throwing) => {
          // A fresh store per run ensures the "unset flag" starting condition.
          const store = makeStore(throwing);

          const results: boolean[] = [];
          for (let i = 0; i < numCalls; i++) {
            results.push(shouldShowIntro(store));
          }

          // Only the first invocation shows the intro.
          expect(results[0]).toBe(true);
          expect(results.slice(1).every((r) => r === false)).toBe(true);
        },
      ),
    );
  });
});
