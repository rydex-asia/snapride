import React, { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AccountPageHeader from "../../components/AccountPageHeader";

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const TRIP_MINUTES = 15;

const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
const PERIODS = ["am", "pm"];

function buildDays() {
  const now = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index);

    const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });
    const day = date.toLocaleDateString("en-IN", { day: "2-digit" });
    const month = date.toLocaleDateString("en-IN", { month: "short" });

    return {
      id: date.toISOString(),
      label: index === 0 ? "Today" : `${weekday}, ${day} ${month}`,
      date,
    };
  });
}

function clampIndex(index, length) {
  return Math.max(0, Math.min(index, length - 1));
}

function toDate(day, hourText, minuteText, period) {
  const value = new Date(day.date);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const normalizedHour = period === "pm" ? (hour % 12) + 12 : hour % 12;

  value.setHours(normalizedHour, minute, 0, 0);
  return value;
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(date) {
  const day = date.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
  return `${day}, ${formatTime(date)} IST`;
}

function SegmentedButton({ active, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.segmentButton, active && styles.segmentButtonActive, pressed && styles.pressed]}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PickerColumn({ data, selectedIndex, onChange, width, textAlign = "center", itemKey = (item) => String(item) }) {
  const listRef = useRef(null);

  const selectIndex = (index) => {
    const nextIndex = clampIndex(index, data.length);
    onChange(nextIndex);
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const handleMomentumEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    selectIndex(Math.round(offsetY / ITEM_HEIGHT));
  };

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item, index) => `${itemKey(item)}-${index}`}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      bounces={false}
      initialScrollIndex={selectedIndex}
      getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      contentContainerStyle={styles.pickerListContent}
      onMomentumScrollEnd={handleMomentumEnd}
      onScrollEndDrag={handleMomentumEnd}
      style={[styles.pickerColumn, { width }]}
      renderItem={({ item, index }) => {
        const active = index === selectedIndex;
        const distance = Math.abs(index - selectedIndex);

        return (
          <Pressable onPress={() => selectIndex(index)} style={styles.pickerItem}>
            <Text
              numberOfLines={1}
              style={[
                styles.pickerText,
                { textAlign },
                active && styles.pickerTextActive,
                distance === 1 && styles.pickerTextNear,
                distance > 1 && styles.pickerTextFar,
              ]}
            >
              {typeof item === "string" ? item : item.label}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

export default function ScheduleRideScreen({ onBack, onSchedule }) {
  const { width } = useWindowDimensions();
  const days = useMemo(buildDays, []);
  const now = useMemo(() => new Date(), []);
  const defaultHour = now.getHours() % 12 || 12;
  const defaultMinute = Math.min(55, Math.ceil((now.getMinutes() + 20) / 5) * 5);

  const [mode, setMode] = useState("pickup");
  const [dayIndex, setDayIndex] = useState(0);
  const [hourIndex, setHourIndex] = useState(HOURS.indexOf(String(defaultHour)));
  const [minuteIndex, setMinuteIndex] = useState(defaultMinute >= 60 ? 0 : defaultMinute);
  const [periodIndex, setPeriodIndex] = useState(now.getHours() >= 12 ? 1 : 0);

  const selectedDate = useMemo(() => {
    return toDate(days[dayIndex], HOURS[hourIndex], MINUTES[minuteIndex], PERIODS[periodIndex]);
  }, [dayIndex, days, hourIndex, minuteIndex, periodIndex]);

  const relatedDate = useMemo(() => {
    const value = new Date(selectedDate);
    value.setMinutes(value.getMinutes() + (mode === "pickup" ? TRIP_MINUTES : -TRIP_MINUTES));
    return value;
  }, [mode, selectedDate]);

  const primaryLabel = mode === "pickup" ? "drop-off time" : "pick-up time";
  const dayColumnWidth = Math.min(136, Math.max(112, width * 0.32));
  const numberColumnWidth = Math.min(50, Math.max(44, width * 0.12));
  const periodColumnWidth = Math.min(52, Math.max(46, width * 0.12));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.screen}>
        <AccountPageHeader title="Schedule ride" subtitle="Choose pickup or drop-off time" onBack={onBack} />

        <View style={styles.body}>
          <View style={styles.segmentShell}>
            <SegmentedButton active={mode === "pickup"} label="Pickup at" onPress={() => setMode("pickup")} />
            <SegmentedButton active={mode === "dropoff"} label="Dropoff by" onPress={() => setMode("dropoff")} />
          </View>

          <View style={styles.pickerShell}>
            <View style={styles.selectionBand} />
            <View style={styles.fadeTop} />
            <View style={styles.fadeBottom} />
            <PickerColumn
              data={days}
              selectedIndex={dayIndex}
              onChange={setDayIndex}
              width={dayColumnWidth}
              textAlign="right"
              itemKey={(item) => item.id}
            />
            <PickerColumn data={HOURS} selectedIndex={hourIndex} onChange={setHourIndex} width={numberColumnWidth} />
            <PickerColumn data={MINUTES} selectedIndex={minuteIndex} onChange={setMinuteIndex} width={numberColumnWidth} />
            <PickerColumn data={PERIODS} selectedIndex={periodIndex} onChange={setPeriodIndex} width={periodColumnWidth} textAlign="left" />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{formatTime(relatedDate)} IST {primaryLabel}</Text>
            <Text style={styles.summaryMeta}>About 15 min trip</Text>
            <Text style={styles.summaryDate}>{formatDateTime(selectedDate)}</Text>
          </View>
        </View>

        <View style={styles.fill} />

        <View style={styles.footer}>
          <Text style={styles.policyText} numberOfLines={3}>
            Standard Reserve Cancellation Policy: No cancellation fee up to an hour before pick-up or any time before your driver is assigned. <Text style={styles.termsText}>See Terms</Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onSchedule}
            style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]}
          >
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: 14,
  },
  continueButton: {
    height: 54,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.992 }],
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
  fadeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.84)",
    zIndex: 5,
    pointerEvents: "none",
  },
  fadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.84)",
    zIndex: 5,
    pointerEvents: "none",
  },
  fill: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  pickerColumn: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    zIndex: 10,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
  pickerListContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  pickerShell: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    marginHorizontal: 18,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    overflow: "hidden",
  },
  pickerText: {
    color: "#D6D6D6",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  pickerTextActive: {
    color: "#050505",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
  },
  pickerTextFar: {
    color: "#EFEFEF",
  },
  pickerTextNear: {
    color: "#B7B7B7",
    fontSize: 18,
  },
  policyText: {
    color: "#454545",
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.62,
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  segmentButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#050505",
  },
  segmentShell: {
    height: 54,
    marginHorizontal: 22,
    padding: 4,
    borderRadius: 15,
    backgroundColor: "#F1F1F1",
    flexDirection: "row",
  },
  segmentText: {
    color: "#666666",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: "#050505",
    fontWeight: "900",
  },
  selectionBand: {
    position: "absolute",
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  summaryCard: {
    marginHorizontal: 22,
    marginTop: 16,
    alignItems: "center",
  },
  summaryDate: {
    marginTop: 6,
    color: "#8B8B8B",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  summaryMeta: {
    marginTop: 5,
    color: "#646464",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  summaryTitle: {
    color: "#080808",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    textAlign: "center",
  },
  termsText: {
    color: "#111111",
    textDecorationLine: "underline",
    fontWeight: "900",
  },
});
