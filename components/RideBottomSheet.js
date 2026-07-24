import React, { forwardRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { SHADOWS } from "../theme/shadows";
import { SHEET_PHYSICS } from "../theme/motion";

const RideBottomSheet = forwardRef(function RideBottomSheet(
  {
    children,
    snapPoints = ["40%", "70%", "92%"], // 👈 better defaults
    initialIndex = 0, // 👈 start collapsed
    onChange,
    topInset = 0,
    backgroundStyle,
    handleIndicatorStyle,
    style,
    topAccessory,
  },
  ref
) {
  const memoSnapPoints = useMemo(() => snapPoints, [snapPoints]);
  const handleComponent = useMemo(() => {
    if (!topAccessory) return undefined;

    return () => (
      <View style={styles.customHandle}>
        <View style={styles.accessoryWrap} pointerEvents="none">
          {topAccessory}
        </View>
        <View style={styles.handle} />
      </View>
    );
  }, [topAccessory]);

  return (
    <BottomSheet
      ref={ref}
      index={initialIndex}
      snapPoints={memoSnapPoints}
      enablePanDownToClose={false}
      enableOverDrag
      overDragResistanceFactor={3.6}
      animationConfigs={SHEET_PHYSICS.gorhom}
      animateOnMount
      onChange={onChange}
      topInset={topInset}
      backgroundStyle={[styles.background, backgroundStyle]}
      handleComponent={handleComponent}
      handleIndicatorStyle={topAccessory ? styles.hiddenHandle : [styles.handle, handleIndicatorStyle]}
      style={[styles.sheet, SHADOWS.sheet, style]}
    >
      {children}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius:0,
    borderTopRightRadius: 0,
    backgroundColor: "#FFFFFF",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 99,
    backgroundColor: "#E5E7EB",
  },
  hiddenHandle: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  sheet: {
    flex: 1
  },
  customHandle: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 40,
    overflow: "visible",
  },
  accessoryWrap: {
    width: "100%",
    position: "absolute",
    top: -12,
    left: 0,
    right: 0,
    alignItems: "center",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});

export default RideBottomSheet;
