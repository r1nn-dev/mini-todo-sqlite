import { beforeEach, describe, expect, it } from "vitest";
import { PATCH } from "../../app/api/tasks/[id]/route";
import { prisma } from "../../lib/db";

function patchTask(id: number, body: unknown) {
  return PATCH(
    new Request(`http://localhost/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: String(id) }) }
  );
}

describe("PATCH /api/tasks/{id}", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("toggles an incomplete todo to complete", async () => {
    const todo = await prisma.todo.create({ data: { title: "task" } });
    const res = await patchTask(todo.id, { completed: true });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.completed).toBe(true);
  });

  it("toggles a complete todo back to incomplete", async () => {
    const todo = await prisma.todo.create({
      data: { title: "task", completed: true },
    });
    const res = await patchTask(todo.id, { completed: false });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.completed).toBe(false);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await patchTask(999999, { completed: true });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when neither completed nor priority is provided", async () => {
    const todo = await prisma.todo.create({ data: { title: "task" } });
    const res = await patchTask(todo.id, {});
    expect(res.status).toBe(400);
  });

  it("returns 400 when completed is not a boolean", async () => {
    const todo = await prisma.todo.create({ data: { title: "task" } });
    const res = await patchTask(todo.id, { completed: "yes" });
    expect(res.status).toBe(400);
  });

  it("updates a todo's priority", async () => {
    const todo = await prisma.todo.create({ data: { title: "task" } });
    const res = await patchTask(todo.id, { priority: "HIGH" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.priority).toBe("HIGH");
    expect(body.data.completed).toBe(false);
  });

  it("updates completed and priority together", async () => {
    const todo = await prisma.todo.create({ data: { title: "task" } });
    const res = await patchTask(todo.id, { completed: true, priority: "LOW" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.completed).toBe(true);
    expect(body.data.priority).toBe("LOW");
  });

  it("returns 400 for an invalid priority", async () => {
    const todo = await prisma.todo.create({ data: { title: "task" } });
    const res = await patchTask(todo.id, { priority: "URGENT" });
    expect(res.status).toBe(400);
  });
});
