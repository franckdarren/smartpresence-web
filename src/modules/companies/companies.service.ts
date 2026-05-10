import { CompaniesRepository } from "./companies.repository";
import { SubscriptionRepository } from "@/modules/subscriptions/subscription.repository";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import type { Company, NewCompany } from "@/lib/db/schema";

const repo = new CompaniesRepository();
const subscriptionRepo = new SubscriptionRepository();
const subscriptionService = new SubscriptionService();

export class CompaniesService {
  async getById(id: string): Promise<Company> {
    const company = await repo.findById(id);
    if (!company) throw new Error("Entreprise introuvable");
    return company;
  }

  async getByToken(token: string): Promise<Company> {
    const company = await repo.findByToken(token);
    if (!company) throw new Error("Entreprise introuvable");
    return company;
  }

  async list(): Promise<Company[]> {
    return repo.findAll();
  }

  async create(data: NewCompany): Promise<Company> {
    const company = await repo.create(data);

    // Démarre automatiquement un trial starter pour la nouvelle entreprise
    try {
      const starterPlan = await subscriptionRepo.findPlanByName("starter");
      if (starterPlan) {
        await subscriptionService.createTrialSubscription(
          company.id,
          starterPlan.id
        );
      }
    } catch (err) {
      console.error("[CompaniesService] Failed to create trial subscription:", err);
    }

    return company;
  }

  async update(id: string, data: Partial<NewCompany>): Promise<Company> {
    await this.getById(id);
    return repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return repo.delete(id);
  }
}
