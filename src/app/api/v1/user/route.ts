import { ApiResponse } from "@/lib/api/response";
import { AuthService } from "@/modules/auth/auth.service";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const user = await AuthService.getAuthenticatedUser(bearerToken);
    return ApiResponse.success(user, "User retrieved");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return ApiResponse.error(message, 401);
  }
}
