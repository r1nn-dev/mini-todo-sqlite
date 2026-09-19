import type { Priority, Todo } from "@prisma/client";

export type { Priority, Todo };

export type ApiSuccess<T> = { data: T };
export type ApiError = { error: { message: string } };
