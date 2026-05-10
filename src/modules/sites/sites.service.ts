import { randomUUID } from "crypto";
import { SitesRepository } from "./sites.repository";
import { SubscriptionRepository } from "@/modules/subscriptions/subscription.repository";
import type { Site } from "@/lib/db/schema";
import type { CreateSiteInput, UpdateSiteInput } from "./sites.validator";

const repo = new SitesRepository();
const subRepo = new SubscriptionRepository();

export class SitesService {
  async listByCompany(companyId: string): Promise<Site[]> {
    return repo.findByCompanyId(companyId);
  }

  async getByIdInCompany(id: string, companyId: string): Promise<Site> {
    const site = await repo.findByIdAndCompanyId(id, companyId);
    if (!site) throw new Error("Site introuvable");
    return site;
  }

  async create(data: CreateSiteInput, companyId: string): Promise<Site> {
    // Check site limit before creating
    const subWithPlan = await subRepo.findByCompanyIdWithPlan(companyId);
    if (!subWithPlan) throw new Error("Aucun abonnement actif");

    const { plan } = subWithPlan;
    if (plan.max_sites !== null) {
      const current = await repo.countByCompanyId(companyId);
      if (current >= plan.max_sites) {
        throw new Error(
          `Limite de sites atteinte (${current}/${plan.max_sites}). Passez à un plan supérieur.`
        );
      }
    }

    // Enforce Wi-Fi gating per plan
    if (data.wifi_ssid && !plan.wifi_check_enabled) {
      throw new Error(
        "La vérification Wi-Fi n'est pas disponible sur votre plan. Passez au plan Business ou supérieur."
      );
    }

    return repo.create({
      company_id: companyId,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      wifi_ssid: data.wifi_ssid ?? null,
    });
  }

  async update(id: string, companyId: string, data: UpdateSiteInput): Promise<Site> {
    await this.getByIdInCompany(id, companyId);

    // Enforce Wi-Fi gating on update
    if (data.wifi_ssid != null && data.wifi_ssid !== "") {
      const subWithPlan = await subRepo.findByCompanyIdWithPlan(companyId);
      if (subWithPlan && !subWithPlan.plan.wifi_check_enabled) {
        throw new Error(
          "La vérification Wi-Fi n'est pas disponible sur votre plan. Passez au plan Business ou supérieur."
        );
      }
    }

    return repo.update(id, data);
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this.getByIdInCompany(id, companyId);
    await repo.delete(id);
  }

  async regenerateToken(id: string, companyId: string): Promise<Site> {
    await this.getByIdInCompany(id, companyId);
    return repo.update(id, { qr_token: randomUUID() });
  }
}
