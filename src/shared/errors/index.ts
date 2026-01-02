export abstract class BaseException extends Error {
  abstract statusCode: number;
  public readonly details?: any;
  public readonly code?: string;

  constructor(message: string | object, code?: string, details?: any) {
    // Handle both string and object messages
    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);
    super(messageStr);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory function to create exception classes dynamically
 * @param name - The name of the exception class
 * @param statusCode - HTTP status code for the exception
 * @param defaultCode - Default error code
 * @param defaultMessage - Default error message (used only if no message is provided)
 * @returns A new exception class
 *
 * @example
 * const BadRequestException = createExceptionClass(
 *   'BadRequestException',
 *   400,
 *   'BAD_REQUEST',
 *   'Bad request'
 * );
 * // Use with custom message
 * throw new BadRequestException('Invalid input');
 * // Or use default message
 * throw new BadRequestException();
 */
export function createExceptionClass(
  name: string,
  statusCode: number,
  defaultCode: string,
  defaultMessage: string = "An error occurred"
) {
  return class extends BaseException {
    statusCode = statusCode;

    constructor(message: string | object = defaultMessage, details?: any) {
      super(message, defaultCode, details);
      this.name = name;
    }
  };
}

// All exceptions created using factory method
export const ValidationException = createExceptionClass(
  "ValidationException",
  400,
  "VALIDATION_ERROR",
  "Invalid request payload"
);

export const OperationTimeoutException = createExceptionClass(
  "OperationTimeoutException",
  504,
  "OPERATION_TIMEOUT",
  "Video generation operation timed out"
);

export const UnauthorizedException = createExceptionClass(
  "UnauthorizedException",
  401,
  "UNAUTHORIZED",
  "Unauthorized"
);

export const NotFoundException = createExceptionClass(
  "NotFoundException",
  404,
  "NOT_FOUND",
  "Not found"
);

export const FailureException = createExceptionClass(
  "FailureException",
  500,
  "FAILURE",
  "Operation failed"
);
