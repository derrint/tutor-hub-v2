/**
 * Generates iOS apple-touch-startup-image PNGs (white bg + mark + TutorHub wordmark).
 * Run: node scripts/generate-pwa-splash.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public/pwa/splash");
/** Matches header wordmark: Outfit bold + gray-900 + tracking-tight (`AppHeader` / `AppSidebar`). */
const OUTFIT_BOLD = path.join(root, "public/pwa/fonts/Outfit-Bold.ttf");
const OUTFIT_BOLD_URL = `file://${OUTFIT_BOLD.replace(/\\/g, "/")}`;
const WORDMARK_COLOR = "#101828";

const MARK = `
    <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" stroke="#465FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="#465FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="17.5" cy="17.5" r="3.5" stroke="#465FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
`;

/** Pixel size + Apple media query (portrait). */
const SPLASH_SPECS = [
  {
    file: "iphone-16-pro-1206x2622.png",
    w: 1206,
    h: 2622,
    media:
      "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-16-pro-max-1320x2868.png",
    w: 1320,
    h: 2868,
    media:
      "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-16-1179x2556.png",
    w: 1179,
    h: 2556,
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-se-640x1136.png",
    w: 640,
    h: 1136,
    media:
      "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    file: "iphone-8-750x1334.png",
    w: 750,
    h: 1334,
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    file: "iphone-xr-828x1792.png",
    w: 828,
    h: 1792,
    media:
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    file: "iphone-12-mini-1080x2340.png",
    w: 1080,
    h: 2340,
    media:
      "(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-12-13-14-1170x2532.png",
    w: 1170,
    h: 2532,
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-14-plus-1284x2778.png",
    w: 1284,
    h: 2778,
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "ipad-pro-11-1668x2388.png",
    w: 1668,
    h: 2388,
    media:
      "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
];

function splashSvg(w, h) {
  const base = Math.min(w, h);
  const logoSize = base * 0.28;
  const scale = logoSize / 24;
  const gap = base * 0.028;
  const fontSize = base * 0.072;
  const textBlock = fontSize * 1.15;
  const blockHeight = logoSize + gap + textBlock;
  const blockTop = (h - blockHeight) / 2;
  const tx = (w - logoSize) / 2;
  const ty = blockTop;
  const textY = blockTop + logoSize + gap + fontSize;
  const letterSpacing = fontSize * -0.025;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css"><![CDATA[
      @font-face {
        font-family: 'Outfit Splash';
        font-weight: 700;
        font-style: normal;
        src: url('${OUTFIT_BOLD_URL}') format('truetype');
      }
    ]]></style>
  </defs>
  <rect width="${w}" height="${h}" fill="#ffffff"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">${MARK}
  </g>
  <text
    x="${w / 2}"
    y="${textY}"
    text-anchor="middle"
    fill="${WORDMARK_COLOR}"
    font-family="'Outfit Splash', Outfit, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    letter-spacing="${letterSpacing}"
  >TutorHub</text>
</svg>`;
}

if (!fs.existsSync(OUTFIT_BOLD)) {
  console.error(`Missing ${OUTFIT_BOLD} — add Outfit Bold (700) for splash wordmark.`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const tmpDir = path.join(outDir, ".tmp");
fs.mkdirSync(tmpDir, { recursive: true });

for (const spec of SPLASH_SPECS) {
  const tmpSvg = path.join(tmpDir, spec.file.replace(".png", ".svg"));
  const outPng = path.join(outDir, spec.file);
  fs.writeFileSync(tmpSvg, splashSvg(spec.w, spec.h));
  execSync(
    `pnpm dlx sharp-cli --input "${tmpSvg}" --output "${outPng}" resize ${spec.w} ${spec.h}`,
    { cwd: root, stdio: "inherit" },
  );
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`Wrote ${SPLASH_SPECS.length} splash PNGs to public/pwa/splash/`);
