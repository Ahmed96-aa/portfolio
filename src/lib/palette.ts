export const PALETTE_EVENT = 'palette:open';

export const openPalette = () => window.dispatchEvent(new Event(PALETTE_EVENT));

/** "⌘K" on Apple platforms, "Ctrl K" elsewhere. */
export function shortcutLabel(): string {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? '';
  return /mac|iphone|ipad/i.test(platform) ? '⌘K' : 'Ctrl K';
}
