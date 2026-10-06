import { MonthlyReportDocument } from "@/lib/reports/pdf/MonthlyReportDocument";
import type { MonthlyReportPdfProps } from "@/lib/reports/pdf/MonthlyReportDocument";
import { registerReportPdfFonts } from "@/lib/reports/pdf/register-fonts";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import React, { type ReactElement } from "react";

export async function generateMonthlyReportPdf(
  props: MonthlyReportPdfProps,
): Promise<Buffer> {
  registerReportPdfFonts();
  const document = React.createElement(
    MonthlyReportDocument,
    props,
  ) as unknown as ReactElement<DocumentProps>;

  const blob = await pdf(document).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
