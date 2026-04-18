import { CompaniesRepository } from "./companies.repository";
import type { Company, NewCompany } from "@/lib/db/schema";

const repo = new CompaniesRepository();

export class CompaniesService {
  async getById(id: string): Promise<Company> {
    const company = await repo.findById(id);
    if (!company) throw new Error("Company not found");
    return company;
  }

  async getByToken(token: string): Promise<Company> {
    const company = await repo.findByToken(token);
    if (!company) throw new Error("Company not found");
    return company;
  }

  async list(): Promise<Company[]> {
    return repo.findAll();
  }

  async create(data: NewCompany): Promise<Company> {
    return repo.create(data);
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
