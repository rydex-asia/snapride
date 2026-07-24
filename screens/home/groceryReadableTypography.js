function readableSize(size) {
  if (typeof size !== "number") return size;
  if (size <= 10) return 12;
  if (size <= 11) return 13;
  if (size <= 12) return 14;
  if (size <= 14) return 15;
  return size;
}

export function withReadableGroceryTypography(styleMap) {
  return Object.fromEntries(Object.entries(styleMap).map(([key, value]) => {
    if (!value || Array.isArray(value) || typeof value !== "object" || typeof value.fontSize !== "number") return [key, value];
    const fontSize = readableSize(value.fontSize);
    const upgraded = {
      ...value,
      fontSize,
    };
    if (typeof value.lineHeight === "number") upgraded.lineHeight = Math.max(value.lineHeight + (fontSize - value.fontSize), fontSize + 4);
    return [key, upgraded];
  }));
}
