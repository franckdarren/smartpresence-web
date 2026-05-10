import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL ?? "SmartPresence <noreply@smartpresence.app>";

export type ReminderEmailPayload = {
  to: string;
  companyName: string;
  daysRemaining: number;
  expiryDate: Date;
  isExpired: boolean;
};

function buildSubject(daysRemaining: number, isExpired: boolean): string {
  if (isExpired) return "⚠️ Votre abonnement SmartPresence a expiré";
  if (daysRemaining === 1) return "⏰ Dernier rappel : votre abonnement expire demain";
  if (daysRemaining <= 3) return `🚨 Action requise : ${daysRemaining} jours avant expiration`;
  if (daysRemaining <= 7) return `⚠️ Urgent : ${daysRemaining} jours avant expiration de votre abonnement`;
  return `📅 Rappel : votre abonnement expire dans ${daysRemaining} jours`;
}

function buildHtml(payload: ReminderEmailPayload): string {
  const { companyName, daysRemaining, expiryDate, isExpired } = payload;
  const formattedDate = expiryDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const accentColor = isExpired ? "#dc2626" : daysRemaining <= 3 ? "#f97316" : "#2563eb";

  const headline = isExpired
    ? "Votre abonnement a expiré"
    : `Votre abonnement expire dans ${daysRemaining} jour${daysRemaining > 1 ? "s" : ""}`;

  const body = isExpired
    ? `L'abonnement SmartPresence de <strong>${companyName}</strong> a expiré le <strong>${formattedDate}</strong>. Vos employés ne peuvent plus pointer. Renouvelez dès maintenant pour rétablir l'accès.`
    : `L'abonnement SmartPresence de <strong>${companyName}</strong> expirera le <strong>${formattedDate}</strong>. Renouvelez avant cette date pour éviter toute interruption de service.`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:${accentColor};padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">SmartPresence</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${headline}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">${body}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://smartpresence.app"}/dashboard"
               style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
              ${isExpired ? "Renouveler maintenant" : "Gérer mon abonnement"}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Vous recevez cet email car vous êtes administrateur de <strong>${companyName}</strong> sur SmartPresence.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

export class EmailService {
  async sendReminderEmail(payload: ReminderEmailPayload): Promise<void> {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: buildSubject(payload.daysRemaining, payload.isExpired),
      html: buildHtml(payload),
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    if (!data) {
      throw new Error("Resend returned no data");
    }
  }
}
