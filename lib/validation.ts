import type { Priority } from "@/lib/types";

const MAX_TITLE_LENGTH = 200;
const PRIORITY_VALUES: readonly Priority[] = ["LOW", "MEDIUM", "HIGH"];
const DEFAULT_PRIORITY: Priority = "MEDIUM";

export type ValidationResult =
  | { ok: true; title: string }
  | { ok: false; message: string };

export type PriorityValidationResult =
  | { ok: true; priority: Priority }
  | { ok: false; message: string };

export function validateTitle(rawTitle: unknown): ValidationResult {
  if (typeof rawTitle !== "string") {
    return { ok: false, message: "Title is required." };
  }

  const title = rawTitle.trim();

  if (title.length === 0) {
    return { ok: false, message: "Title is required." };
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      message: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, title };
}

export function validatePriority(
  rawPriority: unknown
): PriorityValidationResult {
  if (rawPriority === undefined) {
    return { ok: true, priority: DEFAULT_PRIORITY };
  }

  if (
    typeof rawPriority !== "string" ||
    !PRIORITY_VALUES.includes(rawPriority as Priority)
  ) {
    return {
      ok: false,
      message: `Priority must be one of ${PRIORITY_VALUES.join(", ")}.`,
    };
  }

  return { ok: true, priority: rawPriority as Priority };
}
