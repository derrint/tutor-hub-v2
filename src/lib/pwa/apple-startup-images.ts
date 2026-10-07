/** iOS standalone launch images — keep in sync with `scripts/generate-pwa-splash.mjs`. */
export const APPLE_STARTUP_IMAGES = [
  {
    url: "/pwa/splash/iphone-se-640x1136.png",
    media:
      "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/pwa/splash/iphone-8-750x1334.png",
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/pwa/splash/iphone-xr-828x1792.png",
    media:
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    url: "/pwa/splash/iphone-12-mini-1080x2340.png",
    media:
      "(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/pwa/splash/iphone-12-13-14-1170x2532.png",
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/pwa/splash/iphone-14-plus-1284x2778.png",
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    url: "/pwa/splash/ipad-pro-11-1668x2388.png",
    media:
      "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
] as const;
