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

describe("Toggle todo flow (spec User Story 2)", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("toggling one of several todos changes only that todo, in both directions", async () => {
    const a = await prisma.todo.create({ data: { title: "a" } });
    const b = await prisma.todo.create({ data: { title: "b" } });

    await patchTask(a.id, { completed: true });

    let [refreshedA, refreshedB] = await Promise.all([
      prisma.todo.findUniqueOrThrow({ where: { id: a.id } }),
      prisma.todo.findUniqueOrThrow({ where: { id: b.id } }),
    ]);
    expect(refreshedA.completed).toBe(true);
    expect(refreshedB.completed).toBe(false);

    await patchTask(a.id, { completed: false });

    [refreshedA, refreshedB] = await Promise.all([
      prisma.todo.findUniqueOrThrow({ where: { id: a.id } }),
      prisma.todo.findUniqueOrThrow({ where: { id: b.id } }),
    ]);
    expect(refreshedA.completed).toBe(false);
    expect(refreshedB.completed).toBe(false);
  });
});
