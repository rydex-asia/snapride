export function fontFamilyForWeight(fontWeight) {
  switch (fontWeight) {
    case "400":
      return "Inter_400Regular";
    case "500":
      return "Inter_500Medium";
    default:
      return "Inter_600SemiBold";
  }
}

function makeType(fontSize, lineHeight, fontWeight, letterSpacing = 0) {
  const style = {
    fontSize,
    lineHeight,
    fontWeight,
    fontFamily: fontFamilyForWeight(fontWeight),
  };

  if (letterSpacing !== 0) {
    style.letterSpacing = letterSpacing;
  }

  return style;
}

export function groceryFontFamilyForWeight(fontWeight) {
  return fontFamilyForWeight(fontWeight);
}

function makeGroceryType(fontSize, lineHeight, fontWeight, letterSpacing = 0) {
  const style = {
    fontSize,
    lineHeight,
    fontWeight,
    fontFamily: groceryFontFamilyForWeight(fontWeight),
  };

  if (letterSpacing !== 0) {
    style.letterSpacing = letterSpacing;
  }

  return style;
}

function makeGroceryProductType(fontSize, lineHeight, fontWeight, letterSpacing = 0) {
  const suffix = {
    "400": "400Regular",
    "500": "500Medium",
    "600": "600SemiBold",
    "700": "700Bold",
    "800": "800ExtraBold",
    "900": "800ExtraBold",
  }[fontWeight] || "500Medium";

  return {
    fontSize,
    lineHeight,
    fontWeight,
    fontFamily: `PlusJakartaSans_${suffix}`,
    ...(letterSpacing !== 0 ? { letterSpacing } : {}),
  };
}

export const TYPOGRAPHY = {
  headerTitle: makeType(18, 22, "600", -0.2),
  navTitle: makeType(19, 24, "600", -0.1),
  navTitleStrong: makeType(19, 24, "600", -0.1),
  titleLarge: makeType(20, 24, "600", -0.3),
  sectionTitle: makeType(18, 22, "500", -0.15),
  sectionTitleStrong: makeType(19, 24, "500", -0.15),
  cardTitle: makeType(16, 20, "500", -0.15),
  label: makeType(13, 16, "500"),
  labelStrong: makeType(13, 16, "500"),
  body: makeType(14, 18, "400"),
  bodyStrong: makeType(14, 18, "500"),
  bodyStrongTight: makeType(15, 19, "600"),
  caption: makeType(12, 16, "500"),
  captionStrong: makeType(12, 16, "500"),
  micro: makeType(11, 14, "500"),
  microStrong: makeType(11, 14, "500"),
  eyebrow: makeType(10, 12, "500", 0.4),
  button: makeType(15, 20, "600"),
  buttonSmall: makeType(13, 16, "600"),
  metric: makeType(24, 28, "600", -0.3),
  heroMetric: makeType(30, 36, "600", -0.4),
  displayMetric: makeType(46, 50, "600", -0.8),
  heroName: makeType(20, 24, "600", -0.25),
  heroKicker: makeType(12, 16, "500", 0.35),
};

export const GROCERY_TYPOGRAPHY = {
  display: makeGroceryType(24, 28, "600", -0.55),
  heroTitle: makeGroceryType(21, 25, "600", -0.4),
  sectionTitle: makeGroceryType(18, 22, "500", -0.3),
  sectionEyebrow: makeGroceryType(11, 14, "500", 1.4),
  cardTitle: makeGroceryType(15, 19, "500", -0.2),
  productName: makeGroceryProductType(12, 16, "600", -0.12),
  productNameLarge: makeGroceryProductType(14, 18, "700", -0.2),
  price: makeGroceryProductType(15, 19, "800", -0.3),
  priceLarge: makeGroceryProductType(19, 23, "800", -0.4),
  body: makeGroceryType(13, 18, "400", -0.05),
  bodyStrong: makeGroceryType(13, 18, "500", -0.1),
  caption: makeGroceryType(11, 14, "500", 0),
  micro: makeGroceryType(10, 13, "500", 0.04),
  button: makeGroceryType(14, 18, "600", -0.16),
};

export default TYPOGRAPHY;
