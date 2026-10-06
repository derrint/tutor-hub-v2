import { auth } from "@/auth";
import { buildMonthlyReportPdfFilename } from "@/lib/reports/pdf/filename";
import { generateMonthlyReportPdf } from "@/lib/reports/pdf/generate-monthly-report-pdf";
import { loadMonthlyReportPdfProps } from "@/lib/reports/pdf/load-report-pdf-props";
import type { InvoicePeriod } from "@/utils/format";
import { NextResponse } from "next/server";

function parsePeriod(
  monthRaw: string | null,
  yearRaw: string | null,
): InvoicePeriod | null {
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  if (
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12 ||
    year < 2000 ||
    year > 2100
  ) {
    return null;
  }
  return { month, year };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId")?.trim();
  const period = parsePeriod(
    searchParams.get("month"),
    searchParams.get("year"),
  );

  if (!studentId || !period) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const props = await loadMonthlyReportPdfProps({ studentId, period });
  if (!props) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const pdf = await generateMonthlyReportPdf(props);
    const filename = buildMonthlyReportPdfFilename(props.studentName, period);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[reports/pdf]", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
