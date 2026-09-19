import type { Todo } from "@prisma/client";

export type { Todo };

export type ApiSuccess<T> = { data: T };
export type ApiError = { error: { message: string } };
