import { describe, expect, it } from "vitest";
import { validatePriority, validateTitle } from "../../lib/validation";

describe("validateTitle", () => {
  it("accepts a normal title", () => {
    expect(validateTitle("우유 사기")).toEqual({ ok: true, title: "우유 사기" });
  });

  it("rejects an empty string", () => {
    expect(validateTitle("")).toEqual({
      ok: false,
      message: "Title is required.",
    });
  });

  it("rejects a whitespace-only string", () => {
    expect(validateTitle("   ")).toEqual({
      ok: false,
      message: "Title is required.",
    });
  });

  it("rejects a title longer than 200 characters", () => {
    const tooLong = "a".repeat(201);
    expect(validateTitle(tooLong)).toEqual({
      ok: false,
      message: "Title must be 200 characters or fewer.",
    });
  });

  it("accepts a title of exactly 200 characters", () => {
    const maxLength = "a".repeat(200);
    expect(validateTitle(maxLength)).toEqual({ ok: true, title: maxLength });
  });

  it("trims surrounding whitespace from an otherwise valid title", () => {
    expect(validateTitle("  buy milk  ")).toEqual({
      ok: true,
      title: "buy milk",
    });
  });
});

describe("validatePriority", () => {
  it("defaults to MEDIUM when omitted (undefined)", () => {
    expect(validatePriority(undefined)).toEqual({
      ok: true,
      priority: "MEDIUM",
    });
  });

  it.each(["LOW", "MEDIUM", "HIGH"] as const)(
    "accepts the exact enum value %s",
    (value) => {
      expect(validatePriority(value)).toEqual({ ok: true, priority: value });
    }
  );

  it("rejects a lowercase value ('low')", () => {
    expect(validatePriority("low")).toEqual({
      ok: false,
      message: "Priority must be one of LOW, MEDIUM, HIGH.",
    });
  });

  it("rejects an unknown value ('URGENT')", () => {
    expect(validatePriority("URGENT")).toEqual({
      ok: false,
      message: "Priority must be one of LOW, MEDIUM, HIGH.",
    });
  });

  it("rejects a non-string value", () => {
    expect(validatePriority(1)).toEqual({
      ok: false,
      message: "Priority must be one of LOW, MEDIUM, HIGH.",
    });
  });
});
