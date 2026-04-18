import { ApiResponse } from "@/lib/api/response";
import { AuthService } from "@/modules/auth/auth.service";

export async function GET() {
  try {
    const user = await AuthService.getAuthenticatedUser();
    return ApiResponse.success(user, "User retrieved");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return ApiResponse.error(message, 401);
  }
}
