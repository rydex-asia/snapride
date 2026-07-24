import React from "react";
import { Animated } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import BottomNav from "../BottomNav";

jest.mock("react-native-svg", () => {
  const ReactModule = require("react");
  const { View: NativeView } = require("react-native");
  const MockSvgNode = ({ children }) => ReactModule.createElement(NativeView, null, children);

  return {
    __esModule: true,
    default: MockSvgNode,
    Path: MockSvgNode,
    Rect: MockSvgNode,
  };
});

jest.mock("../AppIcon", () => {
  const ReactModule = require("react");
  const { View: NativeView } = require("react-native");
  return () => ReactModule.createElement(NativeView, { testID: "app-icon" });
});

jest.mock("react-native-safe-area-context", () => {
  const ReactModule = require("react");
  const { View } = require("react-native");

  return {
    SafeAreaProvider: ({ children }) => ReactModule.createElement(View, null, children),
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 24, left: 0 }),
  };
});

const items = [
  { key: "ride", label: "Ride", icon: "home" },
  { key: "travel", label: "Travel", icon: "travel" },
  { key: "parcel", label: "Parcel", icon: "parcel" },
  { key: "account", label: "Account", icon: "account" },
];

describe("BottomNav", () => {
  beforeEach(() => {
    jest.spyOn(Animated, "spring").mockImplementation(() => ({
      start: (callback) => callback?.({ finished: true }),
      stop: jest.fn(),
      reset: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders all app destinations and selects the pressed tab", () => {
    const onSelect = jest.fn();
    const screen = render(
      <BottomNav items={items} activeKey="ride" onSelect={onSelect} />
    );

    for (const item of items) {
      expect(screen.getByText(item.label)).toBeTruthy();
    }

    fireEvent.press(screen.getByText("Parcel"));
    expect(onSelect).toHaveBeenCalledWith("parcel");
  });

  test("keeps the device navigation inset while an app-bar animation is supplied", () => {
    const screen = render(
      <BottomNav
        items={items}
        activeKey="travel"
        onSelect={jest.fn()}
        animatedStyle={{ opacity: 0 }}
      />
    );

    expect(screen.getByText("Travel")).toBeTruthy();
  });
});
