export type PublicReportErrorCode =
  | "INVALID_LOCATION"
  | "INACTIVE_LOCATION"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED";

export type PublicReportFieldErrors = {
  categoryIds?: string;
  description?: string;
};

export class PublicReportError extends Error {
  constructor(
    readonly code: PublicReportErrorCode,
    message: string,
    readonly fieldErrors: PublicReportFieldErrors = {},
  ) {
    super(message);
    this.name = "PublicReportError";
  }
}
