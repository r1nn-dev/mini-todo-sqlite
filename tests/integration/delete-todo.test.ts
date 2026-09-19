import { beforeEach, describe, expect, it } from "vitest";
import { DELETE } from "../../app/api/tasks/[id]/route";
import { GET } from "../../app/api/tasks/route";
import { prisma } from "../../lib/db";

function deleteTask(id: number) {
  return DELETE(new Request(`http://localhost/api/tasks/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id: String(id) }),
  });
}

describe("Delete todo flow (spec User Story 3)", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("deleting one of several todos removes only that one", async () => {
    const a = await prisma.todo.create({ data: { title: "a" } });
    const b = await prisma.todo.create({ data: { title: "b" } });

    await deleteTask(a.id);

    const { data } = await (await GET()).json();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(b.id);
  });

  it("deleting the last remaining todo results in the empty-list state", async () => {
    const only = await prisma.todo.create({ data: { title: "only" } });

    await deleteTask(only.id);

    const { data } = await (await GET()).json();
    expect(data).toEqual([]);
  });
});
