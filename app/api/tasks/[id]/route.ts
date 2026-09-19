import { prisma } from "@/lib/db";
import { validatePriority } from "@/lib/validation";
import type { ApiError, ApiSuccess, Priority, Todo } from "@/lib/types";

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

  const hasCompleted = Boolean(
    body && typeof body === "object" && "completed" in body
  );
  const hasPriority = Boolean(
    body && typeof body === "object" && "priority" in body
  );

  if (!hasCompleted && !hasPriority) {
    return errorResponse(
      400,
      "At least one of `completed` or `priority` must be provided."
    );
  }

  const data: { completed?: boolean; priority?: Priority } = {};

  if (hasCompleted) {
    const rawCompleted = (body as { completed: unknown }).completed;
    if (typeof rawCompleted !== "boolean") {
      return errorResponse(400, "`completed` must be a boolean.");
    }
    data.completed = rawCompleted;
  }

  if (hasPriority) {
    const rawPriority = (body as { priority: unknown }).priority;
    const priorityValidation = validatePriority(rawPriority);
    if (!priorityValidation.ok) {
      return errorResponse(400, priorityValidation.message);
    }
    data.priority = priorityValidation.priority;
  }

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse(404, "Todo not found.");
  }

  const todo = await prisma.todo.update({
    where: { id },
    data,
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
