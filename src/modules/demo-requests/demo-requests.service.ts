import { DemoRequestsRepository } from "./demo-requests.repository";
import type { CreateDemoRequestInput } from "./demo-requests.validator";
import type { DemoRequest } from "@/lib/db/schema";

const repo = new DemoRequestsRepository();

export class DemoRequestsService {
  async create(data: CreateDemoRequestInput): Promise<DemoRequest> {
    return repo.create(data);
  }
}
