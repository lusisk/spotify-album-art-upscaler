import { NextResponse } from "next/server";

export class ApiResponse {
  /**
   * Returns a successful JSON response
   */
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  /**
   * Returns an error JSON response
   */
  static error(message: string, status: number = 500) {
    return NextResponse.json({ error: message }, { status });
  }

  /**
   * Returns a bad request error (400)
   */
  static badRequest(message: string = "Bad request") {
    return this.error(message, 400);
  }

  /**
   * Returns an unauthorized error (401)
   */
  static unauthorized(message: string = "Unauthorized") {
    return this.error(message, 401);
  }

  /**
   * Returns a not found error (404)
   */
  static notFound(message: string = "Not found") {
    return this.error(message, 404);
  }

  /**
   * Returns an internal server error (500)
   */
  static serverError(message: string = "Internal server error") {
    return this.error(message, 500);
  }
}
