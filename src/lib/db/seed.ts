import { db } from "./index";
import { plans } from "./schema";

async function seed() {
  console.log("Seeding plans...");

  await db
    .insert(plans)
    .values([
      {
        name: "starter",
        price_monthly: 25000,
        max_employees: 15,
        max_sites: 1,
        extra_employee_price: 2000,
        wifi_check_enabled: false,
        excel_export_enabled: false,
        advanced_reports_enabled: false,
        api_access_enabled: false,
        history_months: 3,
      },
      {
        name: "business",
        price_monthly: 65000,
        max_employees: 50,
        max_sites: 3,
        extra_employee_price: 2000,
        wifi_check_enabled: true,
        excel_export_enabled: true,
        advanced_reports_enabled: false,
        api_access_enabled: false,
        history_months: 12,
      },
      {
        name: "enterprise",
        price_monthly: 150000,
        max_employees: null,
        max_sites: null,
        extra_employee_price: 2000,
        wifi_check_enabled: true,
        excel_export_enabled: true,
        advanced_reports_enabled: true,
        api_access_enabled: true,
        history_months: null,
      },
    ])
    .onConflictDoNothing();

  console.log("Plans seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
