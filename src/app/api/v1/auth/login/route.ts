import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { loginSchema } from "@/modules/auth/auth.validator";
import { AuthService } from "@/modules/auth/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.errors[0].message, 422);
    }

    const result = await AuthService.login(parsed.data.email, parsed.data.password);
    return ApiResponse.success(result, "Login successful");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return ApiResponse.error(message, 401);
  }
}
