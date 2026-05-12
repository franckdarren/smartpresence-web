import { EmployeesRepository } from "./employees.repository";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "./employees.validator";
import type { User } from "@/lib/db/schema";

const repo = new EmployeesRepository();

export class EmployeesService {
  async listByCompany(companyId: string): Promise<User[]> {
    return repo.findByCompanyId(companyId);
  }

  async getByIdInCompany(id: string, companyId: string): Promise<User> {
    const user = await repo.findByIdAndCompanyId(id, companyId);
    if (!user) throw new Error("Employé introuvable");
    return user;
  }

  async create(data: CreateEmployeeInput, companyId: string, userId: string): Promise<User> {
    return repo.create({
      id: userId,
      name: data.name,
      email: data.email,
      role: data.role,
      company_id: companyId,
    });
  }

  async update(
    id: string,
    companyId: string,
    data: UpdateEmployeeInput
  ): Promise<User> {
    await this.getByIdInCompany(id, companyId);
    return repo.update(id, data);
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this.getByIdInCompany(id, companyId);
    return repo.softDelete(id);
  }

  async listDeleted(companyId: string): Promise<User[]> {
    return repo.findDeletedByCompanyId(companyId);
  }

  async restore(id: string, companyId: string): Promise<void> {
    const deleted = await repo.findDeletedByCompanyId(companyId);
    const found = deleted.find((u) => u.id === id);
    if (!found) throw new Error("Employé archivé introuvable");
    return repo.restore(id);
  }
}
