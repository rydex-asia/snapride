const React = require("react");
const { StyleSheet, Text, TextInput } = require("react-native");
const { FONT_FAMILY } = require("./fonts");

const jsxRuntime = require("react/jsx-runtime");
let jsxDevRuntime = null;
try {
  jsxDevRuntime = require("react/jsx-dev-runtime");
} catch {
  jsxDevRuntime = null;
}

const originalCreateElement = React.createElement;

function injectFont(style, fontFamily) {
  const fontOverride = { fontFamily };
  if (Array.isArray(style)) return [...style, fontOverride];
  if (style) return [style, fontOverride];
  return fontOverride;
}

function resolveFontFamily(type, props) {
  if (type === TextInput || type?.displayName === "TextInput") {
    return FONT_FAMILY.body;
  }

  const style = StyleSheet.flatten(props?.style) || {};
  const family = String(style?.fontFamily || "");
  const isLegacyUiFamily = family.startsWith("Manrope_") || family.startsWith("Poppins_") || family.startsWith("Gilroy-");
  if (family && !isLegacyUiFamily) return family;
  const weight = String(style?.fontWeight || "").toLowerCase();

  if (["900", "800", "700", "600", "bold", "semibold"].includes(weight)) return FONT_FAMILY.bodySemiBold;
  if (weight === "500") return FONT_FAMILY.bodyMedium;

  if (Number(style?.fontSize) >= 18) return FONT_FAMILY.heading;

  return FONT_FAMILY.body;
}

function withTypography(type, props) {
  const isTextElement = type === Text || type === TextInput || type?.displayName === "Text" || type?.displayName === "TextInput";
  if (!isTextElement) return props;

  return {
    ...props,
    style: injectFont(props?.style, resolveFontFamily(type, props)),
  };
}

function patchJsxRuntime(runtime) {
  if (!runtime) return;

  const originalJsx = runtime.jsx;
  const originalJsxs = runtime.jsxs;
  const originalJsxDEV = runtime.jsxDEV;

  if (typeof originalJsx === "function") {
    runtime.jsx = (type, props, key) => originalJsx(type, withTypography(type, props), key);
  }

  if (typeof originalJsxs === "function") {
    runtime.jsxs = (type, props, key) => originalJsxs(type, withTypography(type, props), key);
  }

  if (typeof originalJsxDEV === "function") {
    runtime.jsxDEV = (type, props, key, isStaticChildren, source, self) =>
      originalJsxDEV(type, withTypography(type, props), key, isStaticChildren, source, self);
  }
}

patchJsxRuntime(jsxRuntime);
patchJsxRuntime(jsxDevRuntime);

React.createElement = function patchedCreateElement(type, props, ...children) {
  return originalCreateElement.call(React, type, withTypography(type, props), ...children);
};
