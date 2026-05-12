import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { createDemoRequestSchema } from "@/modules/demo-requests/demo-requests.validator";
import { DemoRequestsService } from "@/modules/demo-requests/demo-requests.service";

const service = new DemoRequestsService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createDemoRequestSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }
    const demoRequest = await service.create(parsed.data);
    return ApiResponse.success(demoRequest, "Demande de démo enregistrée", 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 500);
  }
}
