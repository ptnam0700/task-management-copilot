/**
 * Custom error class for API errors with status code and error code
 */
export class ApiError extends Error {
  static fromError(error: unknown) {
      throw new Error('Method not implemented.');
  }
  statusCode: number;
  code: string;
  errors?: any[];

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'SERVER_ERROR',
    errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;

    // This is needed because we're extending a built-in class
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create a Bad Request error (400)
   */
  static badRequest(message: string, code: string = 'BAD_REQUEST', errors?: any[]): ApiError {
    return new ApiError(message, 400, code, errors);
  }

  /**
   * Create an Unauthorized error (401)
   */
  static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED'): ApiError {
    return new ApiError(message, 401, code);
  }

  /**
   * Create a Forbidden error (403)
   */
  static forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN'): ApiError {
    return new ApiError(message, 403, code);
  }

  /**
   * Create a Not Found error (404)
   */
  static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND'): ApiError {
    return new ApiError(message, 404, code);
  }

  /**
   * Create a Conflict error (409)
   */
  static conflict(message: string, code: string = 'CONFLICT'): ApiError {
    return new ApiError(message, 409, code);
  }

  /**
   * Create a Validation Error (422)
   */
  static validation(message: string = 'Validation error', errors: any[]): ApiError {
    return new ApiError(message, 422, 'VALIDATION_ERROR', errors);
  }

  /**
   * Create a Server Error (500)
   */
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500, 'SERVER_ERROR');
  }
}