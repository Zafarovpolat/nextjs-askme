const DEFAULT_MAX_LINES = 4;

/**
 * Авто-высота textarea с потолком в maxLines строк; дальше — прокрутка внутри поля.
 */
export function resizeTextarea(
  el: HTMLTextAreaElement | null,
  maxLines: number = DEFAULT_MAX_LINES,
): void {
  if (!el) return;

  const computed = getComputedStyle(el);
  const lineHeight = parseFloat(computed.lineHeight);
  const lineHeightPx = Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight : 22;
  const padding =
    parseFloat(computed.paddingTop) +
    parseFloat(computed.paddingBottom) +
    parseFloat(computed.borderTopWidth) +
    parseFloat(computed.borderBottomWidth);
  const maxHeight = lineHeightPx * maxLines + padding;

  el.style.height = "auto";
  const scroll = el.scrollHeight;
  el.style.height = `${Math.min(scroll, maxHeight)}px`;
  el.style.overflowY = scroll > maxHeight ? "auto" : "hidden";
}
