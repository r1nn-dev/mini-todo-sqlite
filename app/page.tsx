"use client";

import { useEffect, useState } from "react";
import {
  addTodo,
  deleteTodo,
  listTodos,
  toggleTodo,
  updateTodoPriority,
} from "@/lib/api-client";
import type { Priority, Todo } from "@/lib/types";

const PRIORITY_OPTIONS: readonly Priority[] = ["HIGH", "MEDIUM", "LOW"];
const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTodos()
      .then(setTodos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const todo = await addTodo(title, priority);
      setTodos((prev) => [...prev, todo]);
      setTitle("");
      setPriority("MEDIUM");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo.");
    }
  }

  async function handleToggle(id: number, completed: boolean) {
    setError(null);
    try {
      const updated = await toggleTodo(id, completed);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo.");
    }
  }

  async function handlePriorityChange(id: number, newPriority: Priority) {
    setError(null);
    try {
      const updated = await updateTodoPriority(id, newPriority);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo.");
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo.");
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-xl flex-col gap-6 py-16 px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          할 일 목록
        </h1>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            aria-label="중요도"
            className="rounded border border-zinc-300 bg-white px-2 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {PRIORITY_LABELS[option]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            추가
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-zinc-500">불러오는 중...</p>
        ) : todos.length === 0 ? (
          <p className="text-sm text-zinc-500">할 일이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-2 rounded border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => handleToggle(todo.id, e.target.checked)}
                />
                <span
                  className={
                    todo.completed
                      ? "flex-1 text-zinc-400 line-through"
                      : "flex-1 text-black dark:text-zinc-50"
                  }
                >
                  {todo.title}
                </span>
                <select
                  value={todo.priority}
                  onChange={(e) =>
                    handlePriorityChange(todo.id, e.target.value as Priority)
                  }
                  aria-label={`${todo.title} 중요도`}
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {PRIORITY_LABELS[option]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDelete(todo.id)}
                  className="text-sm text-red-600 hover:underline"
                  aria-label={`${todo.title} 삭제`}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
