import { db } from "@/lib/db";
import { demoRequests } from "@/lib/db/schema";
import type { DemoRequest, NewDemoRequest } from "@/lib/db/schema";

export class DemoRequestsRepository {
  async create(data: Omit<NewDemoRequest, "id" | "created_at" | "status">): Promise<DemoRequest> {
    const [row] = await db.insert(demoRequests).values(data).returning();
    return row;
  }
}
