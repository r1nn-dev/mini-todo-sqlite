const MAX_TITLE_LENGTH = 200;

export type ValidationResult =
  | { ok: true; title: string }
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
