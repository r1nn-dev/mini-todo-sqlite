import { prisma } from "@/lib/db";
import { validateTitle } from "@/lib/validation";
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

  const validation = validateTitle(rawTitle);
  if (!validation.ok) {
    return errorResponse(400, validation.message);
  }

  const todo = await prisma.todo.create({
    data: { title: validation.title },
  });

  return Response.json({ data: todo } satisfies ApiSuccess<Todo>, {
    status: 201,
  });
}
