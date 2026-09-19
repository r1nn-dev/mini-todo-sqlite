import type { ApiError, ApiSuccess, Todo } from "@/lib/types";

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiSuccess<T> | ApiError;
  if (!res.ok) {
    const message =
      "error" in body ? body.error.message : "Request failed.";
    throw new Error(message);
  }
  return (body as ApiSuccess<T>).data;
}

export async function listTodos(): Promise<Todo[]> {
  const res = await fetch("/api/tasks");
  return parseJsonResponse<Todo[]>(res);
}

export async function addTodo(title: string): Promise<Todo> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return parseJsonResponse<Todo>(res);
}

export async function toggleTodo(
  id: number,
  completed: boolean
): Promise<Todo> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  return parseJsonResponse<Todo>(res);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = (await res.json()) as ApiError;
    throw new Error(body.error.message);
  }
}
