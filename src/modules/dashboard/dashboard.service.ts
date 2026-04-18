import { DashboardRepository } from "./dashboard.repository";
import type { DashboardStats } from "./dashboard.repository";

const repo = new DashboardRepository();

export class DashboardService {
  async getStats(companyId: string): Promise<DashboardStats> {
    return repo.getStatsByCompany(companyId);
  }
}
