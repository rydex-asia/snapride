import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";

const BLUE = "#138A36";
const TEXT = "#0E1116";
const MUTED = "#5F6673";
const LINE = "#DDE2EA";

function Cloud({ style }) {
  return (
    <View style={[styles.cloud, style]}>
      <View style={styles.cloudBumpA} />
      <View style={styles.cloudBumpB} />
    </View>
  );
}

function CityLine() {
  return (
    <View style={styles.cityWrap}>
      <Cloud style={styles.cloudLeft} />
      <Cloud style={styles.cloudRight} />
      <View style={styles.skyline}>
        {[22, 44, 30, 58, 38, 72, 48, 34, 62, 42].map((height, index) => (
          <View key={index} style={[styles.tower, { height, left: 18 + index * 24 }]} />
        ))}
      </View>
      <View style={styles.groundLine} />
      <View style={styles.blueHillLeft} />
      <View style={styles.blueHillRight} />
    </View>
  );
}

function CarGraphic() {
  return (
    <View style={styles.carWrap}>
      <View style={styles.carBody}>
        <View style={styles.carWindow} />
        <View style={styles.carWindowSmall} />
      </View>
      <View style={[styles.wheel, styles.wheelLeft]} />
      <View style={[styles.wheel, styles.wheelRight]} />
    </View>
  );
}

function WarningTriangle() {
  return (
    <View style={styles.warningWrap}>
      <View style={styles.warningTriangle} />
      <Text style={styles.warningMark}>!</Text>
      <View style={styles.warningBadge}>
        <Text style={styles.warningBadgeText}>!</Text>
      </View>
    </View>
  );
}

function PhoneUpdate() {
  return (
    <View style={styles.phoneWrap}>
      <View style={styles.phoneNotch} />
      <View style={styles.downloadCircle}>
        <Text style={styles.downloadText}>↓</Text>
      </View>
    </View>
  );
}

function LoadingGraphic({ spin }) {
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <View style={styles.loadingGraphic}>
      <Animated.View style={[styles.loadingRing, { transform: [{ rotate }] }]}>
        <View style={styles.ringBlueA} />
        <View style={styles.ringBlueB} />
        <View style={styles.ringBlueC} />
      </Animated.View>
      <View style={styles.loadingCarBubble}>
        <AppIcon name="car" size={34} color={BLUE} />
      </View>
    </View>
  );
}

function MaintenanceGraphic() {
  return (
    <View style={styles.maintenanceWrap}>
      <View style={styles.gearBubble}>
        <AppIcon name="settings" size={30} color={BLUE} active />
      </View>
      <View style={styles.barrier}>
        <View style={styles.barrierStripe} />
        <View style={[styles.barrierStripe, styles.barrierStripeTwo]} />
        <View style={[styles.barrierStripe, styles.barrierStripeThree]} />
      </View>
      <View style={styles.barrierLegLeft} />
      <View style={styles.barrierLegRight} />
    </View>
  );
}

function WifiGraphic() {
  return (
    <View style={styles.wifiWrap}>
      <View style={styles.wifiCloud} />
      <AppIcon name="wifi" size={44} color={BLUE} />
      <View style={styles.wifiClose}>
        <Text style={styles.wifiCloseText}>×</Text>
      </View>
    </View>
  );
}

function Illustration({ variant, spin }) {
  return (
    <View style={styles.illustration}>
      {variant !== "loading" ? <CityLine /> : null}
      {variant === "empty" ? (
        <>
          <CarGraphic />
          <View style={styles.bigPin}>
            <AppIcon name="location" size={34} color="#FFFFFF" active />
          </View>
          <View style={styles.tree} />
        </>
      ) : null}
      {variant === "error" ? <WarningTriangle /> : null}
      {variant === "update" ? <PhoneUpdate /> : null}
      {variant === "loading" ? <LoadingGraphic spin={spin} /> : null}
      {variant === "maintenance" ? <MaintenanceGraphic /> : null}
      {variant === "offline" ? <WifiGraphic /> : null}
    </View>
  );
}

function EmptyControls({ onPrimary, onSecondary }) {
  return (
    <View style={styles.emptyControls}>
      <View style={styles.pickupInputWrap}>
        <View style={styles.pickupDot}>
          <AppIcon name="location" size={14} color="#FFFFFF" active />
        </View>
        <TextInput
          editable={false}
          pointerEvents="none"
          placeholder="Enter pickup location"
          placeholderTextColor="#687080"
          style={styles.pickupInput}
        />
      </View>
      <View style={styles.emptyActionRow}>
        <Pressable onPress={onPrimary} style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}>
          <AppIcon name="map-outline" size={22} color={BLUE} />
          <Text style={styles.emptyActionText}>Select via map</Text>
        </Pressable>
        <Pressable onPress={onSecondary} style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}>
          <AppIcon name="heart-outline" size={22} color={BLUE} />
          <Text style={styles.emptyActionText}>Saved places</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProgressBars() {
  return (
    <View style={styles.progressRow}>
      <View style={[styles.progressBar, styles.progressBarActive]} />
      <View style={styles.progressBar} />
      <View style={styles.progressBar} />
      <View style={styles.progressBar} />
    </View>
  );
}

