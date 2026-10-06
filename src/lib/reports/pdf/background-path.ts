import path from "node:path";

export function reportPdfBackgroundPath(): string {
  return path.join(process.cwd(), "public/images/reports/rapot-page-bg.svg");
}
