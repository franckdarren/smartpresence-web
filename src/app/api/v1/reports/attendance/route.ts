import { type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ApiResponse } from "@/lib/api/response";
import {
  GuardError,
  requireRole,
  requireActiveSubscription,
  requireFeature,
} from "@/lib/api/guards";
import { ReportsService } from "@/modules/reports/reports.service";
import { ReportDocument } from "@/modules/reports/templates/ReportDocument";
import { reportQuerySchema } from "@/modules/reports/reports.validator";

const reportsService = new ReportsService();

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 404);

    await requireActiveSubscription(user.company_id);
    await requireFeature(user.company_id, "advanced_reports");

    const { searchParams } = new URL(req.url);
    const result = reportQuerySchema.safeParse({
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      employeeId: searchParams.get("employeeId") ?? undefined,
    });

    if (!result.success) {
      return ApiResponse.error(result.error.issues[0].message, 422);
    }

    const { from, to, employeeId } = result.data;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate > toDate) {
      return ApiResponse.error("La date de début doit être antérieure à la date de fin", 422);
    }

    const data = await reportsService.buildReportData(
      user.company_id,
      fromDate,
      toDate,
      employeeId
    );

    const buffer = await renderToBuffer(
      React.createElement(ReportDocument, { data })
    );

    const filename = `rapport-presences_${from}_${to}.pdf`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}
