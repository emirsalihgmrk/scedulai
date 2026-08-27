// Shared contract for all server actions: expected errors are returned as a
// typed result instead of thrown, so client callers can branch on `ok`.
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
