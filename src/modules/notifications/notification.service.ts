import { NotificationRepository } from "./notification.repository";
import { EmailService } from "@/lib/email/email.service";

const REMINDER_DAYS = [30, 14, 7, 3, 1, 0] as const;
type ReminderDay = (typeof REMINDER_DAYS)[number];

function daysUntil(date: Date): number {
  const diffMs = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}

function getReminderType(days: ReminderDay): string {
  return `reminder_${days}d`;
}

function isReminderDay(days: number): days is ReminderDay {
  return (REMINDER_DAYS as readonly number[]).includes(days);
}

export type ReminderRunResult = {
  sent: number;
  skipped: number;
  errors: number;
};

export class NotificationService {
  private readonly repo = new NotificationRepository();
  private readonly emailService = new EmailService();

  async run(): Promise<ReminderRunResult> {
    const subscriptions = await this.repo.findActiveSubscriptionsWithAdmin();
    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const sub of subscriptions) {
      const expiryDate =
        sub.status === "trial" && sub.trial_ends_at
          ? sub.trial_ends_at
          : sub.current_period_end;

      const days = daysUntil(expiryDate);

      if (!isReminderDay(days)) {
        skipped++;
        continue;
      }

      const type = getReminderType(days);

      try {
        const alreadySent = await this.repo.hasBeenSent(
          sub.company_id,
          type,
          expiryDate
        );

        if (alreadySent) {
          skipped++;
          continue;
        }

        await this.emailService.sendReminderEmail({
          to: sub.admin_email,
          companyName: sub.company_name,
          daysRemaining: days,
          expiryDate,
          isExpired: days === 0,
        });

        await this.repo.logNotification({
          company_id: sub.company_id,
          type,
          email_to: sub.admin_email,
          period_ref: expiryDate,
        });

        sent++;
      } catch (err) {
        console.error(
          `[NotificationService] Erreur pour company ${sub.company_id}:`,
          err
        );
        errors++;
      }
    }

    return { sent, skipped, errors };
  }
}
