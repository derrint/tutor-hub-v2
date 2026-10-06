import { Font } from "@react-pdf/renderer";

let registered = false;

/** Rounded sans for Canva-style rapot (register once per process). */
export function registerReportPdfFonts(): void {
  if (registered) return;

  Font.register({
    family: "Quicksand",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/fontsource/fonts/quicksand@latest/latin-400-normal.ttf",
        fontWeight: 400,
      },
      {
        src: "https://cdn.jsdelivr.net/fontsource/fonts/quicksand@latest/latin-600-normal.ttf",
        fontWeight: 600,
      },
      {
        src: "https://cdn.jsdelivr.net/fontsource/fonts/quicksand@latest/latin-700-normal.ttf",
        fontWeight: 700,
      },
    ],
  });

  registered = true;
}
