import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import type { Site, NewSite } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export class SitesRepository {
  async findByCompanyId(companyId: string): Promise<Site[]> {
    return db.select().from(sites).where(eq(sites.company_id, companyId));
  }

  async findById(id: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
    return site;
  }

  async findByIdAndCompanyId(id: string, companyId: string): Promise<Site | undefined> {
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, id))
      .limit(1);
    if (!site || site.company_id !== companyId) return undefined;
    return site;
  }

  async findByQrToken(qrToken: string): Promise<Site | undefined> {
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.qr_token, qrToken))
      .limit(1);
    return site;
  }

  async countByCompanyId(companyId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(sites)
      .where(eq(sites.company_id, companyId));
    return result?.count ?? 0;
  }

  async create(data: NewSite): Promise<Site> {
    const [site] = await db.insert(sites).values(data).returning();
    return site;
  }

  async update(id: string, data: Partial<Omit<NewSite, "id" | "company_id" | "created_at">>): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set(data)
      .where(eq(sites.id, id))
      .returning();
    return site;
  }

  async delete(id: string): Promise<void> {
    await db.delete(sites).where(eq(sites.id, id));
  }
}
