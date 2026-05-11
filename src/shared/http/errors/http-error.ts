export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code = 'HTTP_ERROR',
  ) {
    super(message);
    this.name = code;
  }
}
