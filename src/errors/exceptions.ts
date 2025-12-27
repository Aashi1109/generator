export abstract class BaseException extends Error {
  abstract statusCode: number;

  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
      },
    };
  }
}

export class ValidationException extends BaseException {
  statusCode = 400;

  constructor(message: string, public readonly errors?: any[]) {
    super(message, "VALIDATION_ERROR");
  }

  toJSON() {
    return {
      ...super.toJSON(),
      error: {
        ...super.toJSON().error,
        errors: this.errors,
      },
    };
  }
}

export class VideoGenerationException extends BaseException {
  statusCode = 500;

  constructor(message: string, public readonly originalError?: any) {
    super(message, "VIDEO_GENERATION_ERROR");
  }
}

export class OperationTimeoutException extends BaseException {
  statusCode = 504;

  constructor(message: string = "Video generation operation timed out") {
    super(message, "OPERATION_TIMEOUT");
  }
}

export class ApiKeyException extends BaseException {
  statusCode = 401;

  constructor(message: string = "Invalid or missing API key") {
    super(message, "API_KEY_ERROR");
  }
}
