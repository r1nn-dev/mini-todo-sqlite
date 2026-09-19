import { beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "../../app/api/tasks/route";
import { prisma } from "../../lib/db";

describe("GET /api/tasks", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("returns an empty data array when no todos exist", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: [] });
  });

  it("returns all todos ordered by createdAt ascending", async () => {
    await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "first" }),
      })
    );
    await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "second" }),
      })
    );

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].title).toBe("first");
    expect(body.data[1].title).toBe("second");
  });
});
