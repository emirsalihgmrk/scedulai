// Thrown by the service layer for expected failures whose message is safe to
// show the user (e.g. "Unauthorized", "Not found"). Actions surface an
// AppError's message; any other thrown error is treated as an unexpected
// internal error and hidden behind a generic message.
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}