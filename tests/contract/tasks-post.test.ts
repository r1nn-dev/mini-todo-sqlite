import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "../../app/api/tasks/route";
import { prisma } from "../../lib/db";

function postTasks(body: unknown) {
  return POST(
    new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/tasks", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("creates a todo with a valid title, defaulting completed to false and priority to MEDIUM", async () => {
    const res = await postTasks({ title: "buy milk" });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toMatchObject({
      title: "buy milk",
      completed: false,
      priority: "MEDIUM",
    });
    expect(typeof body.data.id).toBe("number");
  });

  it("creates a todo with an explicit priority", async () => {
    const res = await postTasks({ title: "buy milk", priority: "HIGH" });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.priority).toBe("HIGH");
  });

  it("rejects an invalid priority", async () => {
    const res = await postTasks({ title: "buy milk", priority: "URGENT" });
    expect(res.status).toBe(400);
  });

  it("rejects a missing title", async () => {
    const res = await postTasks({});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("rejects an empty title", async () => {
    const res = await postTasks({ title: "" });
    expect(res.status).toBe(400);
  });

  it("rejects a whitespace-only title", async () => {
    const res = await postTasks({ title: "   " });
    expect(res.status).toBe(400);
  });

  it("rejects a title over 200 characters", async () => {
    const res = await postTasks({ title: "a".repeat(201) });
    expect(res.status).toBe(400);
  });
});