function MaintenanceInfo() {
  return (
    <View style={styles.maintenanceInfo}>
      <View style={styles.clockCircle}>
        <AppIcon name="clock" size={22} color={BLUE} />
      </View>
      <View style={styles.maintenanceInfoCopy}>
        <Text style={styles.infoLabel}>Expected time</Text>
        <Text style={styles.infoValue}>Today, <Text style={styles.infoBlue}>02:30 PM IST</Text></Text>
      </View>
    </View>
  );
}

function PrimaryButton({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      {icon ? <AppIcon name={icon} size={18} color="#FFFFFF" /> : null}
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
      {icon ? <AppIcon name={icon} size={19} color="#1E2633" /> : null}
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export default function SystemStateLayout({
  variant = "empty",
  title,
  description,
  primaryLabel,
  secondaryLabel,
  primaryIcon,
  secondaryIcon,
  onPrimary,
  onSecondary,
  linkLabel,
  onLink
}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant !== "loading") return undefined;
    const animation = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1100, useNativeDriver: true }));
    animation.start();
    return () => animation.stop();
  }, [spin, variant]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.screen}>
        <View style={styles.content}>
          <Illustration variant={variant} spin={spin} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          {variant === "empty" ? <EmptyControls onPrimary={onPrimary} onSecondary={onSecondary} /> : null}
          {variant === "loading" ? <ProgressBars /> : null}
          {variant === "maintenance" ? <MaintenanceInfo /> : null}
          {primaryLabel ? <PrimaryButton label={primaryLabel} icon={primaryIcon} onPress={onPrimary} /> : null}
          {secondaryLabel ? <SecondaryButton label={secondaryLabel} icon={secondaryIcon} onPress={onSecondary} /> : null}
          {linkLabel ? (
            <Pressable onPress={onLink} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
              <Text style={styles.linkText}>{linkLabel}</Text>
            </Pressable>
          ) : null}
        </View>
        <View pointerEvents="none" style={styles.bottomStrip} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  barrier: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BLUE,
    overflow: "hidden"
  },
  bottomStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: "#FFFFFF",
    zIndex: 8
  },
  barrierLegLeft: {
    position: "absolute",
    bottom: 0,
    left: 34,
    width: 10,
    height: 22,
    backgroundColor: "#C8D3E4",
    transform: [{ rotate: "8deg" }]
  },
  barrierLegRight: {
    position: "absolute",
    bottom: 0,
    right: 34,
    width: 10,
    height: 22,
    backgroundColor: "#C8D3E4",
    transform: [{ rotate: "-8deg" }]
  },
  barrierStripe: {
    position: "absolute",
    width: 34,
    height: 88,
    top: -20,
    left: 15,
    backgroundColor: "#6EA3FF",
    transform: [{ rotate: "42deg" }]
  },
  barrierStripeThree: {
    left: 122
  },
  barrierStripeTwo: {
    left: 70
  },
  bigPin: {
    position: "absolute",
    right: 88,
    top: 88,
    width: 42,
    height: 58,
    borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center"
  },
  blueHillLeft: {
    position: "absolute",
    left: 14,
    bottom: 22,
    width: 36,
    height: 13,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#DCEBFF"
  },
  blueHillRight: {
    position: "absolute",
    right: 20,
    bottom: 22,
    width: 38,
    height: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#DCEBFF"
  },
  carBody: {
    width: 116,
    height: 32,
    borderRadius: 15,
    borderWidth: 1.3,
    borderColor: "#222831",
    backgroundColor: "#FFFFFF",
    transform: [{ skewX: "-8deg" }]
  },
  carWindow: {
    position: "absolute",
    left: 28,
    top: -12,
    width: 42,
    height: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 16,
    borderWidth: 1.2,
    borderColor: "#222831",
    backgroundColor: "#FFFFFF"
  },
  carWindowSmall: {
    position: "absolute",
    right: 22,
    top: -8,
    width: 24,
    height: 16,
    borderTopRightRadius: 12,
    borderWidth: 1.2,
    borderColor: "#222831",
    backgroundColor: "#FFFFFF"
  },
  carWrap: {
    position: "absolute",
    left: 95,
    bottom: 27,
    width: 130,
    height: 60
  },
  cityWrap: {
    position: "absolute",
    left: 50,
    right: 50,
    bottom: 16,
    height: 116
  },
  clockCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  cloud: {
    position: "absolute",
    width: 33,
    height: 13,
    borderBottomWidth: 1.2,
    borderColor: "#B5BCC7"
  },
  cloudBumpA: {
    position: "absolute",
    left: 4,
    bottom: -1,
    width: 13,
    height: 13,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: "#B5BCC7"
  },
  cloudBumpB: {
    position: "absolute",
    left: 15,
    bottom: -1,
    width: 16,
    height: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: "#B5BCC7"
  },
  cloudLeft: {
    left: 0,
    top: 4
  },
  cloudRight: {
    right: 0,
    top: 8
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  description: {
    marginTop: 10,
    maxWidth: 315,
    color: MUTED,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "500",
    textAlign: "center"
  },
  downloadCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center"
  },
  downloadText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "900"
  },
  emptyAction: {
    flex: 1,
    height: 52,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  emptyActionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16
  },
  emptyActionText: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800"
  },
  emptyControls: {
    alignSelf: "stretch",
    marginTop: 28
  },
  gearBubble: {
    position: "absolute",
    top: 12,
    left: 58,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#AAB6C8",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2
  },
  groundLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 22,
    height: 1.3,
    backgroundColor: "#ADB5C1"
  },
  illustration: {
    width: "100%",
    height: 232,
    alignItems: "center",
    justifyContent: "center"
  },
  infoBlue: {
    color: BLUE,
    fontWeight: "900"
  },
  infoLabel: {
    color: BLUE,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800"
  },
  infoValue: {
    marginTop: 4,
    color: TEXT,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  lineIcon: {
    marginRight: 8
  },
  linkButton: {
    marginTop: 25,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  linkText: {
    color: BLUE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  loadingCarBubble: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  loadingGraphic: {
    width: 142,
    height: 142,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingRing: {
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 7,
    borderColor: "#E8EDF5"
  },
  maintenanceInfo: {
    width: "92%",
    minHeight: 70,
    marginTop: 28,
    borderRadius: 16,
    backgroundColor: "#F4F7FC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18
  },
  maintenanceInfoCopy: {
    flex: 1
  },
  maintenanceWrap: {
    position: "absolute",
    width: 184,
    height: 118,
    bottom: 24
  },
  phoneNotch: {
    position: "absolute",
    top: 5,
    width: 30,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#0E1116"
  },
  phoneWrap: {
    position: "absolute",
    bottom: 26,
    width: 74,
    height: 116,
    borderRadius: 14,
    borderWidth: 1.8,
    borderColor: "#1B2230",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  pickupDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center"
  },
  pickupInput: {
    flex: 1,
    height: 46,
    padding: 0,
    color: TEXT,
    fontSize: 14,
    fontWeight: "600"
  },
  pickupInputWrap: {
    height: 50,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#24334D",
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 0
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.992 }]
  },
  primaryButton: {
    alignSelf: "stretch",
    height: 50,
    marginTop: 31,
    borderRadius: 20,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: BLUE,
    shadowOpacity: 0,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 8 },
    elevation: 0
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  progressBar: {
    flex: 1,
    height: 7,
    borderRadius: 8,
    backgroundColor: "#E2E6ED"
  },
  progressBarActive: {
    backgroundColor: BLUE
  },
  progressRow: {
    width: "68%",
    flexDirection: "row",
    gap: 7,
    marginTop: 40
  },
  ringBlueA: {
    position: "absolute",
    right: -7,
    top: 34,
    width: 15,
    height: 36,
    borderRadius: 9,
    backgroundColor: BLUE
  },
  ringBlueB: {
    position: "absolute",
    left: 18,
    bottom: 5,
    width: 13,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#6FA0FF"
  },
  ringBlueC: {
    position: "absolute",
    right: 20,
    bottom: 0,
    width: 13,
    height: 30,
    borderRadius: 9,
    backgroundColor: BLUE
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  secondaryButton: {
    alignSelf: "stretch",
    height: 50,
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  secondaryText: {
    color: "#1E2633",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800"
  },
  skyline: {
    position: "absolute",
    left: 30,
    right: 30,
    bottom: 24,
    height: 80
  },
  title: {
    marginTop: 10,
    color: TEXT,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.25
  },
  tower: {
    position: "absolute",
    bottom: 0,
    width: 14,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#DFE4EC",
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  tree: {
    position: "absolute",
    right: 40,
    bottom: 31,
    width: 17,
    height: 44,
    borderRadius: 9,
    backgroundColor: "#68A3FF"
  },
  warningBadge: {
    position: "absolute",
    right: -12,
    bottom: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.2,
    borderColor: "#AAB6C8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  warningBadgeText: {
    color: BLUE,
    fontSize: 22,
    fontWeight: "900"
  },
  warningMark: {
    position: "absolute",
    top: 38,
    left: 65,
    color: "#FFFFFF",
    fontSize: 58,
    lineHeight: 58,
    fontWeight: "900"
  },
  warningTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 66,
    borderRightWidth: 66,
    borderBottomWidth: 112,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: BLUE
  },
  warningWrap: {
    position: "absolute",
    bottom: 26,
    width: 144,
    height: 122,
    alignItems: "center"
  },
  wheel: {
    position: "absolute",
    bottom: 11,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#222831"
  },
  wheelLeft: {
    left: 18
  },
  wheelRight: {
    right: 22
  },
  wifiClose: {
    position: "absolute",
    right: 13,
    bottom: 15,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center"
  },
  wifiCloseText: {
    color: "#FFFFFF",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "700"
  },
  wifiCloud: {
    position: "absolute",
    width: 132,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.3,
    borderColor: "#AAB6C8",
    backgroundColor: "#FFFFFF"
  },
  wifiWrap: {
    position: "absolute",
    bottom: 28,
    width: 150,
    height: 112,
    alignItems: "center",
    justifyContent: "center"
  }
});
