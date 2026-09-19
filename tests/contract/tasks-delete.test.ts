import { beforeEach, describe, expect, it } from "vitest";
import { DELETE } from "../../app/api/tasks/[id]/route";
import { prisma } from "../../lib/db";

function deleteTask(id: number) {
  return DELETE(new Request(`http://localhost/api/tasks/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id: String(id) }),
  });
}

describe("DELETE /api/tasks/{id}", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("deletes an existing todo and returns 204 with no body", async () => {
    const todo = await prisma.todo.create({ data: { title: "task" } });
    const res = await deleteTask(todo.id);
    expect(res.status).toBe(204);

    const stillThere = await prisma.todo.findUnique({ where: { id: todo.id } });
    expect(stillThere).toBeNull();
  });

  it("returns 404 for an unknown id", async () => {
    const res = await deleteTask(999999);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
