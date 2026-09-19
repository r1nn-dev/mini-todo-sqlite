import { prisma } from "@/lib/db";
import type { ApiError, ApiSuccess, Todo } from "@/lib/types";

function errorResponse(status: number, message: string) {
  return Response.json({ error: { message } } satisfies ApiError, {
    status,
  });
}

function parseId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isInteger(id) ? id : null;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return errorResponse(400, "Invalid todo id.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  const completed =
    body && typeof body === "object" && "completed" in body
      ? (body as { completed: unknown }).completed
      : undefined;

  if (typeof completed !== "boolean") {
    return errorResponse(400, "`completed` must be a boolean.");
  }

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse(404, "Todo not found.");
  }

  const todo = await prisma.todo.update({
    where: { id },
    data: { completed },
  });

  return Response.json({ data: todo } satisfies ApiSuccess<Todo>);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return errorResponse(400, "Invalid todo id.");
  }

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse(404, "Todo not found.");
  }

  await prisma.todo.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
