import { beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "../../app/api/tasks/route";
import { prisma } from "../../lib/db";

function postTasks(body: unknown) {
  return POST(
    new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}

describe("Add-and-view todo flow (spec User Story 1)", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("adds a todo to an empty list and it appears as incomplete with MEDIUM priority", async () => {
    const before = await (await GET()).json();
    expect(before.data).toEqual([]);

    await postTasks({ title: "우유 사기" });

    const after = await (await GET()).json();
    expect(after.data).toHaveLength(1);
    expect(after.data[0]).toMatchObject({
      title: "우유 사기",
      completed: false,
      priority: "MEDIUM",
    });
  });

  it("adds a todo with an explicit priority", async () => {
    await postTasks({ title: "urgent thing", priority: "HIGH" });

    const { data } = await (await GET()).json();
    expect(data[0]).toMatchObject({ title: "urgent thing", priority: "HIGH" });
  });

  it("adding a second todo leaves the first unchanged", async () => {
    await postTasks({ title: "first" });
    await postTasks({ title: "second" });

    const { data } = await (await GET()).json();
    expect(data).toHaveLength(2);
    expect(data.map((t: { title: string }) => t.title)).toEqual([
      "first",
      "second",
    ]);
  });

  it("submitting a blank title adds nothing to the list", async () => {
    const res = await postTasks({ title: "   " });
    expect(res.status).toBe(400);

    const { data } = await (await GET()).json();
    expect(data).toEqual([]);
  });
});
