import { NextResponse } from "next/server";

type ApiSuccessPayload<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiErrorPayload = {
  success: false;
  message: string;
  data: null;
};

export class ApiResponse {
  static success<T>(data: T, message: string, status = 200): NextResponse<ApiSuccessPayload<T>> {
    return NextResponse.json({ success: true, message, data }, { status });
  }

  static error(message: string, status = 400): NextResponse<ApiErrorPayload> {
    return NextResponse.json({ success: false, message, data: null }, { status });
  }
}
