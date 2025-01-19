import { TRPCError } from '@trpc/server';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateError';
  }
}

export function convertToTRPCError(error: unknown): TRPCError {
  if (error instanceof AuthenticationError) {
    return new TRPCError({
      code: 'UNAUTHORIZED',
      message: error.message,
    });
  }

  if (error instanceof ValidationError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
    });
  }

  if (error instanceof DuplicateError) {
    return new TRPCError({
      code: 'CONFLICT',
      message: error.message,
    });
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'エラーが発生しました。しばらく時間をおいて再度お試しください。',
      cause: error,
    });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'エラーが発生しました。しばらく時間をおいて再度お試しください。',
  });
}
