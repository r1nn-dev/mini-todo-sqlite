import { prisma } from "@/lib/db";
import { validatePriority, validateTitle } from "@/lib/validation";
import type { ApiError, ApiSuccess, Todo } from "@/lib/types";

function errorResponse(status: number, message: string) {
  return Response.json({ error: { message } } satisfies ApiError, {
    status,
  });
}

export async function GET() {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
  return Response.json({ data: todos } satisfies ApiSuccess<Todo[]>);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  const rawTitle =
    body && typeof body === "object" && "title" in body
      ? (body as { title: unknown }).title
      : undefined;
  const rawPriority =
    body && typeof body === "object" && "priority" in body
      ? (body as { priority: unknown }).priority
      : undefined;

  const titleValidation = validateTitle(rawTitle);
  if (!titleValidation.ok) {
    return errorResponse(400, titleValidation.message);
  }

  const priorityValidation = validatePriority(rawPriority);
  if (!priorityValidation.ok) {
    return errorResponse(400, priorityValidation.message);
  }

  const todo = await prisma.todo.create({
    data: {
      title: titleValidation.title,
      priority: priorityValidation.priority,
    },
  });

  return Response.json({ data: todo } satisfies ApiSuccess<Todo>, {
    status: 201,
  });
}
